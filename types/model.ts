export type Provider = "openrouter" | "openai" | "anthropic" | "google" | "xai";

export interface Model {
  id: string;
  displayName: string;
  provider: Provider;
  logo: string; // Path to logo image (e.g., "/models/gpt.png")
  supportsImages: boolean;
  supportsDebate: boolean;
}
