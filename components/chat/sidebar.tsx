"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat-store";
import { MessageSquare, Plus } from "lucide-react";

export function Sidebar() {
  const router = useRouter();
  const { chats, activeChatId } = useChatStore();

  // Convert chats object to array and sort by updatedAt
  const chatList = Object.values(chats).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  return (
    <div className="w-64 border-r flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-3 border-b">
        <Button
          onClick={() => router.push("/create")}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {chatList.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No chats yet
            </div>
          ) : (
            chatList.map((chat) => {
              const isActive = chat.id === activeChatId;
              const messagePreview =
                chat.messages.length > 0
                  ? chat.messages[chat.messages.length - 1].content.substring(
                      0,
                      50
                    ) + "..."
                  : "New chat";

              return (
                <Link key={chat.id} href={`/chat/${chat.id}`}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2 h-auto py-3 px-3"
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="text-sm truncate">{messagePreview}</div>
                      <div className="text-xs text-muted-foreground">
                        {chat.modelIds.length} model
                        {chat.modelIds.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
