"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MessageBubble } from "./message-bubble";
import { MentionInput, MentionData } from "./mention-input";
import { useChatStore } from "@/store/chat-store";
import { Model } from "@/types";
import { fetchModelsClient } from "@/lib/fetch-models";
import { Loader2 } from "lucide-react";

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { chats, sendMessage, typingModels, streamingMessages } = useChatStore();
  const chat = chats[chatId];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [allModels, setAllModels] = useState<Model[]>([]);

  // Fetch models on mount
  useEffect(() => {
    fetchModelsClient().then(setAllModels).catch(console.error);
  }, []);

  // Auto-scroll to bottom when new messages arrive, typing changes, or streaming updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat?.messages, typingModels, streamingMessages]);

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Messages area - scrollable */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pb-4"
      >
        {chat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div>
            {chat.messages.map((message) => (
              <MessageBubble key={message.id} message={message} allModels={allModels} />
            ))}

            {/* Streaming messages */}
            {Object.values(streamingMessages).map((streamingMsg) => (
              <MessageBubble
                key={streamingMsg.id}
                message={{
                  id: streamingMsg.id,
                  role: "assistant",
                  content: streamingMsg.content,
                  modelId: streamingMsg.modelId,
                  timestamp: new Date(),
                }}
                allModels={allModels}
                isStreaming={true}
              />
            ))}

            {/* Typing indicators */}
            {typingModels.length > 0 && (
              <div className="w-full py-4 px-4 bg-muted/30">
                <div className="max-w-3xl mx-auto">
                  {typingModels.map((modelId) => {
                    const model = allModels.find((m) => m.id === modelId);
                    if (!model) return null;

                    return (
                      <div key={modelId} className="flex items-center gap-3 mb-2 last:mb-0">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="font-semibold text-sm">{model.displayName}</span>
                        <span className="text-sm text-muted-foreground">is typing...</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Sticky Input area with more padding */}
      <div className="sticky bottom-0 left-0 right-0 bg-background px-4 py-6 border-t">
        <div className="max-w-4xl mx-auto">
          <MentionInput
            onSend={(content, mentions) => sendMessage(chatId, content, mentions)}
            chatModelIds={chat.modelIds}
          />
        </div>
      </div>
    </div>
  );
}
