import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  CatalogListQuery,
  CreateReadBook,
  ReadBooksStore,
  UpdateReadBook,
} from "./books.types";
import type { OpenNomination } from "./nominations.types";
import type { OpenLibrarySearch } from "./open-library";
import {
  OPEN_LIBRARY,
  READ_BOOKS_REPOSITORY,
  READ_NOMINATIONS_REPOSITORY,
  READ_SESSIONS_REPOSITORY,
} from "./read.constants";
import { slugifyTitle, uniquifySlug } from "./slug";

@Injectable()
export class ReadBooksService {
  constructor(
    @Inject(READ_BOOKS_REPOSITORY) private readonly books: ReadBooksStore,
    @Inject(OPEN_LIBRARY) private readonly openLibrary: OpenLibrarySearch,
    @Inject(READ_NOMINATIONS_REPOSITORY)
    private readonly nominations: {
      findOpenByBookId(bookId: string): Promise<OpenNomination | null>;
    },
    @Inject(READ_SESSIONS_REPOSITORY)
    private readonly sessions: {
      isOnOpenSlate(bookId: string): Promise<boolean>;
    },
  ) {}

  list() {
    return this.books.list();
  }

  listVisible() {
    return this.books.listVisible();
  }

  listCatalog(query: CatalogListQuery) {
    return this.books.listCatalog(query);
  }

  async getBySlug(slug: string, userId?: string) {
    const book = await this.books.findBySlug(slug);
    if (!book || book.status === "removed") {
      throw new NotFoundException("Book not found");
    }

    const [reviews, open, onSlate] = await Promise.all([
      this.books.listReviews(book.id),
      this.nominations.findOpenByBookId(book.id),
      this.sessions.isOnOpenSlate(book.id),
    ]);
    const nomination = open
      ? {
          reason: open.reason,
          nominatorName: open.nominatorName,
          mine: userId === open.userId,
        }
      : null;

    if (!userId) {
      return {
        book,
        reviews,
        viewer: {
          canReview: false,
          canUpdateProgress: false,
          canNominate: book.status === "readlist" && !nomination && !onSlate,
          review: null,
          progress: null,
          nomination,
        },
      };
    }

    const [review, progress] = await Promise.all([
      this.books.findReview(userId, book.id),
      this.books.findProgressForBook(userId, book.id),
    ]);

    return {
      book,
      reviews,
      viewer: {
        canReview:
          !review && (book.status === "reading" || book.status === "completed"),
        canUpdateProgress: progress !== null && !progress.isCompleted,
        canNominate: book.status === "readlist" && !nomination && !onSlate,
        review,
        progress,
        nomination,
      },
    };
  }

  async getById(id: string) {
    const book = await this.books.findById(id);
    if (!book) {
      throw new NotFoundException("Book not found");
    }

    return book;
  }

  search(query: string) {
    return this.openLibrary.search(query);
  }

  async create(input: CreateReadBook) {
    if (await this.books.findByOlibKey(input.olibKey)) {
      throw new ConflictException("Book is already on the list");
    }

    const slug = uniquifySlug(
      slugifyTitle(input.title),
      new Set(await this.books.listSlugs()),
    );

    return this.books.insert({ ...input, slug });
  }

  async update(id: string, patch: UpdateReadBook) {
    const current = await this.books.findById(id);
    if (!current) {
      throw new NotFoundException("Book not found");
    }

    const updated = await this.books.update(id, patch);
    if (!updated) {
      throw new NotFoundException("Book not found");
    }

    return updated;
  }
}
