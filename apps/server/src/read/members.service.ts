import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { ReadMembersStore } from "./members.types";
import { READ_MEMBERS_REPOSITORY } from "./read.constants";

@Injectable()
export class ReadMembersService {
  constructor(
    @Inject(READ_MEMBERS_REPOSITORY)
    private readonly members: ReadMembersStore,
  ) {}

  list() {
    return this.members.list();
  }

  async listDirectory() {
    const [members, current, finished] = await Promise.all([
      this.members.list(),
      this.members.listCurrentReading(),
      this.members.listLastFinished(),
    ]);
    const currentByUser = new Map(
      current.map((row) => [row.userId, row] as const),
    );
    const finishedByUser = new Map(
      finished.map((row) => [row.userId, row] as const),
    );

    return members.map((member) => {
      const reading = currentByUser.get(member.user.id);
      const last = finishedByUser.get(member.user.id);
      return {
        name: member.user.name,
        username: member.user.username,
        image: member.user.image,
        memberSince: member.createdAt,
        status: reading
          ? {
              kind: "reading" as const,
              title: reading.title,
              slug: reading.slug,
              percentage: reading.percentage,
            }
          : last
            ? {
                kind: "finished" as const,
                title: last.title,
                slug: last.slug,
              }
            : { kind: "idle" as const },
      };
    });
  }

  async getProfile(username: string) {
    const profile = await this.members.findProfileByUsername(username);
    if (!profile) {
      throw new NotFoundException("Read member not found");
    }

    const [finishedCount, current] = await Promise.all([
      this.members.countFinished(profile.user.id),
      this.members.findCurrentReading(profile.user.id),
    ]);
    const ratings = profile.reviews.map((review) => review.rating);

    return {
      user: {
        name: profile.user.name,
        username: profile.user.username,
        image: profile.user.image,
      },
      memberSince: profile.memberSince,
      finishedCount,
      averageRating:
        ratings.length === 0
          ? null
          : ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      current,
      reviews: profile.reviews,
    };
  }

  async grant(userId: string) {
    if (!(await this.members.userExists(userId))) {
      throw new NotFoundException("User not found");
    }

    if (await this.members.findByUserId(userId)) {
      throw new ConflictException("User is already a Read member");
    }

    return this.members.insert(userId);
  }

  async revoke(userId: string) {
    const removed = await this.members.delete(userId);
    if (!removed) {
      throw new NotFoundException("Read member not found");
    }
  }
}
