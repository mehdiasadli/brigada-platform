import type { READ_NOMINATION_STATUS_VALUES } from "@brigada/db/schema";

export type ReadNominationStatus =
  (typeof READ_NOMINATION_STATUS_VALUES)[number];

export type OpenNomination = {
  id: string;
  bookId: string;
  userId: string;
  reason: string;
  nominatorName: string;
};

export type ReadNomination = {
  id: string;
  bookId: string;
  userId: string;
  reason: string;
  status: ReadNominationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ReadNominationListItem = ReadNomination & {
  bookTitle: string;
  bookAuthor: string;
  nominatorName: string;
};

export type NominateBook = {
  reason: string;
  bookId?: string;
  olibKey?: string;
  title?: string;
  author?: string;
  pageCount?: number;
  firstPublishYear?: number;
  subtitle?: string | null;
  coverId?: number | null;
};

export type ReadNominationsStore = {
  findOpenByBookId(bookId: string): Promise<OpenNomination | null>;
  findById(id: string): Promise<ReadNomination | null>;
  insert(input: {
    bookId: string;
    userId: string;
    reason: string;
  }): Promise<ReadNomination>;
  updateStatus(
    id: string,
    status: Exclude<ReadNominationStatus, "open">,
  ): Promise<ReadNomination | null>;
  listOpen(): Promise<ReadNominationListItem[]>;
};
