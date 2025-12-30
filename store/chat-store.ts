import { create } from "zustand";
import { nanoid } from "nanoid";
import { Chat, Message } from "@/types";

interface ChatStore {
  // State
  chats: Record<string, Chat>;
  activeChatId: string | null;
  selectedModels: string[];
  debateMode: boolean;
  typingModels: string[]; // Models currently typing

  // Actions
  createChat: (modelIds: string[]) => string;
  setActiveChatId: (id: string | null) => void;
  addSelectedModel: (modelId: string) => void;
  removeSelectedModel: (modelId: string) => void;
  clearSelectedModels: () => void;
  toggleDebateMode: () => void;
  setDebateMode: (enabled: boolean) => void;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  addMessage: (chatId: string, message: Message) => void;
  setTypingModels: (modelIds: string[]) => void;
  addTypingModel: (modelId: string) => void;
  removeTypingModel: (modelId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  chats: {},
  activeChatId: null,
  selectedModels: [],
  debateMode: false,
  typingModels: [],

  // Create a new chat
  createChat: (modelIds: string[]) => {
    const id = nanoid();
    const now = new Date();
    const newChat: Chat = {
      id,
      modelIds,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      chats: { ...state.chats, [id]: newChat },
      activeChatId: id,
    }));

    return id;
  },

  // Set active chat
  setActiveChatId: (id: string | null) => {
    set({ activeChatId: id });
  },

  // Add a model to selection
  addSelectedModel: (modelId: string) => {
    set((state) => ({
      selectedModels: state.selectedModels.includes(modelId)
        ? state.selectedModels
        : [...state.selectedModels, modelId],
    }));
  },

  // Remove a model from selection
  removeSelectedModel: (modelId: string) => {
    set((state) => ({
      selectedModels: state.selectedModels.filter((id) => id !== modelId),
    }));
  },

  // Clear all selected models
  clearSelectedModels: () => {
    set({ selectedModels: [] });
  },

  // Toggle debate mode
  toggleDebateMode: () => {
    set((state) => ({ debateMode: !state.debateMode }));
  },

  // Set debate mode
  setDebateMode: (enabled: boolean) => {
    set({ debateMode: enabled });
  },

  // Send a message (creates user message + AI responses)
  sendMessage: async (chatId: string, content: string) => {
    const chat = get().chats[chatId];
    if (!chat) return;

    // Check if message contains @everyone
    const isEveryoneMention = content.includes("@everyone");

    // Create user message
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content,
      timestamp: new Date(),
      isEveryoneMention,
    };

    // Add user message
    get().addMessage(chatId, userMessage);

    // Determine which models will respond
    const respondingModels = get().debateMode || isEveryoneMention
      ? chat.modelIds
      : [chat.modelIds[0]];

    // Set typing indicators for responding models
    get().setTypingModels(respondingModels);

    try {
      // Call API to get AI responses
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message: content,
          modelIds: chat.modelIds,
          debateMode: get().debateMode, // Use current global debate mode
          conversationHistory: chat.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            modelId: msg.modelId,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get AI response");
      }

      const data = await response.json();

      // Add AI responses with slight delays for better UX
      data.responses.forEach((aiResponse: { modelId: string; content: string }, index: number) => {
        setTimeout(() => {
          // Remove this model from typing
          get().removeTypingModel(aiResponse.modelId);

          const aiMessage: Message = {
            id: nanoid(),
            role: "assistant",
            content: aiResponse.content,
            modelId: aiResponse.modelId,
            timestamp: new Date(),
          };
          get().addMessage(chatId, aiMessage);
        }, index * 500);
      });
    } catch (error) {
      console.error("Error sending message:", error);

      // Clear all typing indicators
      get().setTypingModels([]);

      // Add error message to chat
      const errorMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
        modelId: chat.modelIds[0],
        timestamp: new Date(),
      };
      get().addMessage(chatId, errorMessage);
    }
  },

  // Add a message to a chat
  addMessage: (chatId: string, message: Message) => {
    set((state) => {
      const chat = state.chats[chatId];
      if (!chat) return state;

      return {
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: [...chat.messages, message],
            updatedAt: new Date(),
          },
        },
      };
    });
  },

  // Typing indicator actions
  setTypingModels: (modelIds: string[]) => {
    set({ typingModels: modelIds });
  },

  addTypingModel: (modelId: string) => {
    set((state) => ({
      typingModels: state.typingModels.includes(modelId)
        ? state.typingModels
        : [...state.typingModels, modelId],
    }));
  },

  removeTypingModel: (modelId: string) => {
    set((state) => ({
      typingModels: state.typingModels.filter((id) => id !== modelId),
    }));
  },
}));
