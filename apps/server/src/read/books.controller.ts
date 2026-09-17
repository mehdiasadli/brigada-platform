import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../users/admin.guard";
import {
  parseCreateReadBook,
  parseReadBookId,
  parseSearchBooksQuery,
  parseUpdateReadBook,
} from "./books.query";
import { ReadBooksService } from "./books.service";

@Controller("api/admin/read/books")
@UseGuards(AdminGuard)
export class ReadBooksController {
  constructor(
    @Inject(ReadBooksService) private readonly books: ReadBooksService,
  ) {}

  @Get()
  list() {
    return this.books.list();
  }

  @Get("search")
  search(@Query() query: Record<string, string | undefined>) {
    return this.books.search(parseSearchBooksQuery(query).q);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.books.getById(parseReadBookId(id));
  }

  @Post()
  create(@Body() body: unknown) {
    return this.books.create(parseCreateReadBook(body));
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    return this.books.update(parseReadBookId(id), parseUpdateReadBook(body));
  }
}
