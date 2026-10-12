import { ZodError, type z } from "zod";
import { APIError } from "@anthropic-ai/sdk";
import { ModelOutputError } from "./callTool";
import { GuardError, rateLimit, readJson } from "./guard";

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export function jsonError(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } } satisfies ApiErrorBody, { status });
}

/** Rate-limits, reads the body under the size cap, and validates it against the schema. */
export async function parseRequest<S extends z.ZodType>(req: Request, schema: S): Promise<z.infer<S>> {
  rateLimit(req);
  return schema.parse(await readJson(req));
}

/** Maps known failures to calm user-facing responses; details go to the server log only. */
export function errorResponse(e: unknown): Response {
  if (e instanceof GuardError) return jsonError(e.status, e.code, e.message);
  if (e instanceof ZodError) return jsonError(400, "bad_request", "The request was not in the expected format.");
  if (e instanceof ModelOutputError) {
    console.error("[model-output]", e.detail);
    return jsonError(502, "model_output", "Couldn't read this label clearly. Retake the photo?");
  }
  if (e instanceof Error && e.name === "AbortError") return jsonError(499, "aborted", "Request cancelled.");
  if (e instanceof APIError) {
    console.error("[anthropic]", e.status, e.message);
    return jsonError(502, "upstream", "The reading service is busy. Please try again in a moment.");
  }
  console.error("[unhandled]", e);
  return jsonError(500, "internal", "Something went wrong on our side. Please try again.");
}
