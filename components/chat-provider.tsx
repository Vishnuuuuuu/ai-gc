"use client";

import { useEffect } from 'react';
import { useChatStore } from '@/store/chat-store';

/**
 * ChatProvider - Loads chats from database on app mount
 * Place this high in the component tree (e.g., layout)
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const loadChats = useChatStore((state) => state.loadChats);

  useEffect(() => {
    // Load chats from database on mount
    loadChats();
  }, [loadChats]);

  return <>{children}</>;
}
