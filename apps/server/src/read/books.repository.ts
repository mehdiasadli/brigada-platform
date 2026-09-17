import { db } from "@brigada/db";
import {
  readBook,
  readProgress,
  readReview,
  readSession,
  user,
} from "@brigada/db/schema";
import { Injectable } from "@nestjs/common";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  ne,
  or,
  type SQL,
} from "drizzle-orm";
import {
  catalogSortValue,
  encodeCatalogCursor,
  escapeIlike,
} from "./books.catalog";
import type {
  CatalogListQuery,
  CatalogPage,
  CreateReadBook,
  ReadBook,
  ReadBooksStore,
  UpdateReadBook,
} from "./books.types";

const bookColumns = {
  id: readBook.id,
  title: readBook.title,
  slug: readBook.slug,
  olibKey: readBook.olibKey,
  author: readBook.author,
  pageCount: readBook.pageCount,
  firstPublishYear: readBook.firstPublishYear,
  subtitle: readBook.subtitle,
  description: readBook.description,
  coverId: readBook.coverId,
  status: readBook.status,
  createdAt: readBook.createdAt,
  updatedAt: readBook.updatedAt,
} as const;

@Injectable()
export class ReadBooksRepository implements ReadBooksStore {
  async list() {
    return (await db
      .select(bookColumns)
      .from(readBook)
      .orderBy(desc(readBook.createdAt))) as ReadBook[];
  }

  async listVisible() {
    return (await db
      .select(bookColumns)
      .from(readBook)
      .where(ne(readBook.status, "removed"))
      .orderBy(readBook.title)) as ReadBook[];
  }

  async listCatalog(query: CatalogListQuery): Promise<CatalogPage> {
    const filters: SQL[] = [
      query.status
        ? eq(readBook.status, query.status)
        : ne(readBook.status, "removed"),
    ];

    if (query.q) {
      const pattern = `%${escapeIlike(query.q)}%`;
      const search = or(
        ilike(readBook.title, pattern),
        ilike(readBook.author, pattern),
      );
      if (search) {
        filters.push(search);
      }
    }

    if (query.minYear !== undefined) {
      filters.push(gte(readBook.firstPublishYear, query.minYear));
    }
    if (query.maxYear !== undefined) {
      filters.push(lte(readBook.firstPublishYear, query.maxYear));
    }
    if (query.minPages !== undefined) {
      filters.push(gte(readBook.pageCount, query.minPages));
    }
    if (query.maxPages !== undefined) {
      filters.push(lte(readBook.pageCount, query.maxPages));
    }

    const sortColumn =
      query.sort === "firstPublishYear"
        ? readBook.firstPublishYear
        : query.sort === "pageCount"
          ? readBook.pageCount
          : readBook.createdAt;

    if (query.cursor) {
      const cursorValue =
        query.sort === "createdAt"
          ? new Date(query.cursor.value)
          : Number(query.cursor.value);
      const cmp = query.order === "asc" ? gt : lt;
      const idCmp = query.order === "asc" ? gt : lt;
      const after = or(
        cmp(sortColumn, cursorValue),
        and(eq(sortColumn, cursorValue), idCmp(readBook.id, query.cursor.id)),
      );
      if (after) {
        filters.push(after);
      }
    }

    const direction = query.order === "asc" ? asc : desc;
    const rows = (await db
      .select(bookColumns)
      .from(readBook)
      .where(and(...filters))
      .orderBy(direction(sortColumn), direction(readBook.id))
      .limit(query.limit + 1)) as ReadBook[];

    const hasMore = rows.length > query.limit;
    const items = hasMore ? rows.slice(0, query.limit) : rows;
    const last = items.at(-1);

    return {
      items,
      nextCursor:
        hasMore && last
          ? encodeCatalogCursor({
              value: catalogSortValue(query.sort, last),
              id: last.id,
            })
          : null,
    };
  }

  async findById(id: string) {
    const [row] = await db
      .select(bookColumns)
      .from(readBook)
      .where(eq(readBook.id, id))
      .limit(1);

    return (row as ReadBook | undefined) ?? null;
  }

  async findBySlug(slug: string) {
    const [row] = await db
      .select(bookColumns)
      .from(readBook)
      .where(eq(readBook.slug, slug))
      .limit(1);

    return (row as ReadBook | undefined) ?? null;
  }

  async findByOlibKey(olibKey: string) {
    const [row] = await db
      .select(bookColumns)
      .from(readBook)
      .where(eq(readBook.olibKey, olibKey))
      .limit(1);

    return (row as ReadBook | undefined) ?? null;
  }

  async listSlugs() {
    const rows = await db.select({ slug: readBook.slug }).from(readBook);
    return rows.map((row) => row.slug);
  }

  async insert(book: CreateReadBook & { slug: string }) {
    const [row] = await db.insert(readBook).values(book).returning(bookColumns);
    if (!row) {
      throw new Error("Failed to create book");
    }

    return row as ReadBook;
  }

  async listReviews(bookId: string) {
    return db
      .select({
        id: readReview.id,
        userId: readReview.userId,
        username: user.username,
        name: user.name,
        body: readReview.body,
        rating: readReview.rating,
        createdAt: readReview.createdAt,
      })
      .from(readReview)
      .innerJoin(user, eq(user.id, readReview.userId))
      .where(eq(readReview.bookId, bookId))
      .orderBy(desc(readReview.createdAt));
  }

  async findReview(userId: string, bookId: string) {
    const [row] = await db
      .select({
        id: readReview.id,
        rating: readReview.rating,
        body: readReview.body,
      })
      .from(readReview)
      .where(and(eq(readReview.userId, userId), eq(readReview.bookId, bookId)))
      .limit(1);

    return row ?? null;
  }

  async hasCompletedBook(userId: string, bookId: string) {
    const [row] = await db
      .select({ id: readProgress.id })
      .from(readProgress)
      .innerJoin(readSession, eq(readSession.id, readProgress.sessionId))
      .where(
        and(
          eq(readProgress.userId, userId),
          eq(readProgress.isCompleted, true),
          eq(readSession.bookId, bookId),
        ),
      )
      .limit(1);

    return Boolean(row);
  }

  async findProgressForBook(userId: string, bookId: string) {
    const [row] = await db
      .select({
        percentage: readProgress.percentage,
        notes: readProgress.notes,
        isCompleted: readProgress.isCompleted,
      })
      .from(readProgress)
      .innerJoin(readSession, eq(readSession.id, readProgress.sessionId))
      .where(
        and(
          eq(readProgress.userId, userId),
          eq(readSession.bookId, bookId),
          inArray(readSession.status, ["active", "completed"]),
        ),
      )
      .orderBy(desc(readSession.updatedAt))
      .limit(1);

    return row ?? null;
  }

  async update(id: string, patch: UpdateReadBook) {
    const [row] = await db
      .update(readBook)
      .set(patch)
      .where(eq(readBook.id, id))
      .returning(bookColumns);

    return (row as ReadBook | undefined) ?? null;
  }
}
