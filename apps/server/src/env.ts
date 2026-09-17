import { createEnv, z } from "@brigada/env";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().int().positive().default(4000),
    DISCORD_BOT_TOKEN: z.string().min(1),
    DISCORD_GUILD_ID: z.string().regex(/^\d{17,20}$/),
  },
  runtimeEnv: process.env,
});
