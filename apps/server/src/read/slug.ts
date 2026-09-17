const MAX_SLUG_LENGTH = 80;

export function slugifyTitle(title: string) {
  const slug = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH);

  return slug || "book";
}

export function uniquifySlug(base: string, taken: Set<string>) {
  if (!taken.has(base)) {
    return base;
  }

  for (let n = 2; n < 1000; n += 1) {
    const next = `${base}-${n}`.slice(0, MAX_SLUG_LENGTH + 4);
    if (!taken.has(next)) {
      return next;
    }
  }

  throw new Error("Could not allocate a unique book slug");
}
