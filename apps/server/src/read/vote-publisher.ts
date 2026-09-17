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

export type VotePublisher = {
  postPoll(candidates: VoteCandidate[]): Promise<VotePublishResult>;
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
}
