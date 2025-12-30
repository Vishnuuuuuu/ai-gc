import { Model } from "@/types";

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
    request?: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string | null;
  };
  top_provider?: {
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  created: number;
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

// Map of model ID prefixes to logo paths
const MODEL_LOGO_MAP: Record<string, string> = {
  "openai/": "/models/gpt.png",
  "anthropic/": "/models/claude.png",
  "google/": "/models/gemini.png",
  "x-ai/": "/models/grok.png",
  "xai/": "/models/grok.png",
  "meta-llama/": "/models/llama.png",
  "mistralai/": "/models/mistral.png",
  "allenai/": "/models/allenai.png",
  "deepseek/": "/models/deepseek.png",
  "nvidia/": "/models/nvidia.png",
  "cohere/": "/models/cohere.png",
  "perplexity/": "/models/perplexity.png",
};

// Determine provider from model ID
function getProviderFromId(id: string): Model["provider"] {
  if (id.startsWith("openai/")) return "openai";
  if (id.startsWith("anthropic/")) return "anthropic";
  if (id.startsWith("google/")) return "google";
  if (id.startsWith("x-ai/") || id.startsWith("xai/")) return "xai";
  return "openrouter";
}

// Get logo path based on model ID
function getLogoPath(id: string): string {
  for (const [prefix, logo] of Object.entries(MODEL_LOGO_MAP)) {
    if (id.startsWith(prefix)) {
      return logo;
    }
  }
  return "/models/default.png"; // Fallback logo
}

// Check if model is free (all pricing is "0" or contains "free" in name)
function isFreeModel(model: OpenRouterModel): boolean {
  const isFreeByName = model.name.toLowerCase().includes("free");
  const isFreeByPricing =
    model.pricing.prompt === "0" && model.pricing.completion === "0";
  return isFreeByName || isFreeByPricing;
}

// Transform OpenRouter model to our Model type
function transformModel(openRouterModel: OpenRouterModel): Model {
  const isFree = isFreeModel(openRouterModel);
  const displayName = isFree && !openRouterModel.name.includes("(free)")
    ? `${openRouterModel.name} (free)`
    : openRouterModel.name;

  return {
    id: openRouterModel.id,
    displayName,
    name: openRouterModel.name,
    description: openRouterModel.description,
    pricing: openRouterModel.pricing,
    context_length: openRouterModel.context_length,
    architecture: openRouterModel.architecture,
    top_provider: openRouterModel.top_provider,
    created: openRouterModel.created,
    provider: getProviderFromId(openRouterModel.id),
    logo: getLogoPath(openRouterModel.id),
    supportsImages: openRouterModel.architecture?.modality?.includes("image") || false,
    supportsDebate: true, // Assume all models support debate mode
    isFree,
  };
}

// Fetch all models from OpenRouter
export async function fetchOpenRouterModels(): Promise<Model[]> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();
    const models = data.data.map(transformModel);

    // Sort models: free models first, then by name
    models.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1;
      if (!a.isFree && b.isFree) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    return models;
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error);
    throw error;
  }
}

// Client-side fetch function (for use in components)
export async function fetchModelsClient(): Promise<Model[]> {
  const response = await fetch("/api/models");
  if (!response.ok) {
    throw new Error("Failed to fetch models");
  }
  return response.json();
}
