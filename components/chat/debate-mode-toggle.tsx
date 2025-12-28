"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useChatStore } from "@/store/chat-store";

interface DebateModeToggleProps {
  chatId?: string;
}

export function DebateModeToggle({ chatId }: DebateModeToggleProps) {
  const { debateMode, toggleDebateMode } = useChatStore();

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="debate-mode"
        checked={debateMode}
        onCheckedChange={toggleDebateMode}
      />
      <Label htmlFor="debate-mode" className="cursor-pointer">
        Debate Mode {debateMode && "✓"}
      </Label>
    </div>
  );
}
