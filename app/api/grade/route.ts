import { gradeRebuttal } from "@/lib/grader";
import { isGradeRequest } from "@/lib/types";

/**
 * POST /api/grade
 *
 * Takes a `RebuttalSubmission`, returns an `Evaluation`.
 *
 * Unary rather than streamed: a score and three sentences aren't worth the
 * complexity of a stream, and the UI has nothing useful to show until the whole
 * grade is in. Grading logic lives in `lib/grader.ts` — this layer only handles
 * HTTP.
 *
 * The default offline grader needs no key, but the route stays server-side
 * regardless, so switching `GRADER_CONFIG.mode` to `claude` never has to move
 * code across the client boundary.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isGradeRequest(body)) {
    return Response.json(
      { error: "Expected { quote, tacticId, tacticName, tacticExplanation, response }." },
      { status: 400 },
    );
  }

  try {
    return Response.json(await gradeRebuttal(body, request.signal));
  } catch (error) {
    // An abort is the client navigating away, not a failure worth logging.
    if (request.signal.aborted) return new Response(null, { status: 499 });

    console.error("[api/grade] grading failed:", error);
    return Response.json(
      { error: "The grader is unavailable. Your answer is still here — try again." },
      { status: 502 },
    );
  }
}
