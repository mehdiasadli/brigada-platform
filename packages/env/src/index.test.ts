import { expect, test } from "bun:test";
import { createEnv, z } from "./index";

test("treats empty strings as undefined so defaults apply", () => {
  const env = createEnv({
    server: {
      PORT: z.coerce.number().default(3000),
    },
    runtimeEnv: {
      PORT: "",
    },
  });

  expect(env.PORT).toBe(3000);
});

test("validates required server variables", () => {
  expect(() =>
    createEnv({
      server: {
        DATABASE_URL: z.string().url(),
      },
      runtimeEnv: {},
    }),
  ).toThrow("Invalid environment variables");
});
