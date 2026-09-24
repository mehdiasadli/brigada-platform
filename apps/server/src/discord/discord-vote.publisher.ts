import { Inject, Injectable } from "@nestjs/common";
import { ChannelType, Client } from "discord.js";
import { VOTING_MS } from "../read/sessions.service";
import type {
  VoteCandidate,
  VotePublisher,
  VotePublishResult,
} from "../read/vote-publisher";
import { DISCORD_READ_CHANNEL_ID } from "./discord.constants";

const HOUR_MS = 60 * 60 * 1000;

const POLL_ANSWER_MAX = 55;

@Injectable()
export class DiscordVotePublisher implements VotePublisher {
  constructor(
    @Inject(Client) private readonly client: Client,
    @Inject(DISCORD_READ_CHANNEL_ID) private readonly channelId: string,
  ) {}

  async postPoll(candidates: VoteCandidate[]): Promise<VotePublishResult> {
    const channel = await this.textChannel(this.channelId);

    const slate = candidates
      .map(
        (candidate) =>
          `**${candidate.title}** — ${candidate.author} · ${candidate.pageCount}p · ${candidate.firstPublishYear}`,
      )
      .join("\n");

    const message = await channel.send({
      content: `Vote for the next book.\n${slate}`,
      poll: {
        question: { text: "Which book should we read?" },
        answers: candidates.map((candidate) => ({
          text: candidate.title.slice(0, POLL_ANSWER_MAX),
        })),
        duration: Math.max(1, Math.ceil(VOTING_MS / HOUR_MS)),
        allowMultiselect: true,
      },
    });

    return {
      messageId: message.id,
      channelId: message.channelId,
      answers: candidates.map((candidate, index) => ({
        candidateId: candidate.id,
        answerId: index + 1,
      })),
    };
  }

  async announceWinner(title: string) {
    const channel = await this.textChannel(this.channelId);
    await channel.send({ content: `**${title}** won the vote.` });
  }

  async tallyPoll(channelId: string, messageId: string) {
    const channel = await this.textChannel(channelId);
    const message = await channel.messages.fetch(messageId);
    if (!message.poll) {
      throw new Error("Discord poll is missing");
    }

    const poll = message.poll.resultsFinalized
      ? message.poll
      : await message.poll.fetch();

    return [...poll.answers.values()].map((answer) => ({
      answerId: answer.id,
      votes: answer.voteCount,
    }));
  }

  private async textChannel(channelId: string) {
    const channel = await this.client.channels.fetch(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Read Discord channel is missing or not a text channel");
    }

    return channel;
  }
}
