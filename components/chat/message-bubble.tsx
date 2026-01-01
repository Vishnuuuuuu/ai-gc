"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Message, Model } from "@/types";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { fetchModelsClient } from "@/lib/fetch-models";

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

// Render message content with styled mentions (Discord-like)
function renderMessageWithMentions(content: string, models: Model[]): React.ReactNode {
  // Match @everyone or @ModelName patterns
  const mentionRegex = /@(everyone|[\w\s.-]+?)(?=\s|$|[.,!?])/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const mentionName = match[1];
    const isEveryone = mentionName.toLowerCase() === "everyone";
    const isValidModel = models.some(
      m => m.displayName.toLowerCase() === mentionName.toLowerCase() ||
           m.name.toLowerCase() === mentionName.toLowerCase()
    );

    if (isEveryone || isValidModel) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {content.slice(lastIndex, match.index)}
          </span>
        );
      }

      // Add styled mention with Discord-like appearance
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="inline-flex items-center bg-[#5865F2]/30 text-[#c9cdfb] hover:bg-[#5865F2]/50 rounded px-1 cursor-pointer transition-colors font-medium"
        >
          @{mentionName}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {content.slice(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? parts : content;
}

interface MessageBubbleProps {
  message: Message;
  allModels?: Model[];
  isStreaming?: boolean;
}

export function MessageBubble({ message, allModels = [], isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const model = message.modelId
    ? allModels.find((m) => m.id === message.modelId)
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
          ) : model ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={model.logo}
                alt={model.displayName}
                width={32}
                height={32}
                className="object-contain"
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
                className="absolute inset-0 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                style={{ backgroundColor: stringToColor(message.modelId || ""), display: "none" }}
              >
                {getInitials(model.displayName)}
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs">AI</span>
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

          {/* Message text with styled mentions */}
          <div className="text-sm whitespace-pre-wrap break-words select-none cursor-default">
            {renderMessageWithMentions(message.content, allModels)}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
          </div>
        </div>
      </div>
    </div>
  );
}
