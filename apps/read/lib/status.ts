import type { ReadBook } from "./read-types";

export function bookStatusLabel(status: ReadBook["status"]) {
  switch (status) {
    case "reading":
      return "Reading";
    case "completed":
      return "Finished";
    case "removed":
      return "Removed";
    default:
      return "On the list";
  }
}

export function bookStatusVariant(status: ReadBook["status"]) {
  switch (status) {
    case "reading":
      return "default" as const;
    case "completed":
      return "secondary" as const;
    case "removed":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export function sessionStatusLabel(status: string) {
  switch (status) {
    case "voting":
      return "Voting";
    case "active":
      return "Reading";
    case "completed":
      return "Finished";
    case "cancelled":
      return "Cancelled";
    default:
      return "Not started";
  }
}
