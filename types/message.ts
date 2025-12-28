export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  modelId?: string; // Only for assistant messages
  timestamp: Date;
  isEveryoneMention?: boolean; // True if user used @everyone
}
