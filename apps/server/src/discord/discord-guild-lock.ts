import { Inject, Injectable } from "@nestjs/common";
import { DISCORD_ALLOWED_GUILD_ID } from "./discord.constants";

@Injectable()
export class DiscordGuildLock {
  constructor(
    @Inject(DISCORD_ALLOWED_GUILD_ID)
    private readonly allowedGuildId: string,
  ) {}

  allows(guildId: string | null | undefined): boolean {
    return guildId === this.allowedGuildId;
  }
}
