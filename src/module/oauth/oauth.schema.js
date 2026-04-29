import { z } from "zod";

export const authorizeSchema = z.object({
  client_id: z.string().trim().min(1),
  redirect_uri: z.string().trim().url(),
  response_type: z.literal("code"),
  scope: z.string().trim().default("openid profile email"),
  state: z.string().trim().min(1),
  nonce: z.string().trim().min(8).optional(),
  code_challenge: z.string().trim().min(43).max(128),
  code_challenge_method: z.literal("S256"),
});

export const authorizationCodeSchema = z.object({
  grant_type: z.literal("authorization_code"),
  code: z.string().trim().min(1),
  redirect_uri: z.string().trim().url(),
  client_id: z.string().trim().min(1),
  code_verifier: z.string().trim().min(43).max(128),
});

export const refreshTokenSchema = z.object({
  grant_type: z.literal("refresh_token"),
  refresh_token: z.string().trim().min(1),
  client_id: z.string().trim().min(1),
});
