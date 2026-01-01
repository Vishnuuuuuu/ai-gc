/**
 * Chat API Route - Streaming Implementation
 *
 * This API endpoint handles chat messages and streams
 * responses from multiple AI models in real-time.
 *
 * Endpoints:
 * - POST /api/chat - Send a message and get streamed AI responses
 */

import { NextRequest } from "next/server";
import { orchestrateStreamingResponses } from "@/lib/orchestrator";

interface ChatRequest {
  chatId: string;
  message: string;
  modelIds: string[];
  debateMode: boolean;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    modelId?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    // Validate request
    if (!body.message || !body.modelIds || body.modelIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: message and modelIds are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a ReadableStream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream responses from orchestrator
          await orchestrateStreamingResponses(
            body.message,
            {
              debateMode: body.debateMode,
              modelIds: body.modelIds,
              conversationHistory: body.conversationHistory,
            },
            (event) => {
              // Send each event as SSE format
              const data = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          );

          // Send completion event
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorEvent = {
            type: "error",
            error: error instanceof Error ? error.message : "Internal server error",
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          controller.close();
        }
      },
    });

    // Return streaming response with SSE headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
