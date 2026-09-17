import { Injectable, UseGuards } from "@nestjs/common";
import { Context, SlashCommand, type SlashCommandContext } from "necord";
import { GuildLockGuard } from "./guild-lock.guard";

@Injectable()
@UseGuards(GuildLockGuard)
export class PingCommand {
  @SlashCommand({
    name: "ping",
    description: "Check that the bot is awake",
  })
  ping(@Context() [interaction]: SlashCommandContext) {
    return interaction.reply({ content: "Pong" });
  }
}
