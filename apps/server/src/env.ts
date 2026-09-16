import { createEnv, z } from "@brigada/env";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().int().positive().default(4000),
  },
  runtimeEnv: process.env,
});
