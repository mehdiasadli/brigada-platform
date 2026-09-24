import { forwardRef, Module } from "@nestjs/common";
import { IntentsBitField } from "discord.js";
import { NecordModule } from "necord";
import { env } from "../env";
import { ReadModule } from "../read/read.module";
import {
  DISCORD_ALLOWED_GUILD_ID,
  DISCORD_READ_CHANNEL_ID,
} from "./discord.constants";
import { DiscordGateway } from "./discord.gateway";
import { DiscordAccountLookup } from "./discord-account";
import { DiscordGuildLock } from "./discord-guild-lock";
import { DiscordVotePublisher } from "./discord-vote.publisher";
import { GuildLockGuard } from "./guild-lock.guard";
import { PingCommand } from "./ping.command";
import { ProgressCommands } from "./progress.commands";
import { ReadLoop } from "./read-loop";

@Module({
  imports: [
    NecordModule.forRoot({
      token: env.DISCORD_BOT_TOKEN,
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
      ],
      development: [env.DISCORD_GUILD_ID],
    }),
    forwardRef(() => ReadModule),
  ],
  providers: [
    { provide: DISCORD_ALLOWED_GUILD_ID, useValue: env.DISCORD_GUILD_ID },
    { provide: DISCORD_READ_CHANNEL_ID, useValue: env.DISCORD_READ_CHANNEL_ID },
    DiscordGuildLock,
    GuildLockGuard,
    DiscordGateway,
    DiscordAccountLookup,
    DiscordVotePublisher,
    PingCommand,
    ProgressCommands,
    ReadLoop,
  ],
  exports: [DiscordVotePublisher, DISCORD_ALLOWED_GUILD_ID],
})
export class DiscordModule {}
