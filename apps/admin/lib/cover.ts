export function openLibraryCoverUrl(
  coverId: number | null | undefined,
  size: "S" | "M" | "L" = "M",
) {
  if (!coverId) {
    return null;
  }

  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}
