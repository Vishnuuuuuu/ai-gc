export type Provider = "openrouter" | "openai" | "anthropic" | "google" | "xai";

export interface ModelPricing {
  prompt: string;
  completion: string;
  image?: string;
  request?: string;
}

export interface ModelArchitecture {
  modality: string;
  tokenizer: string;
  instruct_type?: string | null;
}

export interface Model {
  id: string;
  displayName: string;
  name: string; // Full name from OpenRouter
  description?: string;
  pricing?: ModelPricing;
  context_length?: number;
  architecture?: ModelArchitecture;
  top_provider?: {
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  created?: number;
  provider: Provider;
  logo: string; // Path to logo image (e.g., "/models/gpt.png")
  supportsImages: boolean;
  supportsDebate: boolean;
  isFree?: boolean; // Indicates if the model is free
}
