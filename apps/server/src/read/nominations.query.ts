import { z } from "@brigada/env";
import { BadRequestException } from "@nestjs/common";

export const nominateBookSchema = z
  .object({
    reason: z.string().trim().min(1).max(280),
    bookId: z.uuid().optional(),
    olibKey: z.string().trim().min(1).max(120).optional(),
    title: z.string().trim().min(1).max(300).optional(),
    author: z.string().trim().min(1).max(200).optional(),
    pageCount: z.coerce.number().int().min(1).max(20_000).optional(),
    firstPublishYear: z.coerce.number().int().min(1000).max(2100).optional(),
    subtitle: z.string().trim().max(300).nullable().optional(),
    coverId: z.coerce.number().int().positive().nullable().optional(),
  })
  .refine((value) => Boolean(value.bookId || value.olibKey));

export function parseNominateBook(input: unknown) {
  const parsed = nominateBookSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Add a reason and a book");
  }

  return parsed.data;
}

export const nominationIdSchema = z.uuid();

export function parseNominationId(id: string) {
  const parsed = nominationIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new BadRequestException("Invalid nomination");
  }

  return parsed.data;
}

export const nominationStatusSchema = z.object({
  status: z.enum(["parked", "rejected"]),
});

export function parseNominationStatus(input: unknown) {
  const parsed = nominationStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Choose park or reject");
  }

  return parsed.data.status;
}
