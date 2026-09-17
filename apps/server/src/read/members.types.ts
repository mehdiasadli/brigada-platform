import type { AdminUser } from "../users/users.types";

export type ReadMember = {
  user: AdminUser;
  createdAt: Date;
};

export type ReadMembersStore = {
  list(): Promise<ReadMember[]>;
  findByUserId(userId: string): Promise<ReadMember | null>;
  userExists(userId: string): Promise<boolean>;
  insert(userId: string): Promise<ReadMember>;
  delete(userId: string): Promise<boolean>;
};
