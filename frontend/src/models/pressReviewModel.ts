import { z } from "zod";
import {
  PressReviewSchema,
  PressReviewResponseSchema,
  GetPressReviewResponseSchema,
} from "@/schemas/pressReviewSchema";

export type PressReview = z.infer<typeof PressReviewSchema>;
export type PressReviewResponse = z.infer<typeof PressReviewResponseSchema>;
export type GetPressReviewResponse = z.infer<
  typeof GetPressReviewResponseSchema
>;
