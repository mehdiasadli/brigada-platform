import { createEnv, z } from "@brigada/env";

export const env = createEnv({
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3501"),
    NEXT_PUBLIC_AUTH_APP_URL: z.url().default("http://localhost:3500"),
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url().default("http://localhost:4000"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_AUTH_APP_URL: process.env.NEXT_PUBLIC_AUTH_APP_URL,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  },
});
