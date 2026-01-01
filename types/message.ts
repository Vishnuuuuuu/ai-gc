export type MessageRole = "user" | "assistant";

export interface MentionData {
  type: "everyone" | "model";
  modelId?: string;
  displayName: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  modelId?: string; // Only for assistant messages
  timestamp: Date;
  isEveryoneMention?: boolean; // True if user used @everyone
  mentions?: MentionData[]; // All mentions in the message
  targetedModelIds?: string[]; // Specific models that should respond
}
