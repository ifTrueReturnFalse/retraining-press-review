import { z } from "zod";
import { createApiResponseSchema } from "./apiSchema";

export const PressReviewSchema = z.object({
  id: z.int(),
  conversation_id: z.int(),
  theme: z.string(),
  content: z.string(),
  created_at: z.coerce.date(),
});

export const PressReviewResponseSchema =
  createApiResponseSchema(PressReviewSchema);
export const GetPressReviewResponseSchema = createApiResponseSchema(
  z.array(PressReviewSchema),
);
