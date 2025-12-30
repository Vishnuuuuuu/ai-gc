"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/store/chat-store";
import { Model } from "@/types";
import { Search, Loader2 } from "lucide-react";
import { fetchModelsClient } from "@/lib/fetch-models";

// Generate a color based on string hash
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

// Get initials from model name
function getInitials(name: string): string {
  const words = name.split(/[\s/:]+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Check if we have a logo for this model
function hasLogo(modelId: string): boolean {
  return (
    modelId.includes("openai/") ||
    modelId.includes("anthropic/") ||
    modelId.includes("google/") ||
    modelId.includes("x-ai/") ||
    modelId.includes("xai/") ||
    modelId.includes("meta-llama/") ||
    modelId.includes("mistralai/") ||
    modelId.includes("allenai/") ||
    modelId.includes("deepseek/") ||
    modelId.includes("nvidia/") ||
    modelId.includes("gpt") ||
    modelId.includes("claude") ||
    modelId.includes("gemini") ||
    modelId.includes("grok") ||
    modelId.includes("llama") ||
    modelId.includes("mistral") ||
    modelId.includes("olmo") ||
    modelId.includes("deepseek")
  );
}

export function EnhancedModelSelector() {
  const [search, setSearch] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredModel, setHoveredModel] = useState<Model | null>(null);
  const { selectedModels, addSelectedModel } = useChatStore();

  // Fetch models on mount
  useEffect(() => {
    async function loadModels() {
      try {
        setLoading(true);
        const fetchedModels = await fetchModelsClient();
        setModels(fetchedModels);
        setError(null);
        // Set first model as hovered by default
        if (fetchedModels.length > 0) {
          setHoveredModel(fetchedModels[0]);
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
        setError("Failed to load models. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  // Filter models based on search
  const filteredModels = models.filter(
    (model) =>
      model.displayName.toLowerCase().includes(search.toLowerCase()) ||
      model.id.toLowerCase().includes(search.toLowerCase()) ||
      model.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Update hovered model when filtered models change
  useEffect(() => {
    if (filteredModels.length > 0 && !hoveredModel) {
      setHoveredModel(filteredModels[0]);
    } else if (filteredModels.length > 0 && hoveredModel) {
      // Check if current hovered model is still in filtered list
      const stillExists = filteredModels.find(m => m.id === hoveredModel.id);
      if (!stillExists) {
        setHoveredModel(filteredModels[0]);
      }
    }
  }, [filteredModels, hoveredModel]);

  // Format pricing for display
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) return "Free";
    if (numPrice < 0.000001) return `$${(numPrice * 1000000).toFixed(2)}/1M`;
    if (numPrice < 0.001) return `$${(numPrice * 1000).toFixed(2)}/1K`;
    return `$${numPrice.toFixed(4)}`;
  };

  return (
    <div className="flex gap-4 h-[500px]">
      {/* Left Panel - Model List */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="mb-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search models"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Models List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No models found</p>
            </div>
          ) : (
            filteredModels.map((model) => {
              const isSelected = selectedModels.includes(model.id);
              const isHovered = hoveredModel?.id === model.id;
              const avatarColor = stringToColor(model.id);
              const initials = getInitials(model.displayName);

              const showLogo = hasLogo(model.id);

              return (
                <div
                  key={model.id}
                  className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/10 border-l-2 border-primary"
                      : isHovered
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => !isSelected && addSelectedModel(model.id)}
                  onMouseEnter={() => setHoveredModel(model)}
                  onMouseLeave={() => setHoveredModel(null)}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Avatar Icon or Logo */}
                    {showLogo ? (
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <Image
                          src={model.logo}
                          alt={model.displayName}
                          width={24}
                          height={24}
                          className="rounded object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = "flex";
                            }
                          }}
                        />
                        {/* Fallback to text avatar if image fails */}
                        <div
                          className="absolute inset-0 rounded flex items-center justify-center text-white text-[10px] font-semibold"
                          style={{ backgroundColor: avatarColor, display: "none" }}
                        >
                          {initials}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-white text-[10px] font-semibold"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {initials}
                      </div>
                    )}

                    {/* Model Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {model.displayName}
                        </span>
                        {model.isFree && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            FREE
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {model.id}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Model Description */}
      <div className="w-80 border rounded-lg p-4 overflow-y-auto bg-card">
        {hoveredModel ? (
          <div className="space-y-4">
            {/* Model Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                {hasLogo(hoveredModel.id) ? (
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={hoveredModel.logo}
                      alt={hoveredModel.displayName}
                      width={40}
                      height={40}
                      className="rounded-lg object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = "flex";
                        }
                      }}
                    />
                    {/* Fallback to text avatar */}
                    <div
                      className="absolute inset-0 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: stringToColor(hoveredModel.id), display: "none" }}
                    >
                      {getInitials(hoveredModel.displayName)}
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: stringToColor(hoveredModel.id) }}
                  >
                    {getInitials(hoveredModel.displayName)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{hoveredModel.displayName}</h3>
                  <p className="text-xs text-muted-foreground truncate">{hoveredModel.id}</p>
                </div>
              </div>
              {hoveredModel.isFree && (
                <Badge variant="secondary" className="text-xs">
                  FREE MODEL
                </Badge>
              )}
            </div>

            {/* Description */}
            {hoveredModel.description && (
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {hoveredModel.description}
                </p>
              </div>
            )}

            {/* Pricing */}
            {hoveredModel.pricing && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">
                  Pricing
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Input</span>
                    <span className="font-mono text-xs">
                      {formatPrice(hoveredModel.pricing.prompt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Output</span>
                    <span className="font-mono text-xs">
                      {formatPrice(hoveredModel.pricing.completion)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Context Length */}
            {hoveredModel.context_length && (
              <div>
                <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase">
                  Context Length
                </h4>
                <p className="text-sm">
                  {hoveredModel.context_length.toLocaleString()} tokens
                </p>
              </div>
            )}

            {/* Capabilities */}
            <div>
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">
                Capabilities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {hoveredModel.supportsImages && (
                  <Badge variant="outline" className="text-xs">
                    Vision
                  </Badge>
                )}
                {hoveredModel.architecture?.modality && (
                  <Badge variant="outline" className="text-xs">
                    {hoveredModel.architecture.modality}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center px-4">
            <p className="text-sm text-muted-foreground">
              Hover over a model to see details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
