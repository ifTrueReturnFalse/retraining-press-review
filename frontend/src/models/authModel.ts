import { z } from "zod";
import {
  LoginSchema,
  LoginDataResponseSchema,
  LoginResponseSchema,
} from "@/schemas/authSchemas";

export type LoginModel = z.infer<typeof LoginSchema>;
export type LoginDataResponseModel = z.infer<typeof LoginDataResponseSchema>;
export type LoginResponseModel = z.infer<typeof LoginResponseSchema>;
