"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat-store";

export function CreateChatButton() {
  const router = useRouter();
  const { selectedModels, createChat, clearSelectedModels } = useChatStore();

  const handleCreateChat = () => {
    if (selectedModels.length === 0) {
      alert("Please select at least one model");
      return;
    }

    const chatId = createChat(selectedModels);
    clearSelectedModels();
    router.push(`/chat/${chatId}`);
  };

  return (
    <Button
      onClick={handleCreateChat}
      disabled={selectedModels.length === 0}
      size="lg"
    >
      Start Chat ({selectedModels.length} model{selectedModels.length !== 1 ? "s" : ""})
    </Button>
  );
}
