import { expect, test } from "bun:test";
import { createEnv, z } from "@brigada/env";

const schema = {
  server: {
    PORT: z.coerce.number().int().positive().default(4000),
    DISCORD_BOT_TOKEN: z.string().min(1),
    DISCORD_GUILD_ID: z.string().regex(/^\d{17,20}$/),
    DISCORD_READ_CHANNEL_ID: z.string().regex(/^\d{17,20}$/),
  },
} as const;

const discord = {
  DISCORD_BOT_TOKEN: "bot-token",
  DISCORD_GUILD_ID: "123456789012345678",
  DISCORD_READ_CHANNEL_ID: "123456789012345679",
} as const;

test("defaults to port 4000", () => {
  const env = createEnv({
    ...schema,
    runtimeEnv: discord,
  });

  expect(env.PORT).toBe(4000);
});

test("accepts an explicit port", () => {
  const env = createEnv({
    ...schema,
    runtimeEnv: { ...discord, PORT: "4010" },
  });

  expect(env.PORT).toBe(4010);
});

test("rejects a missing bot token", () => {
  expect(() =>
    createEnv({
      ...schema,
      runtimeEnv: { DISCORD_GUILD_ID: discord.DISCORD_GUILD_ID },
    }),
  ).toThrow("Invalid environment variables");
});

test("rejects a non-snowflake guild id", () => {
  expect(() =>
    createEnv({
      ...schema,
      runtimeEnv: { ...discord, DISCORD_GUILD_ID: "not-a-snowflake" },
    }),
  ).toThrow("Invalid environment variables");
});
