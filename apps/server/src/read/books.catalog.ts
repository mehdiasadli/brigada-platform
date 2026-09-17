export const CATALOG_SORT_FIELDS = [
  "createdAt",
  "firstPublishYear",
  "pageCount",
] as const;

export type CatalogSort = (typeof CATALOG_SORT_FIELDS)[number];

export type CatalogCursor = {
  value: string;
  id: string;
};

export function encodeCatalogCursor(cursor: CatalogCursor) {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeCatalogCursor(raw: string): CatalogCursor {
  const parsed = JSON.parse(
    Buffer.from(raw, "base64url").toString("utf8"),
  ) as CatalogCursor;
  if (
    typeof parsed?.value !== "string" ||
    typeof parsed?.id !== "string" ||
    parsed.value.length === 0 ||
    parsed.id.length === 0
  ) {
    throw new Error("Invalid catalog cursor");
  }

  return parsed;
}

export function catalogSortValue(
  sort: CatalogSort,
  book: { createdAt: Date; firstPublishYear: number; pageCount: number },
) {
  if (sort === "createdAt") {
    return book.createdAt.toISOString();
  }

  if (sort === "firstPublishYear") {
    return String(book.firstPublishYear);
  }

  return String(book.pageCount);
}

export function escapeIlike(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}
