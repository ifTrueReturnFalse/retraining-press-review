import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(1, "Veuillez saisir votre mot de passe"),
});
