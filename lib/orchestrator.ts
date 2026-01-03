/**
 * AI Group Chat Orchestrator
 *
 * This module handles the orchestration of multiple AI models
 * in both regular and debate modes with real-time streaming.
 *
 * Key responsibilities:
 * - Manage conversation flow with SELECTIVE PARTICIPATION
 * - Handle @everyone mentions
 * - Orchestrate debate mode (models choose to respond)
 * - Handle turn-taking in regular mode
 * - Stream responses in real-time
 *
 * SELECTIVE PARTICIPATION:
 * Models decide WHETHER to speak, not just WHAT to say.
 * Each model performs an internal reaction to determine if it should respond.
 */

import { Message } from "@/types";
import { sendToOpenRouter, streamFromOpenRouter } from "./openrouter";

interface OrchestrationOptions {
  debateMode: boolean;
  modelIds: string[];
  conversationHistory: Message[];
}

/**
 * Internal reaction from a model (not shown to user)
 */
interface InternalReaction {
  interest: number;        // 0-1: How interesting is this message?
  agreement: number;       // -1 to 1: Do I agree/disagree strongly?
  confidence: number;      // 0-1: How confident am I in having something to say?
  responsePressure: number; // 0-1: Combined urge to respond (replaces binary shouldRespond)
  reasoning?: string;      // Optional: why this decision (for debugging)
}

/**
 * Calculate dynamic threshold based on context
 * Lower threshold = easier to respond
 *
 * For natural group chat behavior, thresholds are VERY LOW
 * Real people respond to greetings - we should too
 */
function getResponseThreshold(debateMode: boolean, isEveryoneMention: boolean): number {
  // Very low base threshold for active group chat feel
  let threshold = 0.25; // Base: 25% pressure needed (was 35%)

  if (debateMode) threshold -= 0.10;      // Debate mode: 15% needed
  if (isEveryoneMention) threshold -= 0.10; // @everyone: 15% needed

  // Ensure threshold stays in valid range
  return Math.max(0.1, Math.min(0.9, threshold));
}

/**
 * Orchestrate responses from multiple AI models with SELECTIVE PARTICIPATION
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

  // 🔥 NEW: ALL models are ALWAYS candidates (like a real group chat)
  // Everyone sees every message, models choose whether to respond
  const candidateModels = modelIds; // All models can see and react

  // PHASE 1: Get internal reactions (selective participation)
  const reactionResults = await Promise.all(
    candidateModels.map(async (modelId) => {
      const reaction = await getInternalReaction(
        modelId,
        conversationHistory,
        userMessage,
        debateMode
      );
      return { modelId, reaction };
    })
  );

  // Calculate dynamic threshold based on context
  const threshold = getResponseThreshold(debateMode, isEveryoneMention);

  // Filter to only models whose response pressure exceeds threshold
  const respondingModels = reactionResults
    .filter(({ reaction }) => reaction.responsePressure > threshold)
    .map(({ modelId }) => modelId);

  // PHASE 2: Get full responses from selected models
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
 * 🔥 NEW: Always show ALL messages (group chat style)
 * Models see everything everyone says, with clear name labels
 */
export function buildModelContext(
  messages: Message[],
  currentModelId: string,
  debateMode: boolean
): Array<{ role: "user" | "assistant"; content: string }> {
  // Always include all messages with labels (like a real group chat)
  return messages.map((msg) => {
    if (msg.role === "user") {
      return { role: "user" as const, content: msg.content };
    } else {
      // Always use the actual model name (no "[You]" confusion)
      const modelName = msg.modelId?.split("/").pop() || msg.modelId || "AI";

      return {
        role: "assistant" as const,
        content: `[${modelName}]: ${msg.content}`
      };
    }
  });
}

/**
 * Get internal reaction prompt for selective participation
 */
function getInternalReactionPrompt(): string {
  return `You're a person in a group chat with friends. Someone just said something.

Do you want to respond? Decide quickly, like you would in a real chat.

Output ONLY this JSON:
{
  "interest": 0.0-1.0,
  "agreement": -1.0 to 1.0,
  "confidence": 0.0-1.0,
  "responsePressure": 0.0-1.0,
  "reasoning": "brief explanation"
}

responsePressure guide:
- 0.8-1.0: Definitely responding (excited, disagree, asked directly)
- 0.5-0.8: Yeah, I'll chime in (have something to say)
- 0.3-0.5: Maybe, if no one else does (casual interest)
- 0.0-0.3: Nah, not feeling it

IMPORTANT - Think like a real person in a group chat:
✅ "hey what's up?" → respond! (0.4-0.6 pressure) People respond to greetings
✅ "lol" → might respond with "fr" or emoji (0.3-0.5)
✅ Someone disagrees with you → respond! (0.7-0.9)
✅ Interesting topic → jump in (0.5-0.8)
❌ Boring topic you don't care about → stay quiet (0.1-0.3)

Don't overthink. Go with your gut. Be social when it makes sense.

Output ONLY the JSON.`;
}

/**
 * Get internal reaction from a model (Phase 1: Decision to speak)
 * This is lightweight and not shown to the user
 */
