import { create } from "zustand";
import { nanoid } from "nanoid";
import { Chat, Message, MentionData } from "@/types";

interface StreamingMessage {
  id: string;
  modelId: string;
  content: string;
}

interface ParticipationStats {
  respondingCount: number;
  totalCount: number;
  threshold: number;
}

interface ModelDecision {
  modelId: string;
  modelName: string;
  responsePressure: number;
  threshold: number;
  decision: "RESPOND" | "SILENT";
  reasoning?: string;
}

interface ChatStore {
  // State
  chats: Record<string, Chat>;
  activeChatId: string | null;
  selectedModels: string[];
  debateMode: boolean;
  typingModels: string[]; // Models currently typing
  streamingMessages: Record<string, StreamingMessage>; // Messages being streamed (keyed by modelId)
  participationStats: ParticipationStats | null; // Selective participation stats for current response
  debugDecisions: ModelDecision[]; // Debug info for latest decision round
  debugMode: boolean; // Toggle debug panel visibility

  // Actions
  loadChats: () => Promise<void>; // Load chats from database
  createChat: (modelIds: string[]) => Promise<string>; // Returns promise now
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
  completeStreamingMessage: (chatId: string, modelId: string, fullContent: string) => Promise<void>; // Returns promise now
  clearStreamingMessage: (modelId: string) => void;
  setParticipationStats: (stats: ParticipationStats | null) => void;
  setDebugDecisions: (decisions: ModelDecision[]) => void;
  toggleDebugMode: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  chats: {},
  activeChatId: null,
  selectedModels: [],
  debateMode: false,
  typingModels: [],
  streamingMessages: {},
  participationStats: null,
  debugDecisions: [],
  debugMode: true, // Start with debug mode ON for testing

  // Load chats from database
  loadChats: async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();

      if (data.chats) {
        // Convert array to Record<string, Chat>
        const chatsRecord: Record<string, Chat> = {};
        data.chats.forEach((chat: any) => {
          chatsRecord[chat.id] = {
            id: chat.id,
            modelIds: JSON.parse(chat.modelIds),
            messages: chat.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              modelId: msg.modelId,
              timestamp: new Date(msg.timestamp),
              isEveryoneMention: msg.isEveryoneMention,
              mentions: msg.mentions ? JSON.parse(msg.mentions) : undefined,
              targetedModelIds: msg.targetedModelIds ? JSON.parse(msg.targetedModelIds) : undefined,
            })),
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
          };
        });

        set({ chats: chatsRecord });
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  },

  // Create a new chat (persists to DB)
  createChat: async (modelIds: string[]) => {
    try {
      // Create in database first
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelIds }),
      });

      const data = await response.json();
      const { chat } = data;

      // Create local chat object
      const newChat: Chat = {
        id: chat.id,
        modelIds,
        messages: [],
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
      };

      // Update Zustand
      set((state) => ({
        chats: { ...state.chats, [chat.id]: newChat },
        activeChatId: chat.id,
      }));

      return chat.id;
    } catch (error) {
      console.error('Failed to create chat:', error);
      // Fallback to local-only chat
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
    }
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

    // Add user message to Zustand (optimistic UI)
    get().addMessage(chatId, userMessage);

    // Persist user message to database
    try {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: userMessage.role,
          content: userMessage.content,
          modelId: userMessage.modelId,
          isEveryoneMention: userMessage.isEveryoneMention,
          mentions: userMessage.mentions,
          targetedModelIds: userMessage.targetedModelIds,
        }),
      });
    } catch (error) {
      console.error('Failed to persist user message:', error);
    }

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

    // Clear previous participation stats, typing indicators, and debug info
    // Note: These will be repopulated when we receive the new response events
    get().setParticipationStats(null);
    get().setTypingModels([]);
    get().setDebugDecisions([]); // Clear old debug info

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

              if (event.type === "debug") {
                // Set debug decisions
                get().setDebugDecisions(event.decisions);

                // Set typing indicators for only models that chose to respond
                const respondingModelIds = event.decisions
                  .filter((d: any) => d.decision === "RESPOND")
                  .map((d: any) => d.modelId);
                get().setTypingModels(respondingModelIds);
              } else if (event.type === "participation") {
                // Set participation stats
                get().setParticipationStats({
                  respondingCount: event.respondingCount,
                  totalCount: event.totalCount,
                  threshold: event.threshold,
                });
              } else if (event.type === "start") {
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

  completeStreamingMessage: async (chatId: string, modelId: string, fullContent: string) => {
    const streamingMsg = get().streamingMessages[modelId];
    if (!streamingMsg) return;

    // Add the completed message to Zustand (optimistic UI)
    const message: Message = {
      id: streamingMsg.id,
      role: "assistant",
      content: fullContent,
      modelId,
      timestamp: new Date(),
    };

    get().addMessage(chatId, message);
    get().clearStreamingMessage(modelId);

    // ✅ Persist COMPLETE assistant message to database (NOT chunks!)
    try {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: message.role,
          content: message.content,
          modelId: message.modelId,
        }),
      });
    } catch (error) {
      console.error('Failed to persist assistant message:', error);
    }
  },

  clearStreamingMessage: (modelId: string) => {
    set((state) => {
      const { [modelId]: _, ...rest } = state.streamingMessages;
      return { streamingMessages: rest };
    });
  },

  setParticipationStats: (stats: ParticipationStats | null) => {
    set({ participationStats: stats });
  },

  setDebugDecisions: (decisions: ModelDecision[]) => {
    set({ debugDecisions: decisions });
  },

  toggleDebugMode: () => {
    set((state) => ({ debugMode: !state.debugMode }));
  },
}));
