import { runAgent } from "@/lib/agent";
import { isChatRequest } from "@/lib/types";

/**
 * POST /api/chat
 *
 * Takes `{ messages }`, streams back plain UTF-8 text as the agent produces it.
 *
 * You shouldn't need to touch this file to build the agent — implement
 * `runAgent` in `lib/agent.ts` instead. This layer only handles HTTP concerns:
 * validating the body, turning the generator into a stream, and making sure a
 * failure surfaces to the client instead of hanging the connection.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isChatRequest(body)) {
    return Response.json(
      { error: "Expected { messages: { role, content }[] }." },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of runAgent(body.messages, request.signal)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        // The client has already received a 200 and possibly some text, so we
        // can't change the status code. Append a visible marker and close the
        // stream cleanly rather than letting the request time out.
        if (!request.signal.aborted) {
          console.error("[api/chat] agent failed:", error);
          controller.enqueue(encoder.encode("\n\n[Error: the agent failed. Check the server logs.]"));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Stops proxies from buffering the response and defeating streaming.
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
