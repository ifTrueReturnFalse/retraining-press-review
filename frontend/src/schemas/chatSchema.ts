import { z } from "zod";
import { createApiResponseSchema } from "./apiSchema";

export const MessageSchema = z.object({
  role: z.string(),
  content: z.string(),
  timestamp: z.coerce.date(),
});

export const Conversation = z.object({
  id: z.int(),
  user_id: z.int(),
  history_json: z.array(MessageSchema),
  created_at: z.coerce.date(),
});

export const RawConversation = z.object({
  id: z.int(),
  user_id: z.int(),
  history_json: z.string(),
  created_at: z.coerce.date(),
});

export const ConversationSummary = Conversation.pick({
  id: true,
  created_at: true,
});

export const ConversationResponseSchema = createApiResponseSchema(Conversation);
export const RawConversationResponseSchema =
  createApiResponseSchema(RawConversation);
export const GetAllConversationsResponseSchema = createApiResponseSchema(
  z.array(ConversationSummary),
);
