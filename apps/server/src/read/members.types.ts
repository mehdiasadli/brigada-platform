import type { AdminUser } from "../users/users.types";

export type ReadMember = {
  user: AdminUser;
  createdAt: Date;
};

export type ReadMemberProfile = {
  user: AdminUser;
  memberSince: Date;
  reviews: Array<{
    id: string;
    bookId: string;
    bookTitle: string;
    bookSlug: string;
    rating: number;
    body: string | null;
    createdAt: Date;
  }>;
};

export type ReadMembersStore = {
  list(): Promise<ReadMember[]>;
  findByUserId(userId: string): Promise<ReadMember | null>;
  findProfileByUsername(username: string): Promise<ReadMemberProfile | null>;
  userExists(userId: string): Promise<boolean>;
  insert(userId: string): Promise<ReadMember>;
  delete(userId: string): Promise<boolean>;
};
