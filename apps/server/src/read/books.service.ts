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
import type { OpenLibrarySearch } from "./open-library";
import { OPEN_LIBRARY, READ_BOOKS_REPOSITORY } from "./read.constants";
import { slugifyTitle, uniquifySlug } from "./slug";

@Injectable()
export class ReadBooksService {
  constructor(
    @Inject(READ_BOOKS_REPOSITORY) private readonly books: ReadBooksStore,
    @Inject(OPEN_LIBRARY) private readonly openLibrary: OpenLibrarySearch,
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

    const reviews = await this.books.listReviews(book.id);
    if (!userId) {
      return {
        book,
        reviews,
        viewer: {
          canReview: false,
          canUpdateProgress: false,
          review: null,
          progress: null,
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
        canUpdateProgress: Boolean(progress),
        review,
        progress,
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

    const next = { ...patch };
    if (patch.title && patch.title !== current.title) {
      const taken = new Set(await this.books.listSlugs());
      taken.delete(current.slug);
      next.slug = uniquifySlug(slugifyTitle(patch.title), taken);
    }

    const updated = await this.books.update(id, next);
    if (!updated) {
      throw new NotFoundException("Book not found");
    }

    return updated;
  }
}
