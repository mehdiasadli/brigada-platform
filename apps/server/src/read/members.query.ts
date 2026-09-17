import { z } from "@brigada/env";
import { BadRequestException } from "@nestjs/common";

export const readMemberUserIdSchema = z.uuid();

export function parseReadMemberUserId(id: string): string {
  const parsed = readMemberUserIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new BadRequestException("Invalid user id");
  }

  return parsed.data;
}

export const grantReadMemberSchema = z.object({
  userId: z.uuid(),
});

export function parseGrantReadMember(input: unknown) {
  const parsed = grantReadMemberSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Invalid read member payload");
  }

  return parsed.data;
}
