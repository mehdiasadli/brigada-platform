import { createEnv, z } from "@brigada/env";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_URL_UNPOOLED: z.string().url().optional(),
  },
  runtimeEnv: process.env,
});
