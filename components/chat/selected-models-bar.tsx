"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { AVAILABLE_MODELS } from "@/data/models";
import { useChatStore } from "@/store/chat-store";

export function SelectedModelsBar() {
  const { selectedModels, removeSelectedModel } = useChatStore();

  if (selectedModels.length === 0) {
    return null;
  }

  return (
    <div className="border-t p-4 bg-muted/30">
      <h3 className="text-sm font-medium mb-2">Selected Models</h3>
      <div className="flex flex-wrap gap-2">
        {selectedModels.map((modelId) => {
          const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
          if (!model) return null;

          return (
            <Badge
              key={modelId}
              variant="secondary"
              className="pl-2 pr-1 py-1.5 gap-2 text-sm"
            >
              {/* Model Logo */}
              <div className="relative w-5 h-5 flex-shrink-0">
                <Image
                  src={model.logo}
                  alt={model.displayName}
                  width={20}
                  height={20}
                  className="rounded object-contain"
                  onError={(e) => {
                    // Fallback to initials if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = "flex";
                    }
                  }}
                />
                {/* Fallback: Show initials if logo doesn't load */}
                <div
                  className="absolute inset-0 bg-primary/10 rounded flex items-center justify-center text-[10px] font-semibold text-primary"
                  style={{ display: "none" }}
                >
                  {model.displayName.substring(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Model Name */}
              <span>{model.displayName}</span>

              {/* Remove Button */}
              <button
                onClick={() => removeSelectedModel(modelId)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
