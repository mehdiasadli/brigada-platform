import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ReadBooksService } from "./books.service";
import type { ReadBooksStore } from "./books.types";
import type { NominateBook, ReadNominationsStore } from "./nominations.types";
import {
  READ_BOOKS_REPOSITORY,
  READ_NOMINATIONS_REPOSITORY,
} from "./read.constants";

@Injectable()
export class ReadNominationsService {
  constructor(
    @Inject(READ_NOMINATIONS_REPOSITORY)
    private readonly nominations: ReadNominationsStore,
    @Inject(READ_BOOKS_REPOSITORY) private readonly bookStore: ReadBooksStore,
    @Inject(ReadBooksService) private readonly books: ReadBooksService,
  ) {}

  listOpen() {
    return this.nominations.listOpen();
  }

  async nominate(userId: string, input: NominateBook) {
    const existing = input.bookId
      ? await this.books.getById(input.bookId)
      : await this.bookStore.findByOlibKey(input.olibKey ?? "");

    if (existing?.status === "removed") {
      throw new BadRequestException("That book was removed from the list");
    }

    const book = existing ?? (await this.createFromSearch(input));
    if (await this.nominations.findOpenByBookId(book.id)) {
      throw new ConflictException("This book is already nominated");
    }

    return this.nominations.insert({
      bookId: book.id,
      userId,
      reason: input.reason,
    });
  }

  async setStatus(id: string, status: "parked" | "rejected") {
    const current = await this.nominations.findById(id);
    if (!current) {
      throw new NotFoundException("Nomination not found");
    }
    if (current.status !== "open") {
      throw new ConflictException("This nomination is already closed");
    }

    const updated = await this.nominations.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundException("Nomination not found");
    }

    return updated;
  }

  private async createFromSearch(input: NominateBook) {
    if (
      !input.olibKey ||
      !input.title ||
      !input.author ||
      input.pageCount == null ||
      input.firstPublishYear == null
    ) {
      throw new BadRequestException(
        "Open Library is missing a page count or year for this title",
      );
    }

    return this.books.create({
      olibKey: input.olibKey,
      title: input.title,
      author: input.author,
      pageCount: input.pageCount,
      firstPublishYear: input.firstPublishYear,
      subtitle: input.subtitle,
      coverId: input.coverId,
    });
  }
}
