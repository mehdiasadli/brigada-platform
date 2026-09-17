import { READ_BOOK_STATUS_VALUES } from "@brigada/db/schema";
import { z } from "@brigada/env";
import { BadRequestException } from "@nestjs/common";
import { CATALOG_SORT_FIELDS, decodeCatalogCursor } from "./books.catalog";

export const readBookIdSchema = z.uuid();

export function parseReadBookId(id: string) {
  const parsed = readBookIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new BadRequestException("Invalid book id");
  }

  return parsed.data;
}

export const searchBooksQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
});

export function parseSearchBooksQuery(input: unknown) {
  const parsed = searchBooksQuerySchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Invalid book search query");
  }

  return parsed.data;
}

export const createReadBookSchema = z.object({
  olibKey: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(300),
  author: z.string().trim().min(1).max(200),
  pageCount: z.coerce.number().int().min(1).max(20_000),
  firstPublishYear: z.coerce.number().int().min(1000).max(2100),
  subtitle: z.string().trim().max(300).nullable().optional(),
  description: z.string().trim().max(10_000).nullable().optional(),
  coverId: z.coerce.number().int().positive().nullable().optional(),
});

export function parseCreateReadBook(input: unknown) {
  const parsed = createReadBookSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Invalid book payload");
  }

  return parsed.data;
}

export const updateReadBookSchema = createReadBookSchema
  .omit({ olibKey: true })
  .partial()
  .extend({
    status: z.enum(READ_BOOK_STATUS_VALUES).optional(),
  });

export function parseUpdateReadBook(input: unknown) {
  const parsed = updateReadBookSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Invalid book payload");
  }

  return parsed.data;
}

const visibleBookStatus = z.enum(["readlist", "reading", "completed"]);

export const catalogQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: visibleBookStatus.optional(),
  minYear: z.coerce.number().int().min(1000).max(2100).optional(),
  maxYear: z.coerce.number().int().min(1000).max(2100).optional(),
  minPages: z.coerce.number().int().min(1).max(20_000).optional(),
  maxPages: z.coerce.number().int().min(1).max(20_000).optional(),
  sort: z.enum(CATALOG_SORT_FIELDS).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export function parseCatalogQuery(input: unknown) {
  const parsed = catalogQuerySchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Invalid book catalog query");
  }

  let cursor: ReturnType<typeof decodeCatalogCursor> | undefined;
  if (parsed.data.cursor) {
    try {
      cursor = decodeCatalogCursor(parsed.data.cursor);
    } catch {
      throw new BadRequestException("Invalid book catalog cursor");
    }
  }

  return { ...parsed.data, q: parsed.data.q || undefined, cursor };
}
