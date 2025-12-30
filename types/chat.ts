import { Message } from "./message";

export interface Chat {
  id: string;
  modelIds: string[]; // Selected model IDs
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
