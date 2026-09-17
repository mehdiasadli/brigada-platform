import type { AdminUser } from "../users/users.types";

export type ReadMember = {
  user: AdminUser;
  createdAt: Date;
};

export type ReadMemberReview = {
  id: string;
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  rating: number;
  body: string | null;
  createdAt: Date;
};

export type ReadMemberReading = {
  title: string;
  slug: string;
  percentage: number;
};

export type ReadMemberFinished = {
  title: string;
  slug: string;
};

export type ReadMemberProfile = {
  user: AdminUser;
  memberSince: Date;
  reviews: ReadMemberReview[];
};

export type ReadMembersStore = {
  list(): Promise<ReadMember[]>;
  findByUserId(userId: string): Promise<ReadMember | null>;
  findProfileByUsername(username: string): Promise<ReadMemberProfile | null>;
  countFinished(userId: string): Promise<number>;
  findCurrentReading(userId: string): Promise<ReadMemberReading | null>;
  listCurrentReading(): Promise<Array<ReadMemberReading & { userId: string }>>;
  listLastFinished(): Promise<Array<ReadMemberFinished & { userId: string }>>;
  userExists(userId: string): Promise<boolean>;
  insert(userId: string): Promise<ReadMember>;
  delete(userId: string): Promise<boolean>;
};
