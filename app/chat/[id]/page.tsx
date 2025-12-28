"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ChatWindow, Sidebar, ModelSelectorDropdown } from "@/components/chat";
import { useChatStore } from "@/store/chat-store";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const { chats, setActiveChatId } = useChatStore();
  const chat = chats[chatId];

  useEffect(() => {
    setActiveChatId(chatId);
    return () => setActiveChatId(null);
  }, [chatId, setActiveChatId]);

  if (!chat) {
    return (
      <div className="h-screen flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Chat not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <ModelSelectorDropdown chatId={chatId} />
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow chatId={chatId} />
        </div>
      </div>
    </div>
  );
}
