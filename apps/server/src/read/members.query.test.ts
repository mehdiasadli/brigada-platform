import { expect, test } from "bun:test";
import { BadRequestException } from "@nestjs/common";
import { parseGrantReadMember, parseReadMemberUserId } from "./members.query";

const userId = "11111111-1111-4111-8111-111111111111";

test("accepts a user id", () => {
  expect(parseReadMemberUserId(userId)).toBe(userId);
  expect(parseGrantReadMember({ userId })).toEqual({ userId });
});

test("rejects an invalid user id", () => {
  expect(() => parseReadMemberUserId("nope")).toThrow(BadRequestException);
  expect(() => parseGrantReadMember({})).toThrow(BadRequestException);
});
