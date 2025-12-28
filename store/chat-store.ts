import { create } from "zustand";
import { nanoid } from "nanoid";
import { Chat, Message } from "@/types";
import { generateMockResponse } from "@/data/models";

interface ChatStore {
  // State
  chats: Record<string, Chat>;
  activeChatId: string | null;
  selectedModels: string[];
  debateMode: boolean;

  // Actions
  createChat: (modelIds: string[]) => string;
  setActiveChatId: (id: string | null) => void;
  addSelectedModel: (modelId: string) => void;
  removeSelectedModel: (modelId: string) => void;
  clearSelectedModels: () => void;
  toggleDebateMode: () => void;
  setDebateMode: (enabled: boolean) => void;
  sendMessage: (chatId: string, content: string) => void;
  addMessage: (chatId: string, message: Message) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  chats: {},
  activeChatId: null,
  selectedModels: [],
  debateMode: false,

  // Create a new chat
  createChat: (modelIds: string[]) => {
    const id = nanoid();
    const now = new Date();
    const newChat: Chat = {
      id,
      modelIds,
      messages: [],
      debateMode: get().debateMode,
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

  // Send a message (creates user message + mock AI responses)
  sendMessage: (chatId: string, content: string) => {
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

    // Generate mock AI responses
    // In debate mode or with @everyone, all models respond
    // Otherwise, only one model responds
    const modelsToRespond = isEveryoneMention || chat.debateMode
      ? chat.modelIds
      : [chat.modelIds[0]]; // Just first model for regular mode

    modelsToRespond.forEach((modelId, index) => {
      // Simulate slight delay between responses
      setTimeout(() => {
        const aiMessage: Message = {
          id: nanoid(),
          role: "assistant",
          content: generateMockResponse(modelId, content),
          modelId,
          timestamp: new Date(),
        };
        get().addMessage(chatId, aiMessage);
      }, index * 500);
    });
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
}));
