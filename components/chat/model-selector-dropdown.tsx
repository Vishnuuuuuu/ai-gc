"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Model } from "@/types";
import { useChatStore } from "@/store/chat-store";
import { fetchModelsClient } from "@/lib/fetch-models";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ChevronDown } from "lucide-react";

// Generate color for text avatar
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

function getInitials(name: string): string {
  const words = name.split(/[\s/:]+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

interface ModelSelectorDropdownProps {
  chatId: string;
}

export function ModelSelectorDropdown({ chatId }: ModelSelectorDropdownProps) {
  const { chats, debateMode, toggleDebateMode } = useChatStore();
  const chat = chats[chatId];
  const [allModels, setAllModels] = useState<Model[]>([]);

  useEffect(() => {
    fetchModelsClient().then(setAllModels).catch(console.error);
  }, []);

  if (!chat) return null;

  const activeModels = chat.modelIds
    .map((id) => allModels.find((m) => m.id === id))
    .filter(Boolean) as Model[];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 h-auto py-2">
          <div className="flex items-center gap-2">
            {/* Show first model logo/avatar */}
            {activeModels[0] && (
              <div className="relative w-5 h-5 flex-shrink-0">
                <Image
                  src={activeModels[0].logo}
                  alt={activeModels[0].displayName}
                  width={20}
                  height={20}
                  className="rounded object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = "flex";
                    }
                  }}
                />
                {/* Fallback text avatar */}
                <div
                  className="absolute inset-0 rounded flex items-center justify-center text-white text-[8px] font-semibold"
                  style={{ backgroundColor: stringToColor(activeModels[0].id), display: "none" }}
                >
                  {getInitials(activeModels[0].displayName)}
                </div>
              </div>
            )}
            <span className="font-medium">
              {activeModels.length === 0
                ? "0 Models"
                : activeModels.length === 1
                ? activeModels[0]?.displayName
                : `${activeModels.length} Models`}
            </span>
            {debateMode && (
              <Badge variant="secondary" className="text-xs">
                Debate
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Active Models</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Active Models List */}
        {activeModels.length === 0 ? (
          <DropdownMenuItem disabled>No models selected</DropdownMenuItem>
        ) : (
          activeModels.map((model) => (
            <DropdownMenuItem key={model.id} className="gap-2">
              <div className="relative w-5 h-5 flex-shrink-0">
                <Image
                  src={model.logo}
                  alt={model.displayName}
                  width={20}
                  height={20}
                  className="rounded object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = "flex";
                    }
                  }}
                />
                {/* Fallback text avatar */}
                <div
                  className="absolute inset-0 rounded flex items-center justify-center text-white text-[8px] font-semibold"
                  style={{ backgroundColor: stringToColor(model.id), display: "none" }}
                >
                  {getInitials(model.displayName)}
                </div>
              </div>
              <span>{model.displayName}</span>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />

        {/* Debate Mode Toggle */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Debate Mode</span>
              <span className="text-xs text-muted-foreground">
                All models respond
              </span>
            </div>
            <Switch checked={debateMode} onCheckedChange={toggleDebateMode} />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
