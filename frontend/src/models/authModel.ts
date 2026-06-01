import { z } from "zod";
import { LoginSchema } from "@/schemas/authSchemas";

export type LoginModel = z.infer<typeof LoginSchema>;
