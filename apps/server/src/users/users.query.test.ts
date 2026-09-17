import { expect, test } from "bun:test";
import { BadRequestException } from "@nestjs/common";
import { parseAdminUserId, parseAdminUserListQuery } from "./users.query";

test("defaults list query values", () => {
  expect(parseAdminUserListQuery({})).toEqual({
    page: 1,
    limit: 20,
    sort: "createdAt",
    order: "desc",
  });
});

test("accepts pagination and sort", () => {
  expect(
    parseAdminUserListQuery({
      page: "2",
      limit: "10",
      sort: "username",
      order: "asc",
    }),
  ).toEqual({
    page: 2,
    limit: 10,
    sort: "username",
    order: "asc",
  });
});

test("rejects an unknown sort field", () => {
  expect(() => parseAdminUserListQuery({ sort: "email" })).toThrow(
    BadRequestException,
  );
});

test("accepts a user uuid", () => {
  expect(parseAdminUserId("11111111-1111-4111-8111-111111111111")).toBe(
    "11111111-1111-4111-8111-111111111111",
  );
});

test("rejects a non-uuid user id", () => {
  expect(() => parseAdminUserId("not-a-uuid")).toThrow(BadRequestException);
});
