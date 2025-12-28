"use client";

import Image from "next/image";
import { Message } from "@/types";
import { AVAILABLE_MODELS } from "@/data/models";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const model = message.modelId
    ? AVAILABLE_MODELS.find((m) => m.id === message.modelId)
    : null;

  return (
    <div
      className={`w-full py-6 px-4 ${
        isUser ? "" : "bg-muted/30"
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center overflow-hidden">
              {model && (
                <Image
                  src={model.logo}
                  alt={model.displayName}
                  width={24}
                  height={24}
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display =
                        "flex";
                    }
                  }}
                />
              )}
              {/* Fallback */}
              <div
                className="w-full h-full flex items-center justify-center text-xs font-semibold"
                style={{ display: "none" }}
              >
                {model?.displayName.substring(0, 2).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Model name for AI messages */}
          {!isUser && model && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {model.displayName}
              </span>
              {message.isEveryoneMention && (
                <Badge variant="secondary" className="text-xs">
                  @everyone
                </Badge>
              )}
            </div>
          )}

          {/* Everyone mention for user messages */}
          {isUser && message.isEveryoneMention && (
            <Badge variant="secondary" className="text-xs mb-2">
              @everyone
            </Badge>
          )}

          {/* Message text */}
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground mt-2">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
