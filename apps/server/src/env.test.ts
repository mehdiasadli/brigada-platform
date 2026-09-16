import { expect, test } from "bun:test";
import { createEnv, z } from "@brigada/env";

const schema = {
  server: {
    PORT: z.coerce.number().int().positive().default(4000),
  },
} as const;

test("defaults to port 4000", () => {
  const env = createEnv({
    ...schema,
    runtimeEnv: {},
  });

  expect(env.PORT).toBe(4000);
});

test("accepts an explicit port", () => {
  const env = createEnv({
    ...schema,
    runtimeEnv: { PORT: "4010" },
  });

  expect(env.PORT).toBe(4010);
});
