import { expect, test } from "bun:test";
import { serializeUsersSearch } from "./users-query";

test("omits default search params", () => {
  expect(serializeUsersSearch("/users", {})).toBe("/users");
});

test("keeps a selected user in the href", () => {
  expect(
    serializeUsersSearch("/users", {
      page: 2,
      limit: 10,
      sort: "username",
      order: "asc",
      user: "11111111-1111-4111-8111-111111111111",
    }),
  ).toBe(
    "/users?page=2&limit=10&sort=username&order=asc&user=11111111-1111-4111-8111-111111111111",
  );
});
