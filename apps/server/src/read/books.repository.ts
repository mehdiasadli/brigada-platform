import { db } from "@brigada/db";
import { readBook } from "@brigada/db/schema";
import { Injectable } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import type {
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

  async findById(id: string) {
    const [row] = await db
      .select(bookColumns)
      .from(readBook)
      .where(eq(readBook.id, id))
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

  async update(id: string, patch: UpdateReadBook) {
    const [row] = await db
      .update(readBook)
      .set(patch)
      .where(eq(readBook.id, id))
      .returning(bookColumns);

    return (row as ReadBook | undefined) ?? null;
  }
}
