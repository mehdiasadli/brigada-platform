import { createEnv, z } from "@brigada/env";

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    AUTH_COOKIE_DOMAIN: z.string().optional(),
    AUTH_TRUSTED_ORIGINS: z
      .string()
      .default(
        "http://localhost:3000,http://localhost:4000,https://auth.brigada.com,https://www.brigada.com",
      )
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
  },
  runtimeEnv: process.env,
});
