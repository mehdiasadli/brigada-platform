import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
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
    const updated = await this.books.update(id, patch);
    if (!updated) {
      throw new NotFoundException("Book not found");
    }

    return updated;
  }
}
