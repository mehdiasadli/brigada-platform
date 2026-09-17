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
    const members = await this.members.list();
    return members.map((member) => ({
      name: member.user.name,
      username: member.user.username,
      image: member.user.image,
      memberSince: member.createdAt,
    }));
  }

  async getProfile(username: string) {
    const profile = await this.members.findProfileByUsername(username);
    if (!profile) {
      throw new NotFoundException("Read member not found");
    }

    return profile;
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
