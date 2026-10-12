import { z } from "zod";
import { Analysis, QuickResult, type Profile } from "./schema";
import type { SampleId } from "./samples";

export type FailureKind = "unreadable" | "bad_photo" | "network" | "rate_limited" | "server" | "no_key";

export class ScanFailure extends Error {
  constructor(readonly kind: FailureKind, detail?: string) {
    super(detail ?? kind);
    this.name = "ScanFailure";
  }
}

export type Source = "saved" | "live";

const SourceSchema = z.enum(["saved", "live"]);
const QuickResponse = z.object({ quick: QuickResult, source: SourceSchema });
const AnalyzeResponse = z.object({ analysis: Analysis, source: SourceSchema });
const ErrorBody = z.object({ error: z.object({ code: z.string(), message: z.string() }) });

export type QuickResponse = z.infer<typeof QuickResponse>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponse>;

const UNREADABLE_CODES = new Set(["bad_image", "too_large"]);

/** Maps an HTTP failure from our own routes to the kind of help the user needs next. */
export function failureFromResponse(status: number, body: unknown): ScanFailure {
  const parsed = ErrorBody.safeParse(body);
  const code = parsed.success ? parsed.data.error.code : "";
  if (status === 429 || code === "rate_limited") return new ScanFailure("rate_limited");
  if (code === "mock_no_sample") return new ScanFailure("no_key");
  if (UNREADABLE_CODES.has(code)) return new ScanFailure("unreadable", code);
  return new ScanFailure("server", `${status} ${code}`);
}

export function isAbort(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

async function postJson<S extends z.ZodType>(url: string, payload: unknown, schema: S, signal: AbortSignal): Promise<z.infer<S>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (e) {
    if (isAbort(e)) throw e;
    throw new ScanFailure("network", e instanceof Error ? e.message : undefined);
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw failureFromResponse(res.status, body);

  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ScanFailure("server", "response failed validation");
  return parsed.data;
}

interface ScanPayload {
  image: string;
  sampleId?: SampleId;
}

export function postQuick(payload: ScanPayload, signal: AbortSignal): Promise<QuickResponse> {
  return postJson("/api/quick", payload, QuickResponse, signal);
}

export function postAnalyze(
  payload: ScanPayload & { profile: Profile; language: string },
  signal: AbortSignal,
): Promise<AnalyzeResponse> {
  return postJson("/api/analyze", payload, AnalyzeResponse, signal);
}

