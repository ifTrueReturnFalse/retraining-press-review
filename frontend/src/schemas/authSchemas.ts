import { z } from "zod";
import { createApiResponseSchema } from "./apiSchema";

export const LoginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(1, "Veuillez saisir votre mot de passe"),
});

export const LoginDataResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export const LoginResponseSchema = createApiResponseSchema(
  LoginDataResponseSchema,
);
