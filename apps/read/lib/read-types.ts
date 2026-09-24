export type ReadBook = {
  id: string;
  title: string;
  slug: string;
  author: string;
  pageCount: number;
  firstPublishYear: number;
  subtitle: string | null;
  description: string | null;
  coverId: number | null;
  status: "readlist" | "reading" | "completed" | "removed";
};

export type MemberSessionBook = {
  id: string;
  title: string;
  slug: string;
  author: string;
  pageCount: number;
  firstPublishYear: number;
  subtitle: string | null;
  coverId: number | null;
  status: ReadBook["status"];
};

export type MemberSessionReader = {
  userId: string;
  username: string;
  name: string;
  image: string | null;
  progress: { percentage: number; isCompleted: boolean } | null;
  rating: number | null;
};

export type MemberSession = {
  id: string;
  status: string;
  votingStartedAt: string | null;
  votingDeadline: string | null;
  votingEndedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  readingDeadline: string | null;
  discordPollMessageId: string | null;
  discordPollChannelId: string | null;
  book: MemberSessionBook | null;
  candidates: Array<{
    title: string;
    author: string;
    pageCount: number;
    coverId: number | null;
    slug: string | null;
    bookId?: string;
    nominationReason: string | null;
    nominatorName: string | null;
  }>;
  readers: MemberSessionReader[];
  averageRating: number | null;
};

export type MemberSessionSummary = {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  readingDeadline: string | null;
  book: MemberSessionBook | null;
  readerCount: number;
  averageRating: number | null;
};

export type ReadProgress = {
  percentage: number;
  notes: string | null;
  isCompleted: boolean;
};

export type CurrentSession = {
  session: MemberSession;
  progress: ReadProgress | null;
  canReview: boolean;
  review: { rating: number; body: string | null } | null;
} | null;

export type CatalogPage = {
  items: ReadBook[];
  nextCursor: string | null;
};

export type BookPage = {
  book: ReadBook;
  reviews: Array<{
    id: string;
    username: string;
    name: string;
    body: string | null;
    rating: number;
  }>;
  viewer: {
    canReview: boolean;
    canUpdateProgress: boolean;
    canNominate: boolean;
    review: { id: string; rating: number; body: string | null } | null;
    progress: {
      percentage: number;
      notes: string | null;
      isCompleted: boolean;
    } | null;
    nomination: {
      reason: string;
      nominatorName: string;
      mine: boolean;
    } | null;
  };
};
