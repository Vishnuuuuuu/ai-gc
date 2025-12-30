"use client";

import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { useChatStore } from "@/store/chat-store";
import { Model } from "@/types";
import { fetchModelsClient } from "@/lib/fetch-models";
import { Loader2 } from "lucide-react";

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { chats, sendMessage, typingModels } = useChatStore();
  const chat = chats[chatId];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [allModels, setAllModels] = useState<Model[]>([]);

  // Fetch models on mount
  useEffect(() => {
    fetchModelsClient().then(setAllModels).catch(console.error);
  }, []);

  // Auto-scroll to bottom when new messages arrive or typing changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat?.messages, typingModels]);

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

            {/* Typing indicators */}
            {typingModels.length > 0 && (
              <div className="w-full py-4 px-4">
                <div className="max-w-3xl mx-auto">
                  {typingModels.map((modelId) => {
                    const model = allModels.find((m) => m.id === modelId);
                    if (!model) return null;

                    return (
                      <div key={modelId} className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="font-medium">{model.displayName}</span>
                        <span>is typing...</span>
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
          <ChatInput onSend={(content) => sendMessage(chatId, content)} />
        </div>
      </div>
    </div>
  );
}
