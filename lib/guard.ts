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

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/**
 * Best-effort per-IP token bucket. State lives in this serverless instance only,
 * so it slows abuse but is not a hard limit. Mock mode costs nothing and is not limited.
 */
export function rateLimit(req: Request, now = Date.now()): void {
  if (isMock()) return;
  if (buckets.size > MAX_TRACKED_IPS) buckets.clear();

  const ip = clientIp(req);
  const prev = buckets.get(ip) ?? { tokens: BUCKET_CAPACITY, updatedAt: now };
  const refilled = Math.min(BUCKET_CAPACITY, prev.tokens + (now - prev.updatedAt) / REFILL_MS);
  if (refilled < 1) {
    buckets.set(ip, { tokens: refilled, updatedAt: now });
    throw new GuardError(429, "rate_limited", "Too many requests. Wait a few seconds and try again.");
  }
  buckets.set(ip, { tokens: refilled - 1, updatedAt: now });
}

export function resetRateLimit(): void {
  buckets.clear();
}
