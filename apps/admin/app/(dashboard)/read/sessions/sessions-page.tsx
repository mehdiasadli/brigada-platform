"use client";

import { Badge } from "@brigada/ui/components/badge";
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
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { ActionError, firstError } from "../../../../components/action-error";
import {
  cancelReadSession,
  completeReadSession,
  createReadSession,
  getReadSession,
  listReadSessions,
  readSessionsQueryKey,
  removeReadReader,
  resolveReadVote,
  setReadReaderParticipation,
  setReadReaderProgress,
  setReadSlate,
  startReadVoting,
  suggestReadBooks,
} from "../../../../lib/read-admin";
import { SessionSheet } from "./session-sheet";

function sessionLabel(status: string) {
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

  useEffect(() => {
    if (detail.data) {
      setSlate(detail.data.candidates.map((candidate) => candidate.bookId));
    }
  }, [detail.data]);

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
  const updateParticipation = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: "reading" | "sat_out" | "dnf";
    }) => setReadReaderParticipation(selectedId ?? "", userId, status),
    onSuccess: invalidate,
  });
  const updateProgress = useMutation({
    mutationFn: ({
      userId,
      input,
    }: {
      userId: string;
      input: { percentage: number; notes: string | null };
    }) => setReadReaderProgress(selectedId ?? "", userId, input),
    onSuccess: invalidate,
  });

  const pending =
    saveSlate.isPending ||
    start.isPending ||
    resolve.isPending ||
    cancel.isPending ||
    complete.isPending ||
    removeReader.isPending ||
    updateProgress.isPending ||
    updateParticipation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium">Sessions</h1>
          <p className="text-sm text-muted-foreground">
            One open session at a time. Build a slate, start the Discord vote,
            then pick a winner.
          </p>
        </div>
        <Button disabled={create.isPending} onClick={() => create.mutate()}>
          New session
        </Button>
      </div>
      <ActionError
        error={firstError(
          sessions.error,
          detail.error,
          create.error,
          saveSlate.error,
          start.error,
          resolve.error,
          cancel.error,
          complete.error,
          removeReader.error,
          updateProgress.error,
          updateParticipation.error,
        )}
      />
      {(sessions.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No sessions yet.</p>
      ) : (
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
                <TableCell>
                  <Badge variant="secondary">{sessionLabel(row.status)}</Badge>
                </TableCell>
                <TableCell>
                  {format(parseISO(row.createdAt), "d MMM yyyy")}
                </TableCell>
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
      )}
      <SessionSheet
        loading={detail.isPending}
        onCancel={() => cancel.mutate()}
        onClose={() => setSelectedId(null)}
        onComplete={() => complete.mutate()}
        onPickWinner={(bookId) => resolve.mutate({ winnerBookId: bookId })}
        onRandomWinner={() => resolve.mutate({ random: true })}
        onRemoveReader={(userId) => removeReader.mutate(userId)}
        onSaveSlate={() => saveSlate.mutate()}
        onSlateChange={(bookId, selected) => {
          setSlate((current) =>
            selected
              ? [...current, bookId]
              : current.filter((id) => id !== bookId),
          );
        }}
        onStartVoting={() => start.mutate()}
        onSetParticipation={(userId, status) =>
          updateParticipation.mutate({ userId, status })
        }
        onUpdateProgress={(userId, input) =>
          updateProgress.mutate({ userId, input })
        }
        open={selectedId !== null}
        pending={pending}
        session={detail.data}
        slate={slate}
        suggestions={suggestions.data ?? []}
      />
    </div>
  );
}
