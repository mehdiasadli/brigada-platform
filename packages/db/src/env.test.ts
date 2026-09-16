import { expect, test } from "bun:test";
import { createEnv, z } from "@brigada/env";

const schema = {
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_URL_UNPOOLED: z.string().url().optional(),
  },
} as const;

test("accepts a postgres connection string", () => {
  const env = createEnv({
    ...schema,
    runtimeEnv: {
      DATABASE_URL:
        "postgresql://user:pass@ep-example-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
    },
  });

  expect(env.DATABASE_URL).toContain("neon.tech");
  expect(env.DATABASE_URL_UNPOOLED).toBeUndefined();
});

test("rejects a missing DATABASE_URL", () => {
  expect(() =>
    createEnv({
      ...schema,
      runtimeEnv: {},
    }),
  ).toThrow("Invalid environment variables");
});