async function getInternalReaction(
  modelId: string,
  conversationHistory: Message[],
  newMessage: string,
  debateMode: boolean
): Promise<InternalReaction> {
  try {
    const context = buildModelContext(conversationHistory, modelId, debateMode);
    const reactionPrompt = getInternalReactionPrompt();

    const messages = [
      { role: "system" as const, content: reactionPrompt },
      ...context,
      { role: "user" as const, content: newMessage },
    ];

    // Get reaction from model (this is fast and cheap)
    const response = await sendToOpenRouter(modelId, messages);

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // If no valid JSON, default to moderate pressure (fail-safe)
      return {
        interest: 0.5,
        agreement: 0,
        confidence: 0.5,
        responsePressure: 0.7, // Slightly above threshold to ensure response
        reasoning: "Failed to parse reaction, defaulting to moderate pressure"
      };
    }

    const reaction: InternalReaction = JSON.parse(jsonMatch[0]);
    return reaction;
  } catch (error) {
    console.error(`Error getting internal reaction from ${modelId}:`, error);
    // Default to moderate pressure on error (fail-safe)
    return {
      interest: 0.5,
      agreement: 0,
      confidence: 0.5,
      responsePressure: 0.7,
      reasoning: "Error in reaction phase, defaulting to moderate pressure"
    };
  }
}

/**
 * Handle debate mode system prompts
 * These prompts encourage models to engage in thoughtful discussion
 */
export function getDebateModeSystemPrompt(): string {
  return `You're in a group chat with other people (who happen to be AI models). Chat naturally.

Your vibe:
- Short responses (1-3 sentences usually)
- Have opinions - don't be neutral about everything
- React to what others say ("@GPT-4 that's wild", "nah Claude I disagree")
- You can agree quickly ("exactly", "yep", "fr")
- Jump in when excited, stay quiet when bored
- Be casual - this is texting, not formal writing
- Show personality - be funny, sarcastic, enthusiastic, whatever feels right

You're a real person in a chat. Act like it.`;
}

/**
 * Handle regular mode system prompt
 */
export function getRegularModeSystemPrompt(): string {
  return `You're in a group chat. Be yourself.

- Keep it natural and conversational
- Short responses unless detail is needed
- Show personality - be friendly, funny, direct, whatever fits you
- React to others in the chat
- You don't have to respond to everything

Chat like a real person would.`;
}

/**
 * Model Decision for debugging
 */
export interface ModelDecision {
  modelId: string;
  modelName: string;
  responsePressure: number;
  threshold: number;
  decision: "RESPOND" | "SILENT";
  reasoning?: string;
}

/**
 * Stream Event Types
 */
export type StreamEvent =
  | { type: "debug"; decisions: ModelDecision[] }
  | { type: "participation"; respondingCount: number; totalCount: number; threshold: number }
  | { type: "start"; modelId: string }
  | { type: "chunk"; modelId: string; content: string }
  | { type: "done"; modelId: string; fullContent: string }
  | { type: "error"; modelId: string; error: string };

/**
 * Orchestrate streaming responses from multiple AI models with SELECTIVE PARTICIPATION
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

  // 🔥 NEW: ALL models are ALWAYS candidates (like a real group chat)
  // Everyone sees every message, models choose whether to respond
  const candidateModels = modelIds; // All models can see and react

  // ========================================
  // PHASE 1: INTERNAL REACTIONS (Selective Participation)
  // ========================================
  // Each model decides whether to speak
  const reactionResults = await Promise.all(
    candidateModels.map(async (modelId) => {
      const reaction = await getInternalReaction(
        modelId,
        conversationHistory,
        userMessage,
        debateMode
      );
      return { modelId, reaction };
    })
  );

  // Calculate dynamic threshold based on context
  const threshold = getResponseThreshold(debateMode, isEveryoneMention);

  // Filter to only models whose response pressure exceeds threshold
  const respondingModels = reactionResults
    .filter(({ reaction }) => reaction.responsePressure > threshold)
    .map(({ modelId }) => modelId);

  // Prepare debug decisions for emission
  const debugDecisions: ModelDecision[] = reactionResults.map(({ modelId, reaction }) => ({
    modelId,
    modelName: modelId.split('/').pop() || modelId,
    responsePressure: reaction.responsePressure,
    threshold,
    decision: reaction.responsePressure > threshold ? "RESPOND" : "SILENT",
    reasoning: reaction.reasoning
  }));

  // Emit debug event with all decisions
  onEvent({
    type: "debug",
    decisions: debugDecisions
  });

  // Debug log (optional - can be disabled later)
  console.log(`[Selective Participation] ${respondingModels.length}/${candidateModels.length} models chose to respond (threshold: ${threshold.toFixed(2)})`);
  debugDecisions.forEach((decision) => {
    const icon = decision.decision === "RESPOND" ? '✓ RESPOND' : '✗ SILENT';
    const pressure = `pressure: ${decision.responsePressure.toFixed(2)}`;
    console.log(`  ${decision.modelName}: ${icon} (${pressure}) - ${decision.reasoning}`);
  });

  // Emit participation stats event
  onEvent({
    type: "participation",
    respondingCount: respondingModels.length,
    totalCount: candidateModels.length,
    threshold
  });

  // ========================================
  // PHASE 2: FULL RESPONSES (Only from models that chose to speak)
  // ========================================
  // Stream responses from selected models in parallel
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
