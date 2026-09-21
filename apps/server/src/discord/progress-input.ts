type SlashOptionValue = {
  name: string;
  value?: string | number | boolean;
};

export function readPercentageInput(
  named: string | null | undefined,
  options: readonly SlashOptionValue[],
) {
  if (named?.trim()) {
    return named;
  }

  const match = options.find(
    (option) =>
      option.name !== "notes" &&
      option.name !== "member" &&
      (typeof option.value === "string" || typeof option.value === "number"),
  );
  if (!match) {
    return null;
  }

  return String(match.value);
}

export function parsePercentage(
  raw: string | null | undefined,
): { percentage: number } | { error: string } {
  if (raw === null || raw === undefined || raw.trim() === "") {
    return {
      error: "Enter a percentage from 0 to 100, for example 55.",
    };
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
