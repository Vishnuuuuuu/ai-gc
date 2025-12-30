/**
 * Chat API Route (STUB)
 *
 * This API endpoint will handle chat messages and coordinate
 * responses from multiple AI models.
 *
 * Endpoints:
 * - POST /api/chat - Send a message and get AI responses
 */

import { NextRequest, NextResponse } from "next/server";
import { orchestrateResponses } from "@/lib/orchestrator";

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
      return NextResponse.json(
        { error: "Invalid request: message and modelIds are required" },
        { status: 400 }
      );
    }

    // Call orchestrator to get AI responses
    const responses = await orchestrateResponses(body.message, {
      debateMode: body.debateMode,
      modelIds: body.modelIds,
      conversationHistory: body.conversationHistory,
    });

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

/**
 * Future endpoints to consider:
 *
 * GET /api/chat/[id] - Fetch chat history
 * DELETE /api/chat/[id] - Delete a chat
 * GET /api/chats - List all chats for a user
 */
