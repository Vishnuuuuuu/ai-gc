/**
 * AI Group Chat Orchestrator (STUB)
 *
 * This module handles the orchestration of multiple AI models
 * in both regular and debate modes.
 *
 * Key responsibilities:
 * - Manage conversation flow
 * - Handle @everyone mentions
 * - Orchestrate debate mode (all models respond)
 * - Handle turn-taking in regular mode
 */

import { Message } from "@/types";
import { sendToOpenRouter } from "./openrouter";

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
  return `You are participating in a group discussion with other AI models.
Please engage thoughtfully with the user's questions and other models' responses.
Be respectful but don't hesitate to present different perspectives or challenge ideas constructively.`;
}

/**
 * Handle regular mode system prompt
 */
export function getRegularModeSystemPrompt(): string {
  return `You are an AI assistant helping the user with their questions.
Provide helpful, accurate, and concise responses.`;
}
