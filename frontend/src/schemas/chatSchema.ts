import { z } from "zod";
import { createApiResponseSchema } from "./apiSchema";

export const MessageSchema = z.object({
  role: z.string(),
  content: z.string(),
  timestamp: z.coerce.date(),
});

export const ConversationSchema = z.object({
  id: z.int(),
  user_id: z.int(),
  history_json: z.array(MessageSchema),
  created_at: z.coerce.date(),
});

export const RawConversationSchema = z.object({
  id: z.int(),
  user_id: z.int(),
  history_json: z.string(),
  created_at: z.coerce.date(),
});

export const ConversationSummarySchema = ConversationSchema.pick({
  id: true,
  created_at: true,
});

export const ConversationResponseSchema =
  createApiResponseSchema(ConversationSchema);
export const RawConversationResponseSchema = createApiResponseSchema(
  RawConversationSchema,
);
export const GetAllConversationsResponseSchema = createApiResponseSchema(
  z.array(ConversationSummarySchema),
);
