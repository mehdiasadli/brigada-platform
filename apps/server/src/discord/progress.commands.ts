import { Inject, Injectable, UseGuards } from "@nestjs/common";
import type { User } from "discord.js";
import {
  Context,
  NumberOption,
  Options,
  SlashCommand,
  type SlashCommandContext,
  StringOption,
  UserOption,
} from "necord";
import { ReadSessionsService } from "../read/sessions.service";
import { DiscordAccountLookup } from "./discord-account";
import { GuildLockGuard } from "./guild-lock.guard";

class SetProgressOptions {
  @NumberOption({
    name: "percentage",
    description: "How far you are, 0–100",
    required: true,
    min_value: 0,
    max_value: 100,
  })
  percentage!: number;

  @StringOption({
    name: "notes",
    description: "Optional note",
    required: false,
    max_length: 200,
  })
  notes?: string;

  @StringOption({
    name: "book_id",
    description: "Book id when finishing after the session ended",
    required: false,
  })
  bookId?: string;
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
    description: "Update your reading progress",
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

    try {
      const progress = await this.sessions.setProgress(userId, {
        percentage: options.percentage,
        notes: options.notes ?? null,
        bookId: options.bookId,
      });
      return interaction.reply({
        content: `Progress set to ${progress.percentage}%.`,
        ephemeral: true,
      });
    } catch {
      return interaction.reply({
        content: "Could not update progress. Are you in the active session?",
        ephemeral: true,
      });
    }
  }

  @SlashCommand({
    name: "get-progress",
    description: "Show reading progress",
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

    const current = await this.sessions.currentForMember(userId);
    if (!current?.progress) {
      return interaction.reply({
        content: "No progress on the current session.",
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `${target.displayName}: ${current.progress.percentage}%${
        current.progress.notes ? ` — ${current.progress.notes}` : ""
      }`,
      ephemeral: true,
    });
  }
}
