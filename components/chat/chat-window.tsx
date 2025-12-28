"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { useChatStore } from "@/store/chat-store";

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { chats, sendMessage } = useChatStore();
  const chat = chats[chatId];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat?.messages]);

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
              <MessageBubble key={message.id} message={message} />
            ))}
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
