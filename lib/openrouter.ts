/**
 * OpenRouter API Integration (STUB)
 *
 * This file will handle communication with OpenRouter API.
 * OpenRouter provides unified access to multiple AI models.
 *
 * Setup required:
 * 1. Get API key from https://openrouter.ai/keys
 * 2. Add OPENROUTER_API_KEY to .env.local
 * 3. Implement the functions below
 *
 * API Documentation: https://openrouter.ai/docs
 */

interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenRouterRequest {
  model: string; // e.g., "openai/gpt-4o"
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

/**
 * Send a message to a specific model via OpenRouter
 * @param modelId - The model identifier (e.g., "gpt-4o")
 * @param messages - Conversation history
 * @returns AI response
 */
export async function sendToOpenRouter(
  modelId: string,
  messages: OpenRouterMessage[]
): Promise<string> {
  // TODO: Implement actual API call
  // const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     model: `openai/${modelId}`, // Map to OpenRouter format
  //     messages,
  //   }),
  // });
  //
  // const data: OpenRouterResponse = await response.json();
  // return data.choices[0].message.content;

  throw new Error("OpenRouter integration not implemented yet");
}

/**
 * Stream a response from OpenRouter (for real-time streaming)
 * @param modelId - The model identifier
 * @param messages - Conversation history
 * @param onChunk - Callback for each chunk of text
 */
export async function streamFromOpenRouter(
  modelId: string,
  messages: OpenRouterMessage[],
  onChunk: (text: string) => void
): Promise<void> {
  // TODO: Implement streaming
  // This will use Server-Sent Events (SSE) or similar
  throw new Error("Streaming not implemented yet");
}
