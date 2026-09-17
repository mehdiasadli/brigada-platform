import { expect, mock, test } from "bun:test";
import { ChannelType } from "discord.js";
import { DiscordVotePublisher } from "./discord-vote.publisher";

test("posts a multi-select poll with a slate above it", async () => {
  const send = mock(() =>
    Promise.resolve({ id: "msg-1", channelId: "chan-1" }),
  );
  const fetch = mock(() =>
    Promise.resolve({ type: ChannelType.GuildText, send }),
  );
  const publisher = new DiscordVotePublisher(
    { channels: { fetch } } as never,
    "chan-1",
  );

  await expect(
    publisher.postPoll([
      {
        id: "c1",
        title: "Dune",
        author: "Frank Herbert",
        pageCount: 412,
        firstPublishYear: 1965,
      },
    ]),
  ).resolves.toEqual({
    messageId: "msg-1",
    channelId: "chan-1",
    answers: [{ candidateId: "c1", answerId: 1 }],
  });

  expect(send).toHaveBeenCalledWith(
    expect.objectContaining({
      poll: expect.objectContaining({
        allowMultiselect: true,
        duration: 1,
      }),
    }),
  );
});
