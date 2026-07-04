import {
  ConversationSchema,
  ConversationResponseSchema,
  ConversationSummarySchema,
  GetAllConversationsResponseSchema,
  MessageSchema,
  RawConversationResponseSchema,
} from "@/schemas/chatSchema";
import { z } from "zod";

export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationResponse = z.infer<typeof ConversationResponseSchema>;
export type RawConversationResponse = z.infer<
  typeof RawConversationResponseSchema
>;
export type ConversationSummary = z.infer<typeof ConversationSummarySchema>;
export type GetAllConversationsResponse = z.infer<
  typeof GetAllConversationsResponseSchema
>;
