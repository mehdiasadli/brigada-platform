import { expect, test } from "bun:test";
import { authAppUrl } from "./auth-url";

test("sends the visitor to the auth app with ref_url", () => {
  expect(authAppUrl("http://localhost:3502/users")).toBe(
    "http://localhost:3500/?ref_url=http%3A%2F%2Flocalhost%3A3502%2Fusers",
  );
});
