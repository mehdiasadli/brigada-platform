import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const READ_BOOK_STATUS_VALUES = [
  "readlist",
  "reading",
  "completed",
  "removed",
] as const;
export const readBookStatusEnum = pgEnum(
  "read_book_status",
  READ_BOOK_STATUS_VALUES,
);

export const READ_NOMINATION_STATUS_VALUES = [
  "open",
  "parked",
  "rejected",
] as const;
export const readNominationStatusEnum = pgEnum(
  "read_nomination_status",
  READ_NOMINATION_STATUS_VALUES,
);

export const READ_PARTICIPATION_VALUES = ["reading", "sat_out", "dnf"] as const;
export type ReadParticipation = (typeof READ_PARTICIPATION_VALUES)[number];

export const READ_SESSION_STATUS_VALUES = [
  "not_started",
  "voting",
  "active",
  "completed",
  "cancelled",
] as const;
export const readSessionStatusEnum = pgEnum(
  "read_session_status",
  READ_SESSION_STATUS_VALUES,
);

export const readMember = pgTable("read_member", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const readBook = pgTable("read_book", {
  id: uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  olibKey: text("olib_key").notNull().unique(),
  author: text("author").notNull(),
  pageCount: integer("page_count").notNull(),
  firstPublishYear: integer("first_publish_year").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  coverId: integer("cover_id"),
  status: readBookStatusEnum("status").default("readlist").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const readSession = pgTable(
  "read_session",
  {
    id: uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    bookId: uuid("book_id").references(() => readBook.id),
    status: readSessionStatusEnum("status").default("not_started").notNull(),
    votingStartedAt: timestamp("voting_started_at"),
    votingDeadline: timestamp("voting_deadline"),
    votingEndedAt: timestamp("voting_ended_at"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    cancelledAt: timestamp("cancelled_at"),
    readingDeadline: timestamp("reading_deadline"),
    discordPollMessageId: text("discord_poll_message_id"),
    discordPollChannelId: text("discord_poll_channel_id"),
    midtermPostedAt: timestamp("midterm_posted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("read_session_status_idx").on(table.status)],
);

export const readSessionCandidate = pgTable(
  "read_session_candidate",
  {
    id: uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => readSession.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => readBook.id),
    title: text("title").notNull(),
    author: text("author").notNull(),
    pageCount: integer("page_count").notNull(),
    firstPublishYear: integer("first_publish_year").notNull(),
    discordAnswerId: integer("discord_answer_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("read_session_candidate_session_book_idx").on(
      table.sessionId,
      table.bookId,
    ),
    index("read_session_candidate_session_idx").on(table.sessionId),
  ],
);

export const readSessionReader = pgTable(
  "read_session_reader",
  {
    id: uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => readSession.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    participation: text("participation")
      .$type<ReadParticipation>()
      .default("reading")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("read_session_reader_session_user_idx").on(
      table.sessionId,
      table.userId,
    ),
    index("read_session_reader_session_idx").on(table.sessionId),
  ],
);

export const readProgress = pgTable(
  "read_progress",
  {
    id: uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => readSession.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    percentage: integer("percentage").default(0).notNull(),
    notes: text("notes"),
    isCompleted: boolean("is_completed").default(false).notNull(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    progressUpdatedAt: timestamp("progress_updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("read_progress_session_user_idx").on(
      table.sessionId,
      table.userId,
    ),
  ],
);

export const readReview = pgTable(
  "read_review",
  {
    id: uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => readBook.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    body: text("body"),
    rating: integer("rating").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("read_review_book_user_idx").on(table.bookId, table.userId),
  ],
);

export const readNomination = pgTable(
  "read_nomination",
  {
    id: uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => readBook.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    status: readNominationStatusEnum("status").default("open").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("read_nomination_open_book_idx")
      .on(table.bookId)
      .where(sql`${table.status} = 'open'`),
    index("read_nomination_book_idx").on(table.bookId),
    index("read_nomination_status_idx").on(table.status),
  ],
);

export const readMemberRelations = relations(readMember, ({ one }) => ({
  user: one(user, {
    fields: [readMember.userId],
    references: [user.id],
  }),
}));

export const readBookRelations = relations(readBook, ({ many }) => ({
  sessions: many(readSession),
  candidates: many(readSessionCandidate),
  reviews: many(readReview),
  nominations: many(readNomination),
}));

export const readNominationRelations = relations(readNomination, ({ one }) => ({
  book: one(readBook, {
    fields: [readNomination.bookId],
    references: [readBook.id],
  }),
  user: one(user, {
    fields: [readNomination.userId],
    references: [user.id],
  }),
}));

export const readSessionRelations = relations(readSession, ({ one, many }) => ({
  book: one(readBook, {
    fields: [readSession.bookId],
    references: [readBook.id],
  }),
  candidates: many(readSessionCandidate),
  readers: many(readSessionReader),
  progresses: many(readProgress),
}));

export const readSessionCandidateRelations = relations(
  readSessionCandidate,
  ({ one }) => ({
    session: one(readSession, {
      fields: [readSessionCandidate.sessionId],
      references: [readSession.id],
    }),
    book: one(readBook, {
      fields: [readSessionCandidate.bookId],
      references: [readBook.id],
    }),
  }),
);

export const readSessionReaderRelations = relations(
  readSessionReader,
  ({ one }) => ({
    session: one(readSession, {
      fields: [readSessionReader.sessionId],
      references: [readSession.id],
    }),
    user: one(user, {
      fields: [readSessionReader.userId],
      references: [user.id],
    }),
  }),
);

export const readProgressRelations = relations(readProgress, ({ one }) => ({
  session: one(readSession, {
    fields: [readProgress.sessionId],
    references: [readSession.id],
  }),
  user: one(user, {
    fields: [readProgress.userId],
    references: [user.id],
  }),
}));

export const readReviewRelations = relations(readReview, ({ one }) => ({
  book: one(readBook, {
    fields: [readReview.bookId],
    references: [readBook.id],
  }),
  user: one(user, {
    fields: [readReview.userId],
    references: [user.id],
  }),
}));
