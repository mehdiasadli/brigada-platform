import type { AdminUser } from "./admin-users";
import { throwIfNotOk } from "./api-error";

export type ReadMember = {
  user: AdminUser;
  createdAt: string;
};

export type ReadBook = {
  id: string;
  title: string;
  slug: string;
  olibKey: string;
  author: string;
  pageCount: number;
  firstPublishYear: number;
  subtitle: string | null;
  description: string | null;
  coverId: number | null;
  status: "readlist" | "reading" | "completed" | "removed";
  createdAt: string;
  updatedAt: string;
};

export type OpenLibraryHit = {
  olibKey: string;
  title: string;
  author: string | null;
  pageCount: number | null;
  firstPublishYear: number | null;
  subtitle: string | null;
  coverId: number | null;
};

export type ReadSession = {
  id: string;
  bookId: string | null;
  status: "not_started" | "voting" | "active" | "completed" | "cancelled";
  votingStartedAt: string | null;
  votingDeadline: string | null;
  votingEndedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  readingDeadline: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReadSessionReader = {
  userId: string;
  username: string;
  name: string;
  image: string | null;
  progress: {
    percentage: number;
    notes: string | null;
    isCompleted: boolean;
    startedAt: string | null;
    completedAt: string | null;
    progressUpdatedAt: string;
  } | null;
  review: { rating: number; body: string | null } | null;
};

export type ReadSessionDetail = ReadSession & {
  book: ReadBook | null;
  candidates: Array<{
    id: string;
    bookId: string;
    title: string;
    author: string;
    pageCount: number;
    firstPublishYear: number;
    coverId: number | null;
    slug: string | null;
  }>;
  readers: ReadSessionReader[];
};

async function readAdminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    cache: "no-store",
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  });

  await throwIfNotOk(response, "Read admin request failed");

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function readMembersQueryKey() {
  return ["read-members"] as const;
}

export function listReadMembers() {
  return readAdminFetch<ReadMember[]>("/api/admin/read/members");
}

export function grantReadMember(userId: string) {
  return readAdminFetch<ReadMember>("/api/admin/read/members", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function revokeReadMember(userId: string) {
  return readAdminFetch<void>(`/api/admin/read/members/${userId}`, {
    method: "DELETE",
  });
}

export function readBooksQueryKey() {
  return ["read-books"] as const;
}

export function listReadBooks() {
  return readAdminFetch<ReadBook[]>("/api/admin/read/books");
}

export function searchOpenLibrary(query: string) {
  return readAdminFetch<OpenLibraryHit[]>(
    `/api/admin/read/books/search?q=${encodeURIComponent(query)}`,
  );
}

export function createReadBook(input: {
  olibKey: string;
  title: string;
  author: string;
  pageCount: number;
  firstPublishYear: number;
  subtitle?: string | null;
  coverId?: number | null;
}) {
  return readAdminFetch<ReadBook>("/api/admin/read/books", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateReadBook(
  id: string,
  patch: Partial<
    Pick<
      ReadBook,
      | "title"
      | "author"
      | "pageCount"
      | "firstPublishYear"
      | "subtitle"
      | "description"
      | "status"
    >
  >,
) {
  return readAdminFetch<ReadBook>(`/api/admin/read/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function readSessionsQueryKey() {
  return ["read-sessions"] as const;
}

export function listReadSessions() {
  return readAdminFetch<ReadSession[]>("/api/admin/read/sessions");
}

export function getReadSession(id: string) {
  return readAdminFetch<ReadSessionDetail>(`/api/admin/read/sessions/${id}`);
}

export function createReadSession() {
  return readAdminFetch<ReadSession>("/api/admin/read/sessions", {
    method: "POST",
  });
}

export function suggestReadBooks() {
  return readAdminFetch<ReadBook[]>("/api/admin/read/sessions/suggest");
}

export function setReadSlate(sessionId: string, bookIds: string[]) {
  return readAdminFetch<ReadSessionDetail>(
    `/api/admin/read/sessions/${sessionId}/slate`,
    { method: "PUT", body: JSON.stringify({ bookIds }) },
  );
}

export function startReadVoting(sessionId: string) {
  return readAdminFetch<ReadSessionDetail>(
    `/api/admin/read/sessions/${sessionId}/start`,
    { method: "POST" },
  );
}

export function resolveReadVote(
  sessionId: string,
  input: { winnerBookId?: string; random?: boolean },
) {
  return readAdminFetch<ReadSessionDetail>(
    `/api/admin/read/sessions/${sessionId}/resolve`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function cancelReadSession(sessionId: string) {
  return readAdminFetch<ReadSessionDetail>(
    `/api/admin/read/sessions/${sessionId}/cancel`,
    { method: "POST" },
  );
}

export function completeReadSession(sessionId: string) {
  return readAdminFetch<ReadSessionDetail>(
    `/api/admin/read/sessions/${sessionId}/complete`,
    { method: "POST" },
  );
}

export function removeReadReader(sessionId: string, userId: string) {
  return readAdminFetch<ReadSessionDetail>(
    `/api/admin/read/sessions/${sessionId}/readers/${userId}`,
    { method: "DELETE" },
  );
}

export function setReadReaderProgress(
  sessionId: string,
  userId: string,
  input: { percentage: number; notes?: string | null },
) {
  return readAdminFetch<ReadSessionDetail>(
    `/api/admin/read/sessions/${sessionId}/readers/${userId}/progress`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}
