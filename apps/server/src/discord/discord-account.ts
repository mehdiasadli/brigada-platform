import { db } from "@brigada/db";
import { account } from "@brigada/db/schema";
import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

@Injectable()
export class DiscordAccountLookup {
  async userIdForDiscord(discordId: string) {
    const [row] = await db
      .select({ userId: account.userId })
      .from(account)
      .where(
        and(
          eq(account.providerId, "discord"),
          eq(account.accountId, discordId),
        ),
      )
      .limit(1);

    return row?.userId ?? null;
  }
}
