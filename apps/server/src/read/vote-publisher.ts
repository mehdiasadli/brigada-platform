export type VoteCandidate = {
  id: string;
  title: string;
  author: string;
  pageCount: number;
  firstPublishYear: number;
};

export type VotePublishResult = {
  messageId: string | null;
  channelId: string | null;
  answers: Array<{ candidateId: string; answerId: number }>;
};

export type PollCount = {
  answerId: number;
  votes: number;
};

export type VotePublisher = {
  postPoll(candidates: VoteCandidate[]): Promise<VotePublishResult>;
  announceWinner(title: string): Promise<void>;
  tallyPoll(channelId: string, messageId: string): Promise<PollCount[]>;
};

export class NoopVotePublisher implements VotePublisher {
  async postPoll(candidates: VoteCandidate[]): Promise<VotePublishResult> {
    return {
      messageId: null,
      channelId: null,
      answers: candidates.map((candidate, index) => ({
        candidateId: candidate.id,
        answerId: index + 1,
      })),
    };
  }

  async announceWinner() {}

  async tallyPoll(): Promise<PollCount[]> {
    return [];
  }
}
