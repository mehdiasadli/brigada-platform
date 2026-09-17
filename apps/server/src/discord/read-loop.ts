import { Inject, Injectable, Logger } from "@nestjs/common";
import { ChannelType, Client } from "discord.js";
import { Context, type ContextOf, Once } from "necord";
import { shouldPostMidterm } from "../read/midterm";
import { ReadSessionsService } from "../read/sessions.service";
import { DISCORD_READ_CHANNEL_ID } from "./discord.constants";

const HOUR_MS = 60 * 60 * 1000;

@Injectable()
export class ReadLoop {
  private readonly logger = new Logger(ReadLoop.name);

  constructor(
    @Inject(ReadSessionsService) private readonly sessions: ReadSessionsService,
    @Inject(Client) private readonly client: Client,
    @Inject(DISCORD_READ_CHANNEL_ID) private readonly channelId: string,
  ) {}

  @Once("clientReady")
  onReady(@Context() [_client]: ContextOf<"clientReady">) {
    void this.tick();
    setInterval(() => {
      void this.tick();
    }, HOUR_MS);
  }

  async tick(now = new Date()) {
    const listed = await this.sessions.list();
    const open = listed.find(
      (session) =>
        session.status === "not_started" ||
        session.status === "voting" ||
        session.status === "active",
    );
    if (!open) {
      return;
    }

    if (open.status === "active") {
      await this.sessions.completeIfDue(open.id, now);
    }

    const session = await this.sessions.getById(open.id);
    if (
      session.status !== "active" ||
      !session.startedAt ||
      !session.readingDeadline ||
      !shouldPostMidterm(
        session.startedAt,
        session.readingDeadline,
        now,
        session.midtermPostedAt,
      )
    ) {
      return;
    }

    try {
      await this.postCheckIn(session.book?.title ?? "the book");
      await this.sessions.markMidtermPosted(session.id, now);
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async postCheckIn(title: string) {
    const channel = await this.client.channels.fetch(this.channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Read Discord channel is missing or not a text channel");
    }

    await channel.send({
      content: `Midterm check-in for **${title}**. This poll is just a pulse — it does not update progress.`,
      poll: {
        question: { text: `How far are you in ${title.slice(0, 80)}?` },
        answers: [
          { text: "Not started" },
          { text: "About 25%" },
          { text: "About 50%" },
          { text: "About 75%" },
          { text: "Finished" },
        ],
        duration: 24,
        allowMultiselect: false,
      },
    });
  }
}
