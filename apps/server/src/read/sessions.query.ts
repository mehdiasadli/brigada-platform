import { z } from "@brigada/env";
import { BadRequestException } from "@nestjs/common";

export const readSessionIdSchema = z.uuid();

export function parseReadSessionId(id: string) {
  const parsed = readSessionIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new BadRequestException("Invalid session id");
  }

  return parsed.data;
}

export const slateSchema = z.object({
  bookIds: z.array(z.uuid()).min(2).max(10),
});

export function parseSlate(input: unknown) {
  const parsed = slateSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Invalid slate");
  }

  return parsed.data;
}

export const resolveVoteSchema = z
  .object({
    winnerBookId: z.uuid().optional(),
    random: z.boolean().optional(),
  })
  .refine((value) => Boolean(value.winnerBookId || value.random), {
    message: "Choose a winner or pick randomly",
  });

export function parseResolveVote(input: unknown) {
  const parsed = resolveVoteSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Invalid vote resolution");
  }

  return parsed.data;
}

export const progressSchema = z.object({
  bookId: z.uuid().optional(),
  percentage: z.coerce.number().int().min(0).max(100),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export function parseProgress(input: unknown) {
  const parsed = progressSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Invalid progress");
  }

  return parsed.data;
}

export const reviewSchema = z.object({
  bookId: z.uuid(),
  rating: z.coerce.number().int().min(0).max(10),
  body: z.string().trim().max(20_000).nullable().optional(),
});

export const participationSchema = z.object({
  participation: z.enum(["reading", "sat_out", "dnf"]),
});

export function parseParticipation(input: unknown) {
  const parsed = participationSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Invalid participation");
  }

  return parsed.data.participation;
}

export function parseReview(input: unknown) {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Invalid review");
  }

  return parsed.data;
}
