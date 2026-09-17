export function openLibraryCoverUrl(
  coverId: number | null | undefined,
  size: "S" | "M" | "L" = "L",
) {
  if (!coverId) {
    return null;
  }

  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}
