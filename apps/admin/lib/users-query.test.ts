import { expect, test } from "bun:test";
import { parseUsersPageQuery, usersHref } from "./users-query";

test("defaults missing search params", () => {
  expect(parseUsersPageQuery({})).toEqual({
    page: 1,
    limit: 20,
    sort: "createdAt",
    order: "desc",
  });
});

test("keeps a selected user in the href", () => {
  expect(
    usersHref({
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
