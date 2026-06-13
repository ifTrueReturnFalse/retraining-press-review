import { z } from "zod";
import { createApiResponseSchema } from "./apiSchema";

export const MessageSchema = z.object({
  role: z.string(),
  content: z.string(),
  timestamp: z.date(),
});

export const Conversation = z.object({
  id: z.int(),
  user_id: z.int(),
  history_json: z.array(MessageSchema),
  created_at: z.date(),
});

export const RawConversation = z.object({
  id: z.int(),
  user_id: z.int(),
  history_json: z.string(),
  created_at: z.date(),
});

export const ConversationResponse = createApiResponseSchema(Conversation);
export const RawConversationResponse = createApiResponseSchema(RawConversation);
