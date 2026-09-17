"use client";

import { Button } from "@brigada/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@brigada/ui/components/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  cancelReadSession,
  completeReadSession,
  createReadSession,
  getReadSession,
  listReadSessions,
  readSessionsQueryKey,
  removeReadReader,
  resolveReadVote,
  setReadSlate,
  startReadVoting,
  suggestReadBooks,
} from "../../../../lib/read-admin";

export function ReadSessionsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [slate, setSlate] = useState<string[]>([]);

  const sessions = useQuery({
    queryKey: readSessionsQueryKey(),
    queryFn: listReadSessions,
  });
  const detail = useQuery({
    queryKey: ["read-session", selectedId],
    queryFn: () => getReadSession(selectedId ?? ""),
    enabled: Boolean(selectedId),
  });
  const suggestions = useQuery({
    queryKey: ["read-session-suggest"],
    queryFn: suggestReadBooks,
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: readSessionsQueryKey() });
    if (selectedId) {
      void queryClient.invalidateQueries({
        queryKey: ["read-session", selectedId],
      });
    }
  }

  const create = useMutation({
    mutationFn: createReadSession,
    onSuccess: (session) => {
      setSelectedId(session.id);
      invalidate();
    },
  });
  const saveSlate = useMutation({
    mutationFn: () => setReadSlate(selectedId ?? "", slate),
    onSuccess: invalidate,
  });
  const start = useMutation({
    mutationFn: () => startReadVoting(selectedId ?? ""),
    onSuccess: invalidate,
  });
  const resolve = useMutation({
    mutationFn: (input: { winnerBookId?: string; random?: boolean }) =>
      resolveReadVote(selectedId ?? "", input),
    onSuccess: invalidate,
  });
  const cancel = useMutation({
    mutationFn: () => cancelReadSession(selectedId ?? ""),
    onSuccess: invalidate,
  });
  const complete = useMutation({
    mutationFn: () => completeReadSession(selectedId ?? ""),
    onSuccess: invalidate,
  });
  const removeReader = useMutation({
    mutationFn: (userId: string) => removeReadReader(selectedId ?? "", userId),
    onSuccess: invalidate,
  });

  const session = detail.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium">Sessions</h1>
          <p className="text-sm text-muted-foreground">
            One open session at a time. Build a slate, start the Discord vote,
            then resolve a winner.
          </p>
        </div>
        <Button disabled={create.isPending} onClick={() => create.mutate()}>
          New session
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(sessions.data ?? []).map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.createdAt}</TableCell>
              <TableCell className="text-right">
                <Button
                  onClick={() => setSelectedId(row.id)}
                  size="sm"
                  variant="outline"
                >
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {session ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium">
            Session {session.status}
            {session.book ? ` · ${session.book.title}` : ""}
          </h2>
          {session.status === "not_started" ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Select 2–10 books, save the slate, then start voting.
              </p>
              {(suggestions.data ?? []).map((book) => (
                <label
                  className="flex items-center gap-2 text-sm"
                  key={book.id}
                >
                  <input
                    checked={slate.includes(book.id)}
                    onChange={(event) => {
                      setSlate((current) =>
                        event.target.checked
                          ? [...current, book.id]
                          : current.filter((id) => id !== book.id),
                      );
                    }}
                    type="checkbox"
                  />
                  {book.title} · {book.author} · {book.pageCount}p ·{" "}
                  {book.firstPublishYear}
                </label>
              ))}
              <div className="flex gap-2">
                <Button
                  disabled={saveSlate.isPending}
                  onClick={() => saveSlate.mutate()}
                  variant="outline"
                >
                  Save slate
                </Button>
                <Button
                  disabled={start.isPending}
                  onClick={() => start.mutate()}
                >
                  Start voting
                </Button>
              </div>
            </div>
          ) : null}
          {session.candidates.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Slate:{" "}
              {session.candidates
                .map((candidate) => candidate.title)
                .join(", ")}
            </p>
          ) : null}
          {session.status === "voting" ? (
            <div className="flex flex-wrap gap-2">
              {session.candidates.map((candidate) => (
                <Button
                  key={candidate.id}
                  onClick={() =>
                    resolve.mutate({ winnerBookId: candidate.bookId })
                  }
                  size="sm"
                  variant="outline"
                >
                  Pick {candidate.title}
                </Button>
              ))}
              <Button
                onClick={() => resolve.mutate({ random: true })}
                size="sm"
              >
                Random
              </Button>
              {session.readers.map((reader) => (
                <Button
                  key={reader.userId}
                  onClick={() => removeReader.mutate(reader.userId)}
                  size="sm"
                  variant="ghost"
                >
                  Remove {reader.username}
                </Button>
              ))}
            </div>
          ) : null}
          {session.status === "active" ? (
            <Button onClick={() => complete.mutate()}>Force complete</Button>
          ) : null}
          {session.status === "not_started" ||
          session.status === "voting" ||
          session.status === "active" ? (
            <Button onClick={() => cancel.mutate()} variant="destructive">
              Cancel session
            </Button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
