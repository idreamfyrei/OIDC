import { z } from "zod";

const tokenEndpointAuthMethodSchema = z.enum(["none", "client_secret_post"]);

export const registerClientSchema = z.object({
  clientId: z
    .string()
    .trim()
    .min(3)
    .max(255)
    .regex(/^[a-zA-Z0-9._-]+$/)
    .optional(),
  clientName: z.string().trim().min(2).max(255),
  websiteUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  redirectUris: z.array(z.string().trim().url()).min(1),
  backchannelLogoutUri: z.union([z.string().trim().url(), z.literal("")]).optional(),
  applicationType: z.enum(["web", "native"]),
  tokenEndpointAuthMethod: tokenEndpointAuthMethodSchema.default("none").optional(),
});

export const clientIdParamSchema = z.object({
  clientId: z.string().trim().min(1),
});

export const companyRegisterSchema = z.object({
  firstName: z.string().trim().min(1).max(25),
  lastName: z.string().trim().max(25).optional().default(""),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  clientName: z.string().trim().min(2).max(255),
  websiteUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  redirectUris: z.array(z.string().trim().url()).min(1),
  backchannelLogoutUri: z.union([z.string().trim().url(), z.literal("")]).optional(),
  applicationType: z.enum(["web", "native"]).default("web"),
  tokenEndpointAuthMethod: tokenEndpointAuthMethodSchema.default("client_secret_post").optional(),
  clientId: z
    .string()
    .trim()
    .min(3)
    .max(255)
    .regex(/^[a-zA-Z0-9._-]+$/)
    .optional(),
});
