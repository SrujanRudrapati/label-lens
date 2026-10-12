import { isMock } from "@/lib/env";
import { errorResponse, jsonError, parseRequest } from "@/lib/http";
import { requireJpegBase64 } from "@/lib/guard";
import { replayAnalyze, shouldReplay } from "@/lib/mock";
import { runAnalysis } from "@/lib/pipeline";
import { AnalyzeRequest } from "@/lib/schema";

export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await parseRequest(req, AnalyzeRequest);

    if (shouldReplay(body.sampleId)) {
      if (!body.sampleId) return jsonError(400, "mock_no_sample", "No API key here. Try a sample.");
      const analysis = await replayAnalyze({ ...body, sampleId: body.sampleId });
      return Response.json({ analysis, source: "saved" });
    }
    if (isMock()) return jsonError(400, "mock_no_sample", "No API key here. Try a sample.");

    const analysis = await runAnalysis(requireJpegBase64(body.image), body.profile, body.language, req.signal);
    return Response.json({ analysis, source: "live" });
  } catch (e) {
    return errorResponse(e);
  }
}
