import { Module } from "@nestjs/common";
import { IntentsBitField } from "discord.js";
import { NecordModule } from "necord";
import { env } from "../env";
import { DISCORD_ALLOWED_GUILD_ID } from "./discord.constants";
import { DiscordGateway } from "./discord.gateway";
import { DiscordGuildLock } from "./discord-guild-lock";
import { GuildLockGuard } from "./guild-lock.guard";
import { PingCommand } from "./ping.command";

@Module({
  imports: [
    NecordModule.forRoot({
      token: env.DISCORD_BOT_TOKEN,
      intents: [IntentsBitField.Flags.Guilds],
      development: [env.DISCORD_GUILD_ID],
    }),
  ],
  providers: [
    { provide: DISCORD_ALLOWED_GUILD_ID, useValue: env.DISCORD_GUILD_ID },
    DiscordGuildLock,
    GuildLockGuard,
    DiscordGateway,
    PingCommand,
  ],
})
export class DiscordModule {}
