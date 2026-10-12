import { isMock } from "./env";

export const MAX_BODY_BYTES = 4 * 1024 * 1024;
const BUCKET_CAPACITY = 20;
const REFILL_MS = 3_000;
const MAX_TRACKED_IPS = 5_000;
const JPEG_MAGIC = [0xff, 0xd8, 0xff];

export class GuardError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
    this.name = "GuardError";
  }
}

/** Reads and parses a JSON body, rejecting anything over the byte limit before it is buffered whole. */
export async function readJson(req: Request, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) throw tooLarge();
  if (!req.body) throw new GuardError(400, "bad_request", "Request body is empty.");

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw tooLarge();
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new GuardError(400, "bad_request", "Request body is not valid JSON.");
  }
}

function tooLarge(): GuardError {
  return new GuardError(413, "too_large", "That photo is too large. Try again with a smaller one.");
}

/** Accepts raw base64 or a data URL; returns raw base64 once the bytes look like a JPEG. */
export function requireJpegBase64(image: string): string {
  const raw = image.replace(/^data:image\/jpeg;base64,/, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) {
    throw new GuardError(400, "bad_image", "That image could not be read. Please retake the photo.");
  }
  const head = Buffer.from(raw.slice(0, 8), "base64");
  if (!JPEG_MAGIC.every((byte, i) => head[i] === byte)) {
    throw new GuardError(400, "bad_image", "That image is not a JPEG. Please retake the photo.");
  }
  return raw;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}
const buckets = new Map<string, Bucket>();

/** Vercel sets x-vercel-forwarded-for itself; otherwise the LAST x-forwarded-for hop is the one our proxy added (earlier hops are client-controlled). */
function clientIp(req: Request): string {
  const vercel = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;
  const hops = req.headers.get("x-forwarded-for")?.split(",").map((h) => h.trim()).filter(Boolean) ?? [];
  return hops.at(-1) || req.headers.get("x-real-ip") || "unknown";
}

/** Whole-instance backstop so rotating IPs cannot drain the demo's spend cap. */
const GLOBAL_CAPACITY = 120;
const GLOBAL_REFILL_MS = 2_000;
let globalBucket: Bucket = { tokens: GLOBAL_CAPACITY, updatedAt: 0 };

function takeToken(prev: Bucket, capacity: number, refillMs: number, now: number): Bucket | null {
  const refilled = Math.min(capacity, prev.tokens + Math.max(0, now - prev.updatedAt) / refillMs);
  return refilled < 1 ? null : { tokens: refilled - 1, updatedAt: now };
}

/**
 * Best-effort per-IP token bucket. State lives in this serverless instance only,
 * so it slows abuse but is not a hard limit. Mock mode costs nothing and is not limited.
 */
export function rateLimit(req: Request, now = Date.now()): void {
  if (isMock()) return;
  // Drop the oldest tracked IP instead of clearing everyone's state.
  if (buckets.size > MAX_TRACKED_IPS) buckets.delete(buckets.keys().next().value as string);

  const nextGlobal = takeToken(globalBucket, GLOBAL_CAPACITY, GLOBAL_REFILL_MS, now);
  if (!nextGlobal) throw new GuardError(429, "rate_limited", "Label Lens is busy right now. Try again in a minute, or use a sample.");

  const ip = clientIp(req);
  const next = takeToken(buckets.get(ip) ?? { tokens: BUCKET_CAPACITY, updatedAt: now }, BUCKET_CAPACITY, REFILL_MS, now);
  if (!next) throw new GuardError(429, "rate_limited", "Too many requests. Wait a few seconds and try again.");
  globalBucket = nextGlobal;
  buckets.set(ip, next);
}

export function resetRateLimit(): void {
  buckets.clear();
  globalBucket = { tokens: GLOBAL_CAPACITY, updatedAt: 0 };
}
