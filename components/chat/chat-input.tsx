"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-end gap-3 p-4 border rounded-2xl bg-background shadow-sm hover:shadow-md transition-shadow">
        {/* Plus button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-10 w-10"
          disabled
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Textarea */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message... (use @everyone to mention all models)"
          disabled={disabled}
          className="min-h-[60px] max-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 p-3 text-base"
          rows={1}
        />

        {/* Send button */}
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          size="icon"
          className="flex-shrink-0 h-10 w-10 rounded-full"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
