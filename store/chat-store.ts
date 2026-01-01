import { create } from "zustand";
import { nanoid } from "nanoid";
import { Chat, Message, MentionData } from "@/types";

interface StreamingMessage {
  id: string;
  modelId: string;
  content: string;
}

interface ChatStore {
  // State
  chats: Record<string, Chat>;
  activeChatId: string | null;
  selectedModels: string[];
  debateMode: boolean;
  typingModels: string[]; // Models currently typing
  streamingMessages: Record<string, StreamingMessage>; // Messages being streamed (keyed by modelId)

  // Actions
  createChat: (modelIds: string[]) => string;
  setActiveChatId: (id: string | null) => void;
  addSelectedModel: (modelId: string) => void;
  removeSelectedModel: (modelId: string) => void;
  clearSelectedModels: () => void;
  toggleDebateMode: () => void;
  setDebateMode: (enabled: boolean) => void;
  sendMessage: (chatId: string, content: string, mentions?: MentionData[]) => Promise<void>;
  addMessage: (chatId: string, message: Message) => void;
  setTypingModels: (modelIds: string[]) => void;
  addTypingModel: (modelId: string) => void;
  removeTypingModel: (modelId: string) => void;
  startStreamingMessage: (modelId: string) => void;
  updateStreamingMessage: (modelId: string, content: string) => void;
  completeStreamingMessage: (chatId: string, modelId: string, fullContent: string) => void;
  clearStreamingMessage: (modelId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  chats: {},
  activeChatId: null,
  selectedModels: [],
  debateMode: false,
  typingModels: [],
  streamingMessages: {},

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

  // Send a message (creates user message + streams AI responses)
  sendMessage: async (chatId: string, content: string, mentions?: MentionData[]) => {
    const chat = get().chats[chatId];
    if (!chat) return;

    // Check if message contains @everyone
    const isEveryoneMention = mentions?.some(m => m.type === "everyone") || content.includes("@everyone");

    // Get specifically targeted model IDs from mentions
    const targetedModelIds = mentions
      ?.filter(m => m.type === "model" && m.modelId)
      .map(m => m.modelId!)
      .filter(id => chat.modelIds.includes(id)) || [];

    // Create user message
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content,
      timestamp: new Date(),
      isEveryoneMention,
      mentions,
      targetedModelIds: targetedModelIds.length > 0 ? targetedModelIds : undefined,
    };

    // Add user message
    get().addMessage(chatId, userMessage);

    // Determine which models will respond:
    // 1. If @everyone or debate mode: all models respond
    // 2. If specific models mentioned: only those models respond
    // 3. Otherwise: first model responds (default behavior)
    let respondingModels: string[];
    if (get().debateMode || isEveryoneMention) {
      respondingModels = chat.modelIds;
    } else if (targetedModelIds.length > 0) {
      respondingModels = targetedModelIds;
    } else {
      respondingModels = [chat.modelIds[0]];
    }

    // Set typing indicators for responding models
    get().setTypingModels(respondingModels);

    try {
      // Call streaming API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message: content,
          modelIds: chat.modelIds,
          debateMode: get().debateMode,
          conversationHistory: chat.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            modelId: msg.modelId,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);

              if (event.type === "start") {
                // Start streaming for this model
                get().startStreamingMessage(event.modelId);
                // Typing indicator will be removed on first chunk
              } else if (event.type === "chunk") {
                // Update streaming message (typing indicator removed on first chunk)
                get().updateStreamingMessage(event.modelId, event.content);
              } else if (event.type === "done") {
                // Complete streaming message
                get().completeStreamingMessage(chatId, event.modelId, event.fullContent);
              } else if (event.type === "error") {
                // Handle error
                get().removeTypingModel(event.modelId);
                get().clearStreamingMessage(event.modelId);

                const errorMessage: Message = {
                  id: nanoid(),
                  role: "assistant",
                  content: event.error,
                  modelId: event.modelId,
                  timestamp: new Date(),
                };
                get().addMessage(chatId, errorMessage);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Clear any remaining typing indicators
      get().setTypingModels([]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Clear all typing indicators and streaming messages
      get().setTypingModels([]);
      Object.keys(get().streamingMessages).forEach(modelId => {
        get().clearStreamingMessage(modelId);
      });

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

  // Streaming message actions
  startStreamingMessage: (modelId: string) => {
    set((state) => ({
      streamingMessages: {
        ...state.streamingMessages,
        [modelId]: {
          id: nanoid(),
          modelId,
          content: "",
        },
      },
    }));
  },

  updateStreamingMessage: (modelId: string, chunk: string) => {
    set((state) => {
      const existing = state.streamingMessages[modelId];
      if (!existing) return state;

      // Remove typing indicator on first chunk (when content is empty)
      const isFirstChunk = existing.content === "";

      return {
        streamingMessages: {
          ...state.streamingMessages,
          [modelId]: {
            ...existing,
            content: existing.content + chunk,
          },
        },
        // Remove typing indicator only on first chunk
        typingModels: isFirstChunk
          ? state.typingModels.filter((id) => id !== modelId)
          : state.typingModels,
      };
    });
  },

  completeStreamingMessage: (chatId: string, modelId: string, fullContent: string) => {
    const streamingMsg = get().streamingMessages[modelId];
    if (!streamingMsg) return;

    // Add the completed message to chat
    const message: Message = {
      id: streamingMsg.id,
      role: "assistant",
      content: fullContent,
      modelId,
      timestamp: new Date(),
    };

    get().addMessage(chatId, message);
    get().clearStreamingMessage(modelId);
  },

  clearStreamingMessage: (modelId: string) => {
    set((state) => {
      const { [modelId]: _, ...rest } = state.streamingMessages;
      return { streamingMessages: rest };
    });
  },
}));
