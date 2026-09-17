import { expect, test } from "bun:test";
import { toMemberSession, toMemberSessionSummary } from "./sessions.member";
import type { ReadSessionDetail } from "./sessions.types";

const session: ReadSessionDetail = {
  id: "55555555-5555-4555-8555-555555555555",
  bookId: "33333333-3333-4333-8333-333333333333",
  status: "completed",
  votingStartedAt: null,
  votingDeadline: null,
  votingEndedAt: null,
  startedAt: new Date("2026-09-01"),
  completedAt: new Date("2026-09-14"),
  cancelledAt: null,
  readingDeadline: new Date("2026-09-14"),
  discordPollMessageId: "m1",
  discordPollChannelId: "c1",
  midtermPostedAt: null,
  createdAt: new Date("2026-08-01"),
  updatedAt: new Date("2026-09-14"),
  book: {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Dune",
    slug: "dune",
    olibKey: "/works/OL1W",
    author: "Frank Herbert",
    pageCount: 412,
    firstPublishYear: 1965,
    subtitle: null,
    description: "secret blurb",
    coverId: 9,
    status: "completed",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  candidates: [],
  readers: [
    {
      userId: "u1",
      username: "ada",
      name: "Ada",
      image: "https://cdn.example/ada.png",
      progress: {
        percentage: 100,
        notes: "private note",
        isCompleted: true,
        startedAt: new Date("2026-09-01"),
        completedAt: new Date("2026-09-10"),
        progressUpdatedAt: new Date("2026-09-10"),
      },
      review: { rating: 8, body: "private review body" },
    },
    {
      userId: "u2",
      username: "al",
      name: "Al",
      image: null,
      progress: {
        percentage: 40,
        notes: "another note",
        isCompleted: false,
        startedAt: null,
        completedAt: null,
        progressUpdatedAt: new Date("2026-09-08"),
      },
      review: null,
    },
  ],
};

test("strips notes and review bodies from member sessions", () => {
  const member = toMemberSession(session);

  expect(member.book).toMatchObject({ title: "Dune", slug: "dune" });
  expect(member.book && "description" in member.book).toBe(false);
  expect(member.readers[0]).toEqual({
    userId: "u1",
    username: "ada",
    name: "Ada",
    image: "https://cdn.example/ada.png",
    progress: { percentage: 100, isCompleted: true },
    rating: 8,
  });
  expect(member.averageRating).toBe(8);
  expect(JSON.stringify(member)).not.toContain("private");
});

test("summarizes a member session for the archive list", () => {
  expect(toMemberSessionSummary(toMemberSession(session))).toEqual({
    id: session.id,
    status: "completed",
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    readingDeadline: session.readingDeadline,
    book: {
      id: session.book?.id,
      title: "Dune",
      slug: "dune",
      author: "Frank Herbert",
      pageCount: 412,
      firstPublishYear: 1965,
      subtitle: null,
      coverId: 9,
      status: "completed",
    },
    readerCount: 2,
    averageRating: 8,
  });
});
