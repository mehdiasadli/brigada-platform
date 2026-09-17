import { expect, test } from "bun:test";
import { ROLE_VALUES } from "@brigada/db/schema";
import { roles } from "./permissions";

test("Better Auth roles match the database user_role enum", () => {
  expect(Object.keys(roles).sort()).toEqual([...ROLE_VALUES].sort());
});
