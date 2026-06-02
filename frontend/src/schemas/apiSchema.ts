import { z } from "zod";

export const ApiSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string().optional(),
    data: dataSchema.optional(),
  });

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string().optional(),
  data: z.null(),
});

export const createApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.discriminatedUnion("success", [
    ApiSuccessResponseSchema(dataSchema),
    ApiErrorResponseSchema,
  ]);
