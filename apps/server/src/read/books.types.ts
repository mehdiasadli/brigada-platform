import type { READ_BOOK_STATUS_VALUES } from "@brigada/db/schema";

export type ReadBookStatus = (typeof READ_BOOK_STATUS_VALUES)[number];

export type ReadBook = {
  id: string;
  title: string;
  slug: string;
  olibKey: string;
  author: string;
  pageCount: number;
  firstPublishYear: number;
  subtitle: string | null;
  description: string | null;
  coverId: number | null;
  status: ReadBookStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateReadBook = {
  olibKey: string;
  title: string;
  author: string;
  pageCount: number;
  firstPublishYear: number;
  subtitle?: string | null;
  description?: string | null;
  coverId?: number | null;
};

export type UpdateReadBook = Partial<
  Omit<CreateReadBook, "olibKey"> & { status: ReadBookStatus; slug: string }
>;

export type CatalogListQuery = {
  q?: string;
  status?: Exclude<ReadBookStatus, "removed">;
  minYear?: number;
  maxYear?: number;
  minPages?: number;
  maxPages?: number;
  sort: "createdAt" | "firstPublishYear" | "pageCount";
  order: "asc" | "desc";
  cursor?: { value: string; id: string };
  limit: number;
};

export type CatalogPage = {
  items: ReadBook[];
  nextCursor: string | null;
};

export type ReadBooksStore = {
  list(): Promise<ReadBook[]>;
  listVisible(): Promise<ReadBook[]>;
  listCatalog(query: CatalogListQuery): Promise<CatalogPage>;
  findById(id: string): Promise<ReadBook | null>;
  findBySlug(slug: string): Promise<ReadBook | null>;
  findByOlibKey(olibKey: string): Promise<ReadBook | null>;
  listSlugs(): Promise<string[]>;
  insert(book: CreateReadBook & { slug: string }): Promise<ReadBook>;
  update(id: string, patch: UpdateReadBook): Promise<ReadBook | null>;
  listReviews(bookId: string): Promise<
    Array<{
      id: string;
      userId: string;
      username: string;
      name: string;
      body: string | null;
      rating: number;
      createdAt: Date;
    }>
  >;
  findReview(
    userId: string,
    bookId: string,
  ): Promise<{
    id: string;
    rating: number;
    body: string | null;
  } | null>;
  hasCompletedBook(userId: string, bookId: string): Promise<boolean>;
  findProgressForBook(
    userId: string,
    bookId: string,
  ): Promise<{
    percentage: number;
    notes: string | null;
    isCompleted: boolean;
  } | null>;
};
