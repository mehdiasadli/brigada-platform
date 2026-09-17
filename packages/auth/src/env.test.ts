import { expect, test } from "bun:test";
import { createEnv, z } from "@brigada/env";

const schema = {
  server: {
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    AUTH_COOKIE_DOMAIN: z.string().optional(),
  },
} as const;

test("accepts a 32+ character secret and auth url", () => {
  const env = createEnv({
    ...schema,
    runtimeEnv: {
      BETTER_AUTH_SECRET: "a".repeat(32),
      BETTER_AUTH_URL: "http://localhost:4000",
      DISCORD_CLIENT_ID: "discord-app-id",
      DISCORD_CLIENT_SECRET: "discord-app-secret",
    },
  });

  expect(env.BETTER_AUTH_URL).toBe("http://localhost:4000");
  expect(env.AUTH_COOKIE_DOMAIN).toBeUndefined();
});

test("splits trusted origins on commas", () => {
  const env = createEnv({
    server: {
      ...schema.server,
      AUTH_TRUSTED_ORIGINS: z.string().transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    },
    runtimeEnv: {
      BETTER_AUTH_SECRET: "a".repeat(32),
      BETTER_AUTH_URL: "http://localhost:4000",
      DISCORD_CLIENT_ID: "discord-app-id",
      DISCORD_CLIENT_SECRET: "discord-app-secret",
      AUTH_TRUSTED_ORIGINS: "http://localhost:3501, https://auth.brigada.com",
    },
  });

  expect(env.AUTH_TRUSTED_ORIGINS).toEqual([
    "http://localhost:3501",
    "https://auth.brigada.com",
  ]);
});

test("rejects a short secret", () => {
  expect(() =>
    createEnv({
      ...schema,
      runtimeEnv: {
        BETTER_AUTH_SECRET: "too-short",
        BETTER_AUTH_URL: "http://localhost:4000",
        DISCORD_CLIENT_ID: "discord-app-id",
        DISCORD_CLIENT_SECRET: "discord-app-secret",
      },
    }),
  ).toThrow("Invalid environment variables");
});
