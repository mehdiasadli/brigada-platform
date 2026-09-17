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

export type ReadSession = {
  id: string;
  status: string;
  readingDeadline: string | null;
  book: ReadBook | null;
  candidates: Array<{
    title: string;
    author: string;
    pageCount: number;
    coverId: number | null;
    slug: string | null;
  }>;
  readers: Array<{ userId: string; username: string; name: string }>;
};

export type ReadProgress = {
  percentage: number;
  notes: string | null;
  isCompleted: boolean;
};

export type CurrentSession = {
  session: ReadSession;
  progress: ReadProgress | null;
  canReview: boolean;
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
    review: { id: string; rating: number; body: string | null } | null;
    progress: {
      percentage: number;
      notes: string | null;
      isCompleted: boolean;
    } | null;
  };
};
