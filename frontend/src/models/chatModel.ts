import {
  Conversation,
  ConversationResponse,
  MessageSchema,
  RawConversationResponse,
} from "@/schemas/chatSchema";
import { z } from "zod";

export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof Conversation>;
export type ConversationResponse = z.infer<typeof ConversationResponse>;
export type RawConversationResponse = z.infer<typeof RawConversationResponse>;
