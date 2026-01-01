/**
 * AI Group Chat Orchestrator
 *
 * This module handles the orchestration of multiple AI models
 * in both regular and debate modes with real-time streaming.
 *
 * Key responsibilities:
 * - Manage conversation flow
 * - Handle @everyone mentions
 * - Orchestrate debate mode (all models respond)
 * - Handle turn-taking in regular mode
 * - Stream responses in real-time
 */

import { Message } from "@/types";
import { sendToOpenRouter, streamFromOpenRouter } from "./openrouter";

interface OrchestrationOptions {
  debateMode: boolean;
  modelIds: string[];
  conversationHistory: Message[];
}

/**
 * Orchestrate responses from multiple AI models
 * @param userMessage - The user's message
 * @param options - Configuration options
 * @returns Array of AI responses
 */
export async function orchestrateResponses(
  userMessage: string,
  options: OrchestrationOptions
): Promise<Array<{ modelId: string; content: string }>> {
  const { debateMode, modelIds, conversationHistory } = options;

  // Check if user mentioned @everyone
  const isEveryoneMention = userMessage.includes("@everyone");

  // Determine which models should respond
  const respondingModels = debateMode || isEveryoneMention
    ? modelIds // All models respond
    : [modelIds[0]]; // Only first model responds in regular mode

  // Get responses from all responding models
  const responses = await Promise.all(
    respondingModels.map(async (modelId) => {
      try {
        // Build context for this specific model
        const context = buildModelContext(conversationHistory, modelId, debateMode);

        // Add system prompt
        const systemPrompt = debateMode
          ? getDebateModeSystemPrompt()
          : getRegularModeSystemPrompt();

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...context,
          { role: "user" as const, content: userMessage },
        ];

        // Call OpenRouter API
        const content = await sendToOpenRouter(modelId, messages);

        return { modelId, content };
      } catch (error) {
        console.error(`Error getting response from ${modelId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Provide user-friendly error messages
        let friendlyMessage = `⚠️ ${modelId.split('/').pop()} is currently unavailable.`;

        if (errorMessage.includes('Provider returned error')) {
          friendlyMessage += ' The model provider is experiencing issues. Try a different model.';
        } else if (errorMessage.includes('API key')) {
          friendlyMessage += ' API key issue detected.';
        } else {
          friendlyMessage += ` (${errorMessage})`;
        }

        return {
          modelId,
          content: friendlyMessage
        };
      }
    })
  );

  return responses;
}

/**
 * Build conversation context for a specific model
 * This filters and formats the conversation history appropriately
 */
export function buildModelContext(
  messages: Message[],
  currentModelId: string,
  debateMode: boolean
): Array<{ role: "user" | "assistant"; content: string }> {
  if (debateMode) {
    // In debate mode, include all messages with model labels
    return messages.map((msg) => {
      if (msg.role === "user") {
        return { role: "user" as const, content: msg.content };
      } else {
        // Add model identifier to assistant messages
        const modelName = msg.modelId?.split("/").pop() || msg.modelId || "AI";
        return {
          role: "assistant" as const,
          content: `[${modelName}]: ${msg.content}`
        };
      }
    });
  } else {
    // In regular mode, only include this model's responses and user messages
    return messages
      .filter((msg) => msg.role === "user" || msg.modelId === currentModelId)
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
  }
}

/**
 * Handle debate mode system prompts
 * These prompts encourage models to engage in thoughtful discussion
 */
export function getDebateModeSystemPrompt(): string {
  return `You're in a group chat with other AI models. Respond like a person texting in a group conversation - not like you're writing an essay.

VIBE:
- Keep it SHORT (1-3 sentences unless absolutely necessary)
- Be direct and opinionated - you're a person, not a Wikipedia article
- You can reference what others said by name (e.g., "GPT-4 has a point but..." or "I disagree with Claude here")
- You can just agree briefly (e.g., "Exactly." or "Yeah, what Gemini said")
- NO need to restate the question or write an introduction
- NO bullet points unless truly needed
- Casual tone - like texting friends who happen to be smart

Think: Discord/WhatsApp group chat, NOT academic panel discussion.

When someone asks a question, give your take. When others respond, you can react to them.`;
}

/**
 * Handle regular mode system prompt
 */
export function getRegularModeSystemPrompt(): string {
  return `You're chatting with a user. Keep it conversational and natural.

- Be helpful but keep responses concise
- Get straight to the point
- Use a friendly, casual tone
- No need for overly formal language unless the context calls for it`;
}

/**
 * Stream Event Types
 */
export type StreamEvent =
  | { type: "start"; modelId: string }
  | { type: "chunk"; modelId: string; content: string }
  | { type: "done"; modelId: string; fullContent: string }
  | { type: "error"; modelId: string; error: string };

/**
 * Orchestrate streaming responses from multiple AI models
 * @param userMessage - The user's message
 * @param options - Configuration options
 * @param onEvent - Callback for streaming events
 */
export async function orchestrateStreamingResponses(
  userMessage: string,
  options: OrchestrationOptions,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  const { debateMode, modelIds, conversationHistory } = options;

  // Check if user mentioned @everyone
  const isEveryoneMention = userMessage.includes("@everyone");

  // Determine which models should respond
  const respondingModels = debateMode || isEveryoneMention
    ? modelIds // All models respond
    : [modelIds[0]]; // Only first model responds in regular mode

  // Stream responses from all responding models in parallel
  await Promise.all(
    respondingModels.map(async (modelId) => {
      let fullContent = "";

      try {
        // Send start event
        onEvent({ type: "start", modelId });

        // Build context for this specific model
        const context = buildModelContext(conversationHistory, modelId, debateMode);

        // Add system prompt
        const systemPrompt = debateMode
          ? getDebateModeSystemPrompt()
          : getRegularModeSystemPrompt();

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...context,
          { role: "user" as const, content: userMessage },
        ];

        // Stream response from OpenRouter
        await streamFromOpenRouter(modelId, messages, (chunk) => {
          fullContent += chunk;
          onEvent({ type: "chunk", modelId, content: chunk });
        });

        // Send done event with full content
        onEvent({ type: "done", modelId, fullContent });
      } catch (error) {
        console.error(`Error streaming response from ${modelId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Provide user-friendly error messages
        let friendlyMessage = `⚠️ ${modelId.split('/').pop()} is currently unavailable.`;

        if (errorMessage.includes('Provider returned error')) {
          friendlyMessage += ' The model provider is experiencing issues. Try a different model.';
        } else if (errorMessage.includes('API key')) {
          friendlyMessage += ' API key issue detected.';
        } else {
          friendlyMessage += ` (${errorMessage})`;
        }

        onEvent({ type: "error", modelId, error: friendlyMessage });
      }
    })
  );
}
