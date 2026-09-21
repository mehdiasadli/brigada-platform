export function parsePercentage(
  raw: string | null | undefined,
): { percentage: number } | { error: string } {
  if (raw === null || raw === undefined || raw.trim() === "") {
    return { error: "Add a percentage from 0 to 100." };
  }

  const trimmed = raw.trim().replace(/%$/, "");
  if (!/^\d{1,3}$/.test(trimmed)) {
    return { error: "Use a whole number from 0 to 100." };
  }

  const percentage = Number(trimmed);
  if (percentage > 100) {
    return { error: "Use a whole number from 0 to 100." };
  }

  return { percentage };
}
