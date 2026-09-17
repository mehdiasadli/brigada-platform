import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Guild } from "discord.js";
import { Context, type ContextOf, On, Once } from "necord";
import { DiscordGuildLock } from "./discord-guild-lock";

@Injectable()
export class DiscordGateway {
  private readonly logger = new Logger(DiscordGateway.name);

  constructor(
    @Inject(DiscordGuildLock) private readonly guildLock: DiscordGuildLock,
  ) {}

  @Once("clientReady")
  async onReady(@Context() [client]: ContextOf<"clientReady">) {
    this.logger.log(`Logged in as ${client.user.username}`);

    await Promise.all(
      client.guilds.cache
        .filter((guild) => !this.guildLock.allows(guild.id))
        .map((guild) => this.leaveUnauthorized(guild)),
    );
  }

  @On("error")
  onError(@Context() [error]: ContextOf<"error">) {
    this.logger.error(error);
  }

  @On("guildCreate")
  onGuildCreate(@Context() [guild]: ContextOf<"guildCreate">) {
    return this.leaveUnauthorized(guild);
  }

  private async leaveUnauthorized(guild: Guild) {
    if (this.guildLock.allows(guild.id)) {
      return;
    }

    this.logger.warn(`Leaving unauthorized guild ${guild.id}`);
    await guild.leave();
  }
}
