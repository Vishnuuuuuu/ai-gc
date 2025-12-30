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
 * @param modelId - The model identifier (e.g., "openai/gpt-4o")
 * @param messages - Conversation history
 * @returns AI response
 */
export async function sendToOpenRouter(
  modelId: string,
  messages: OpenRouterMessage[]
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured. Please add it to your .env.local file.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "AI Group Chat",
    },
    body: JSON.stringify({
      model: modelId, // Use full model ID (e.g., "openai/gpt-4o")
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter API Error: ${error.error?.message || response.statusText}`);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0].message.content;
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
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured. Please add it to your .env.local file.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "AI Group Chat",
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      stream: true, // Enable streaming
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter API Error: ${error.error?.message || response.statusText}`);
  }

  // Read the streaming response
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("Response body is not readable");
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}
