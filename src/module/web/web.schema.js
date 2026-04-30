import { z } from "zod";

export const webLoginCallbackSchema = z.object({
  code: z.string().trim().min(1),
  state: z.string().trim().min(1),
});
