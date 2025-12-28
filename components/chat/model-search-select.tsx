"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AVAILABLE_MODELS } from "@/data/models";
import { useChatStore } from "@/store/chat-store";

export function ModelSearchSelect() {
  const [search, setSearch] = useState("");
  const { selectedModels, addSelectedModel } = useChatStore();

  // Only show models when user is typing (search has at least 1 character)
  const shouldShowModels = search.length > 0;

  // Filter models based on search
  const filteredModels = shouldShowModels
    ? AVAILABLE_MODELS.filter(
        (model) =>
          model.displayName.toLowerCase().includes(search.toLowerCase()) ||
          model.id.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search models... (try 'GPT', 'Claude', 'Gemini', 'Grok')"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Show hint when nothing is typed */}
      {!shouldShowModels && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Start typing to see AI model recommendations</p>
        </div>
      )}

      {/* Show filtered models when searching */}
      {shouldShowModels && (
        <div className="grid gap-2 max-h-96 overflow-y-auto">
          {filteredModels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No models found matching "{search}"</p>
            </div>
          ) : (
            filteredModels.map((model) => {
              const isSelected = selectedModels.includes(model.id);

              return (
                <Card
                  key={model.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => !isSelected && addSelectedModel(model.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Model Logo */}
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <Image
                          src={model.logo}
                          alt={model.displayName}
                          width={32}
                          height={32}
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
                          className="absolute inset-0 bg-primary/10 rounded flex items-center justify-center text-xs font-semibold text-primary"
                          style={{ display: "none" }}
                        >
                          {model.displayName.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{model.displayName}</h3>
                        <p className="text-sm text-muted-foreground">{model.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {/* Provider badge - commented out */}
                      {/* <Badge variant="outline">{model.provider}</Badge> */}
                      {isSelected && <Badge>Selected</Badge>}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
