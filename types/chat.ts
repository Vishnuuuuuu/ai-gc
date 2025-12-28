import { Message } from "./message";

export interface Chat {
  id: string;
  modelIds: string[]; // Selected model IDs
  messages: Message[];
  debateMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}
