import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  client_id: z.string().trim().min(1),
  redirect_uri: z.string().trim().url(),
  response_type: z.string().trim().default("code").optional(),
  scope: z.string().trim().default("openid profile email").optional(),
  state: z.string().trim().min(1),
  nonce: z.string().trim().min(8).optional(),
  code_challenge: z.string().trim().min(43).max(128),
  code_challenge_method: z.literal("S256"),
});

export const authenticateUserSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});
