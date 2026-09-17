import { expect, test } from "bun:test";
import {
  isBrigadaUsername,
  userFieldsFromDiscordProfile,
  usernameFromDiscord,
} from "./username";

test("accepts lowercase handles that start with a letter", () => {
  expect(isBrigadaUsername("abc")).toBe(true);
  expect(isBrigadaUsername("user_1")).toBe(true);
  expect(isBrigadaUsername("a1b2c3")).toBe(true);
  expect(isBrigadaUsername("ab")).toBe(false);
});

test("rejects leading digits, trailing or doubled underscores, and non-ascii", () => {
  expect(isBrigadaUsername("1abc")).toBe(false);
  expect(isBrigadaUsername("_abc")).toBe(false);
  expect(isBrigadaUsername("abc_")).toBe(false);
  expect(isBrigadaUsername("ab__c")).toBe(false);
  expect(isBrigadaUsername("Abc")).toBe(false);
  expect(isBrigadaUsername("ab-c")).toBe(false);
  expect(isBrigadaUsername("ab.c")).toBe(false);
});

test("uses a valid Discord handle as the Brigada username", () => {
  expect(usernameFromDiscord("mehdi", "123456789012345678")).toBe("mehdi");
  expect(usernameFromDiscord("user_1", "1")).toBe("user_1");
});

test("prefixes Discord handles that start with a digit", () => {
  expect(usernameFromDiscord("1abc", "99")).toBe("u_1abc");
});

test("falls back to a Discord-id handle when the name cannot be a username", () => {
  expect(usernameFromDiscord("ab", "123456789012345678")).toBe(
    "d123456789012345678",
  );
  expect(usernameFromDiscord("", "42")).toBe("d42");
});

test("maps Discord profile fields including a required username", () => {
  expect(
    userFieldsFromDiscordProfile({
      id: "123456789012345678",
      username: "mehdi",
      global_name: "Mehdi Asadli",
      email: "mehdi@example.com",
      image_url: "https://cdn.discordapp.com/avatars/1.png",
    }),
  ).toEqual({
    email: "mehdi@example.com",
    name: "Mehdi Asadli",
    image: "https://cdn.discordapp.com/avatars/1.png",
    username: "mehdi",
  });
});
