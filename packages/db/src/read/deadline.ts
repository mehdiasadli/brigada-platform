export const WEEKDAY_PAGES = 20;
export const WEEKEND_PAGES = 25;
export const BUFFER_MULTIPLIER = 1.25;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addUtcDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function isUtcWeekend(date: Date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function calculateReadingDeadline(
  pageCount: number,
  startDate: Date,
): Date {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new Error("Page count must be a positive integer.");
  }

  let remaining = Math.ceil(pageCount * BUFFER_MULTIPLIER);
  let current = startOfUtcDay(startDate);

  while (remaining > 0) {
    remaining -= isUtcWeekend(current) ? WEEKEND_PAGES : WEEKDAY_PAGES;
    if (remaining <= 0) {
      return current;
    }
    current = addUtcDays(current, 1);
  }

  return current;
}
