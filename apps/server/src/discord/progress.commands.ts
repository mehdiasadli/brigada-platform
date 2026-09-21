import { HttpException, Inject, Injectable, UseGuards } from "@nestjs/common";
import type { User } from "discord.js";
import {
  Context,
  Options,
  SlashCommand,
  type SlashCommandContext,
  StringOption,
  UserOption,
} from "necord";
import { ReadSessionsService } from "../read/sessions.service";
import { DiscordAccountLookup } from "./discord-account";
import { GuildLockGuard } from "./guild-lock.guard";
import { parsePercentage } from "./progress-input";

class SetProgressOptions {
  @StringOption({
    name: "percentage",
    description: "How far you are, as a whole number from 0 to 100",
    required: false,
  })
  percentage?: string;

  @StringOption({
    name: "notes",
    description: "Optional note, only you can see it",
    required: false,
  })
  notes?: string;
}

class GetProgressOptions {
  @UserOption({
    name: "member",
    description: "Whose progress to show",
    required: false,
  })
  member?: User;
}

@Injectable()
@UseGuards(GuildLockGuard)
export class ProgressCommands {
  constructor(
    @Inject(DiscordAccountLookup)
    private readonly accounts: DiscordAccountLookup,
    @Inject(ReadSessionsService) private readonly sessions: ReadSessionsService,
  ) {}

  @SlashCommand({
    name: "set-read-progress",
    description: "Update your progress on the club's current book",
  })
  async setProgress(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: SetProgressOptions,
  ) {
    const userId = await this.accounts.userIdForDiscord(interaction.user.id);
    if (!userId) {
      return interaction.reply({
        content:
          "Sign in at auth.brigada.com with Discord, then ask an admin to add you to Read.",
        ephemeral: true,
      });
    }

    const parsed = parsePercentage(options.percentage);
    if ("error" in parsed) {
      return interaction.reply({ content: parsed.error, ephemeral: true });
    }

    const notes = options.notes?.trim() ?? "";
    if (notes.length > 200) {
      return interaction.reply({
        content: "Notes can be up to 200 characters.",
        ephemeral: true,
      });
    }

    try {
      const saved = await this.sessions.setReadingProgress(userId, {
        percentage: parsed.percentage,
        ...(options.notes === undefined ? {} : { notes: notes || null }),
      });
      return interaction.reply({
        content: `${saved.title} is now ${saved.progress.percentage}%.`,
        ephemeral: true,
      });
    } catch (error) {
      return interaction.reply({
        content: commandError(
          error,
          "Could not update progress on the current book.",
        ),
        ephemeral: true,
      });
    }
  }

  @SlashCommand({
    name: "get-progress",
    description: "Show progress on the club's current book",
  })
  async getProgress(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: GetProgressOptions,
  ) {
    const target = options.member ?? interaction.user;
    const userId = await this.accounts.userIdForDiscord(target.id);
    if (!userId) {
      return interaction.reply({
        content:
          "That Discord account is not linked. Sign in at auth.brigada.com first.",
        ephemeral: true,
      });
    }

    try {
      const reading = await this.sessions.readingForMember(userId);
      const own = target.id === interaction.user.id;
      const note =
        own && reading.progress.notes ? ` · ${reading.progress.notes}` : "";
      return interaction.reply({
        content: `${target.displayName} is ${reading.progress.percentage}% through ${reading.title}${note}`,
        ephemeral: true,
      });
    } catch (error) {
      return interaction.reply({
        content: commandError(error, "No progress on the current book."),
        ephemeral: true,
      });
    }
  }
}

function commandError(error: unknown, fallback: string) {
  if (error instanceof HttpException) {
    const response = error.getResponse();
    if (typeof response === "string") {
      return response;
    }
    if (
      typeof response === "object" &&
      response !== null &&
      "message" in response
    ) {
      const message = response.message;
      if (typeof message === "string") {
        return message;
      }
      if (Array.isArray(message) && typeof message[0] === "string") {
        return message[0];
      }
    }
  }

  return fallback;
}
