import { READ_BOOK_STATUS_VALUES } from "@brigada/db/schema";
import { z } from "@brigada/env";
import { BadRequestException } from "@nestjs/common";

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
