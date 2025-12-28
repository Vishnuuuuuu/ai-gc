import { Model } from "@/types";

export const AVAILABLE_MODELS: Model[] = [
  // OpenAI models
  {
    id: "gpt-4o",
    displayName: "GPT-4o",
    provider: "openrouter",
    logo: "/models/gpt.png",
    supportsImages: true,
    supportsDebate: true,
  },
  {
    id: "gpt-4-turbo",
    displayName: "GPT-4 Turbo",
    provider: "openrouter",
    logo: "/models/gpt.png",
    supportsImages: true,
    supportsDebate: true,
  },
  {
    id: "gpt-3.5-turbo",
    displayName: "GPT-3.5 Turbo",
    provider: "openrouter",
    logo: "/models/gpt.png",
    supportsImages: false,
    supportsDebate: true,
  },

  // Anthropic models
  {
    id: "claude-3-opus",
    displayName: "Claude 3 Opus",
    provider: "openrouter",
    logo: "/models/claude.png",
    supportsImages: true,
    supportsDebate: true,
  },
  {
    id: "claude-3-sonnet",
    displayName: "Claude 3 Sonnet",
    provider: "openrouter",
    logo: "/models/claude.png",
    supportsImages: true,
    supportsDebate: true,
  },
  {
    id: "claude-3-haiku",
    displayName: "Claude 3 Haiku",
    provider: "openrouter",
    logo: "/models/claude.png",
    supportsImages: true,
    supportsDebate: true,
  },

  // Google models
  {
    id: "gemini-pro",
    displayName: "Gemini Pro",
    provider: "openrouter",
    logo: "/models/gemini.png",
    supportsImages: true,
    supportsDebate: true,
  },
  {
    id: "gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    provider: "openrouter",
    logo: "/models/gemini.png",
    supportsImages: true,
    supportsDebate: true,
  },

  // xAI models
  {
    id: "grok-2",
    displayName: "Grok 2",
    provider: "openrouter",
    logo: "/models/grok.png",
    supportsImages: false,
    supportsDebate: true,
  },
  {
    id: "grok-beta",
    displayName: "Grok Beta",
    provider: "openrouter",
    logo: "/models/grok.png",
    supportsImages: false,
    supportsDebate: true,
  },
];

// Mock response generator for testing
export const generateMockResponse = (modelId: string, userMessage: string): string => {
  const responses: Record<string, string> = {
    "gpt-4o": `GPT-4o here. I understand you said: "${userMessage}". This is a mock response.`,
    "gpt-4-turbo": `GPT-4 Turbo responding: I've analyzed your message and here's my mock insight.`,
    "gpt-3.5-turbo": `GPT-3.5 here with a quick mock response to your query.`,
    "claude-3-opus": `Claude 3 Opus here. Let me provide a thoughtful mock response to your question.`,
    "claude-3-sonnet": `Claude 3 Sonnet responding: Here's my balanced mock perspective.`,
    "claude-3-haiku": `Claude 3 Haiku here with a concise mock reply.`,
    "gemini-pro": `Gemini Pro here. I've processed your input and generated this mock response.`,
    "gemini-1.5-pro": `Gemini 1.5 Pro responding with advanced mock capabilities.`,
    "grok-2": `Grok 2 here. Let me give you a witty mock response.`,
    "grok-beta": `Grok Beta chiming in with an experimental mock answer.`,
  };

  return responses[modelId] || `${modelId} mock response`;
};
