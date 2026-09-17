import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { NecordExecutionContext, type SlashCommandContext } from "necord";
import { DiscordGuildLock } from "./discord-guild-lock";

@Injectable()
export class GuildLockGuard implements CanActivate {
  constructor(
    @Inject(DiscordGuildLock) private readonly guildLock: DiscordGuildLock,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const [interaction] =
      NecordExecutionContext.create(context).getContext<SlashCommandContext>();

    return this.guildLock.allows(interaction.guildId);
  }
}
