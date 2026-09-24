import { db } from "@brigada/db";
import { readBook, readNomination, user } from "@brigada/db/schema";
import { Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import type {
  OpenNomination,
  ReadNomination,
  ReadNominationListItem,
  ReadNominationsStore,
} from "./nominations.types";

const nominationColumns = {
  id: readNomination.id,
  bookId: readNomination.bookId,
  userId: readNomination.userId,
  reason: readNomination.reason,
  status: readNomination.status,
  createdAt: readNomination.createdAt,
  updatedAt: readNomination.updatedAt,
} as const;

@Injectable()
export class ReadNominationsRepository implements ReadNominationsStore {
  async findOpenByBookId(bookId: string) {
    const [row] = await db
      .select({
        id: readNomination.id,
        bookId: readNomination.bookId,
        userId: readNomination.userId,
        reason: readNomination.reason,
        nominatorName: user.name,
      })
      .from(readNomination)
      .innerJoin(user, eq(user.id, readNomination.userId))
      .where(
        and(
          eq(readNomination.bookId, bookId),
          eq(readNomination.status, "open"),
        ),
      )
      .limit(1);

    return (row as OpenNomination | undefined) ?? null;
  }

  async findById(id: string) {
    const [row] = await db
      .select(nominationColumns)
      .from(readNomination)
      .where(eq(readNomination.id, id))
      .limit(1);

    return (row as ReadNomination | undefined) ?? null;
  }

  async insert(input: { bookId: string; userId: string; reason: string }) {
    const [row] = await db
      .insert(readNomination)
      .values(input)
      .returning(nominationColumns);
    if (!row) {
      throw new Error("Failed to create nomination");
    }

    return row as ReadNomination;
  }

  async updateStatus(id: string, status: "parked" | "rejected") {
    const [row] = await db
      .update(readNomination)
      .set({ status })
      .where(eq(readNomination.id, id))
      .returning(nominationColumns);

    return (row as ReadNomination | undefined) ?? null;
  }

  async listOpen() {
    const rows = await db
      .select({
        id: readNomination.id,
        bookId: readNomination.bookId,
        userId: readNomination.userId,
        reason: readNomination.reason,
        status: readNomination.status,
        createdAt: readNomination.createdAt,
        updatedAt: readNomination.updatedAt,
        bookTitle: readBook.title,
        bookAuthor: readBook.author,
        nominatorName: user.name,
      })
      .from(readNomination)
      .innerJoin(readBook, eq(readBook.id, readNomination.bookId))
      .innerJoin(user, eq(user.id, readNomination.userId))
      .where(eq(readNomination.status, "open"))
      .orderBy(desc(readNomination.createdAt));

    return rows as ReadNominationListItem[];
  }
}
