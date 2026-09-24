import type { ReadBook } from "./books.types";
import type { ReadSessionDetail } from "./sessions.types";

export type MemberSessionBook = Pick<
  ReadBook,
  | "id"
  | "title"
  | "slug"
  | "author"
  | "pageCount"
  | "firstPublishYear"
  | "subtitle"
  | "coverId"
  | "status"
>;

export type MemberSessionReader = {
  userId: string;
  username: string;
  name: string;
  image: string | null;
  participation: ReadSessionDetail["readers"][number]["participation"];
  progress: { percentage: number; isCompleted: boolean } | null;
  rating: number | null;
};

export type MemberSession = {
  id: string;
  status: ReadSessionDetail["status"];
  votingStartedAt: Date | null;
  votingDeadline: Date | null;
  votingEndedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  readingDeadline: Date | null;
  discordPollMessageId: string | null;
  discordPollChannelId: string | null;
  pollUrl: string | null;
  book: MemberSessionBook | null;
  candidates: ReadSessionDetail["candidates"];
  readers: MemberSessionReader[];
  averageRating: number | null;
};

function toMemberBook(book: ReadBook): MemberSessionBook {
  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    author: book.author,
    pageCount: book.pageCount,
    firstPublishYear: book.firstPublishYear,
    subtitle: book.subtitle,
    coverId: book.coverId,
    status: book.status,
  };
}

export function discordPollUrl(
  guildId: string | null | undefined,
  channelId: string | null,
  messageId: string | null,
) {
  if (!guildId || !channelId || !messageId) {
    return null;
  }

  return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
}

export function toMemberSession(
  session: ReadSessionDetail,
  guildId?: string | null,
): MemberSession {
  const readers = session.readers.map((reader) => ({
    userId: reader.userId,
    username: reader.username,
    name: reader.name,
    image: reader.image,
    participation: reader.participation,
    progress: reader.progress
      ? {
          percentage: reader.progress.percentage,
          isCompleted: reader.progress.isCompleted,
        }
      : null,
    rating: reader.review?.rating ?? null,
  }));
  const ratings = readers.flatMap((reader) =>
    reader.rating === null ? [] : [reader.rating],
  );

  return {
    id: session.id,
    status: session.status,
    votingStartedAt: session.votingStartedAt,
    votingDeadline: session.votingDeadline,
    votingEndedAt: session.votingEndedAt,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    cancelledAt: session.cancelledAt,
    readingDeadline: session.readingDeadline,
    discordPollMessageId: session.discordPollMessageId,
    discordPollChannelId: session.discordPollChannelId,
    pollUrl: discordPollUrl(
      guildId,
      session.discordPollChannelId,
      session.discordPollMessageId,
    ),
    book: session.book ? toMemberBook(session.book) : null,
    candidates: session.candidates,
    readers,
    averageRating:
      ratings.length === 0
        ? null
        : ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
  };
}

export function toMemberSessionSummary(session: MemberSession) {
  return {
    id: session.id,
    status: session.status,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    readingDeadline: session.readingDeadline,
    book: session.book,
    readerCount: session.readers.length,
    averageRating: session.averageRating,
  };
}
