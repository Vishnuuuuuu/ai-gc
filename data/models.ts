import { Model } from "@/types";

// Fallback models (used if OpenRouter API fails)
export const AVAILABLE_MODELS: Model[] = [
  // OpenAI models
  {
    id: "openai/gpt-4o",
    displayName: "GPT-4o",
    name: "GPT-4o",
    provider: "openai",
    logo: "/models/gpt.png",
    supportsImages: true,
    supportsDebate: true,
    description: "Most advanced GPT-4 model with vision capabilities",
  },
  {
    id: "openai/gpt-4-turbo",
    displayName: "GPT-4 Turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    logo: "/models/gpt.png",
    supportsImages: true,
    supportsDebate: true,
    description: "Faster GPT-4 model with improved performance",
  },
  {
    id: "openai/gpt-3.5-turbo",
    displayName: "GPT-3.5 Turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    logo: "/models/gpt.png",
    supportsImages: false,
    supportsDebate: true,
    description: "Fast and efficient model for most tasks",
  },

  // Anthropic models
  {
    id: "anthropic/claude-3-opus",
    displayName: "Claude 3 Opus",
    name: "Claude 3 Opus",
    provider: "anthropic",
    logo: "/models/claude.png",
    supportsImages: true,
    supportsDebate: true,
    description: "Most capable Claude model for complex tasks",
  },
  {
    id: "anthropic/claude-3-sonnet",
    displayName: "Claude 3 Sonnet",
    name: "Claude 3 Sonnet",
    provider: "anthropic",
    logo: "/models/claude.png",
    supportsImages: true,
    supportsDebate: true,
    description: "Balanced Claude model for everyday use",
  },
  {
    id: "anthropic/claude-3-haiku",
    displayName: "Claude 3 Haiku",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    logo: "/models/claude.png",
    supportsImages: true,
    supportsDebate: true,
    description: "Fast Claude model for simple tasks",
  },

  // Google models
  {
    id: "google/gemini-pro",
    displayName: "Gemini Pro",
    name: "Gemini Pro",
    provider: "google",
    logo: "/models/gemini.png",
    supportsImages: true,
    supportsDebate: true,
    description: "Google's advanced AI model",
  },
  {
    id: "google/gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    logo: "/models/gemini.png",
    supportsImages: true,
    supportsDebate: true,
    description: "Latest Gemini model with enhanced capabilities",
  },

  // xAI models
  {
    id: "x-ai/grok-2",
    displayName: "Grok 2",
    name: "Grok 2",
    provider: "xai",
    logo: "/models/grok.png",
    supportsImages: false,
    supportsDebate: true,
    description: "xAI's powerful language model",
  },
  {
    id: "x-ai/grok-beta",
    displayName: "Grok Beta",
    name: "Grok Beta",
    provider: "xai",
    logo: "/models/grok.png",
    supportsImages: false,
    supportsDebate: true,
    description: "Beta version of Grok with experimental features",
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
