import { isMock } from "@/lib/env";
import { errorResponse, jsonError, parseRequest } from "@/lib/http";
import { requireJpegBase64 } from "@/lib/guard";
import { loadFixture, shouldReplay } from "@/lib/mock";
import { runQuick } from "@/lib/pipeline";
import { QuickRequest } from "@/lib/schema";

export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await parseRequest(req, QuickRequest);

    if (shouldReplay(body.sampleId)) {
      if (!body.sampleId) return noKeyResponse();
      const fixture = await loadFixture(body.sampleId, "en");
      return Response.json({ quick: fixture.quick, source: "saved" });
    }
    if (isMock()) return noKeyResponse();

    const quick = await runQuick(requireJpegBase64(body.image), req.signal);
    return Response.json({ quick, source: "live" });
  } catch (e) {
    return errorResponse(e);
  }
}

function noKeyResponse(): Response {
  return jsonError(400, "mock_no_sample", "No API key here. Try a sample.");
}
