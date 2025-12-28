"use client";

import Image from "next/image";
import { AVAILABLE_MODELS } from "@/data/models";
import { useChatStore } from "@/store/chat-store";
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

interface ModelSelectorDropdownProps {
  chatId: string;
}

export function ModelSelectorDropdown({ chatId }: ModelSelectorDropdownProps) {
  const { chats, debateMode, toggleDebateMode } = useChatStore();
  const chat = chats[chatId];

  if (!chat) return null;

  const activeModels = chat.modelIds
    .map((id) => AVAILABLE_MODELS.find((m) => m.id === id))
    .filter(Boolean);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 h-auto py-2">
          <div className="flex items-center gap-2">
            {/* Show first model logo */}
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
                  }}
                />
              </div>
            )}
            <span className="font-medium">
              {activeModels.length === 1
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
        {activeModels.map((model) => (
          <DropdownMenuItem key={model?.id} className="gap-2">
            <div className="relative w-5 h-5 flex-shrink-0">
              <Image
                src={model!.logo}
                alt={model!.displayName}
                width={20}
                height={20}
                className="rounded object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
            <span>{model?.displayName}</span>
          </DropdownMenuItem>
        ))}

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
