"use client";

import { Badge } from "@brigada/ui/components/badge";
import { Button } from "@brigada/ui/components/button";
import { Checkbox } from "@brigada/ui/components/checkbox";
import { ConfirmDialog } from "@brigada/ui/components/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@brigada/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@brigada/ui/components/field";
import { NumberInput } from "@brigada/ui/components/number-input";
import { Separator } from "@brigada/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@brigada/ui/components/sheet";
import { Skeleton } from "@brigada/ui/components/skeleton";
import { StarRating } from "@brigada/ui/components/star-rating";
import { Textarea } from "@brigada/ui/components/textarea";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { BookCover } from "../../../../components/book-cover";
import type {
  ReadBook,
  ReadSessionDetail,
  ReadSessionReader,
} from "../../../../lib/read-admin";

function sessionLabel(status: ReadSessionDetail["status"]) {
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

function formatDate(value: string | null, withTime = false) {
  if (!value) {
    return null;
  }

  return format(parseISO(value), withTime ? "d MMM yyyy, HH:mm" : "d MMM yyyy");
}

type ConfirmKind =
  | { kind: "start" }
  | { kind: "winner"; bookId: string; title: string }
  | { kind: "random" }
  | { kind: "cancel" }
  | { kind: "complete" }
  | { kind: "remove-reader"; userId: string; name: string };

export function SessionSheet({
  open,
  loading,
  session,
  suggestions,
  slate,
  pending,
  onClose,
  onSlateChange,
  onSaveSlate,
  onStartVoting,
  onPickWinner,
  onRandomWinner,
  onRemoveReader,
  onComplete,
  onCancel,
  onUpdateProgress,
}: {
  open: boolean;
  loading: boolean;
  session: ReadSessionDetail | undefined;
  suggestions: ReadBook[];
  slate: string[];
  pending: boolean;
  onClose: () => void;
  onSlateChange: (bookId: string, selected: boolean) => void;
  onSaveSlate: () => void;
  onStartVoting: () => void;
  onPickWinner: (bookId: string) => void;
  onRandomWinner: () => void;
  onRemoveReader: (userId: string) => void;
  onComplete: () => void;
  onCancel: () => void;
  onUpdateProgress: (
    userId: string,
    input: { percentage: number; notes: string | null },
  ) => void;
}) {
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const [editingReader, setEditingReader] = useState<ReadSessionReader | null>(
    null,
  );
  const [editPercentage, setEditPercentage] = useState<number | null>(0);
  const [editNotes, setEditNotes] = useState("");

  const canEdit = session?.status === "not_started";
  const canVote = session?.status === "voting";
  const canComplete = session?.status === "active";
  const canEditProgress =
    session?.status === "active" || session?.status === "completed";
  const canCancel =
    session?.status === "not_started" ||
    session?.status === "voting" ||
    session?.status === "active";
  const finished = session?.status === "completed";

  const averages = session ? readerAverages(session.readers) : null;

  return (
    <Sheet
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      open={open}
    >
      <SheetContent className="overflow-y-auto data-[side=right]:sm:max-w-lg">
        {loading && !session ? (
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-32 w-24" />
          </div>
        ) : null}
        {session ? (
          <>
            <SheetHeader>
              <Badge className="w-fit" variant="secondary">
                {sessionLabel(session.status)}
              </Badge>
              <SheetTitle>
                {session.book?.title ?? "New reading session"}
              </SheetTitle>
              <SheetDescription>
                {session.book
                  ? `${session.book.author}, ${session.book.pageCount} pages`
                  : "Choose 2 to 10 books, save the slate, then start voting."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-6 px-4 pb-4">
              {session.book ? (
                <div className="flex gap-4">
                  <BookCover
                    className="w-24"
                    coverId={session.book.coverId}
                    title={session.book.title}
                  />
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {session.book.subtitle ? (
                      <p>{session.book.subtitle}</p>
                    ) : null}
                    <p>Published {session.book.firstPublishYear}</p>
                    <p>{session.book.pageCount} pages</p>
                  </div>
                </div>
              ) : null}
              <SessionDates session={session} />
              {finished && averages ? (
                <section className="grid grid-cols-2 gap-3">
                  <SummaryStat
                    label="Avg progress"
                    value={`${averages.progress}%`}
                  />
                  <SummaryStat
                    label="Finished"
                    value={`${averages.finished}/${session.readers.length}`}
                  />
                  <SummaryStat
                    label="Club rating"
                    value={
                      averages.rating === null
                        ? "No reviews"
                        : `${averages.rating / 2} / 5`
                    }
                  />
                  <SummaryStat
                    label="Reviews"
                    value={String(averages.reviewCount)}
                  />
                </section>
              ) : null}
              {canEdit ? (
                <section className="flex flex-col gap-3">
                  <h3 className="font-medium">Slate</h3>
                  {suggestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add books from the Books page first. Finished books stay
                      off this list.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {suggestions.map((book) => (
                        <li key={book.id}>
                          <label
                            className="flex items-start gap-3"
                            htmlFor={`slate-${book.id}`}
                          >
                            <Checkbox
                              checked={slate.includes(book.id)}
                              className="mt-1"
                              id={`slate-${book.id}`}
                              onCheckedChange={(checked) =>
                                onSlateChange(book.id, checked === true)
                              }
                            />
                            <BookCover
                              className="w-12 shrink-0"
                              coverId={book.coverId}
                              title={book.title}
                            />
                            <span className="flex flex-col gap-0.5 text-sm">
                              <span className="font-medium">{book.title}</span>
                              <span className="text-muted-foreground">
                                {book.author}, {book.pageCount} pages
                              </span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-col gap-2">
                    <Button
                      disabled={pending}
                      onClick={onSaveSlate}
                      variant="outline"
                    >
                      Save slate
                    </Button>
                    <Button
                      disabled={pending}
                      onClick={() => setConfirm({ kind: "start" })}
                    >
                      Start voting
                    </Button>
                  </div>
                </section>
              ) : null}
              {session.candidates.length > 0 && !canEdit ? (
                <section className="flex flex-col gap-3">
                  <h3 className="font-medium">
                    {finished ? "Slate and winner" : "Slate"}
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {session.candidates.map((candidate) => {
                      const winner = candidate.bookId === session.bookId;
                      return (
                        <li
                          className="flex items-center gap-3"
                          key={candidate.id}
                        >
                          <BookCover
                            className="w-12 shrink-0"
                            coverId={candidate.coverId}
                            title={candidate.title}
                          />
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <p className="font-medium">{candidate.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {candidate.author}
                            </p>
                          </div>
                          {winner ? (
                            <Badge variant="secondary">Winner</Badge>
                          ) : null}
                          {canVote ? (
                            <Button
                              disabled={pending}
                              onClick={() =>
                                setConfirm({
                                  kind: "winner",
                                  bookId: candidate.bookId,
                                  title: candidate.title,
                                })
                              }
                              size="sm"
                              variant="outline"
                            >
                              Pick
                            </Button>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                  {canVote ? (
                    <Button
                      disabled={pending}
                      onClick={() => setConfirm({ kind: "random" })}
                      variant="outline"
                    >
                      Pick at random
                    </Button>
                  ) : null}
                </section>
              ) : null}
              {session.readers.length > 0 ? (
                <section className="flex flex-col gap-3">
                  <Separator />
                  <h3 className="font-medium">Readers</h3>
                  <ul className="flex flex-col gap-3">
                    {session.readers.map((reader) => (
                      <li className="flex flex-col gap-2" key={reader.userId}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {reader.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              @{reader.username}
                            </span>
                          </div>
                          {canEdit || canVote ? (
                            <Button
                              disabled={pending}
                              onClick={() =>
                                setConfirm({
                                  kind: "remove-reader",
                                  userId: reader.userId,
                                  name: reader.name,
                                })
                              }
                              size="sm"
                              variant="ghost"
                            >
                              Remove
                            </Button>
                          ) : null}
                          {canEditProgress ? (
                            <Button
                              disabled={pending}
                              onClick={() => {
                                setEditingReader(reader);
                                setEditPercentage(
                                  reader.progress?.percentage ?? 0,
                                );
                                setEditNotes(reader.progress?.notes ?? "");
                              }}
                              size="sm"
                              variant="outline"
                            >
                              Edit
                            </Button>
                          ) : null}
                        </div>
                        {reader.progress || reader.review ? (
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            {reader.progress ? (
                              <p>
                                {reader.progress.isCompleted
                                  ? "Finished"
                                  : "Reading"}{" "}
                                · {reader.progress.percentage}%
                                {reader.progress.notes
                                  ? ` · ${reader.progress.notes}`
                                  : ""}
                              </p>
                            ) : null}
                            {reader.review ? (
                              <div className="flex items-center gap-2">
                                <StarRating value={reader.review.rating} />
                                {reader.review.body ? (
                                  <span>{reader.review.body}</span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
            {canComplete || canCancel ? (
              <SheetFooter>
                {canComplete ? (
                  <Button
                    disabled={pending}
                    onClick={() => setConfirm({ kind: "complete" })}
                  >
                    Force complete
                  </Button>
                ) : null}
                {canCancel ? (
                  <Button
                    disabled={pending}
                    onClick={() => setConfirm({ kind: "cancel" })}
                    variant="destructive"
                  >
                    Cancel session
                  </Button>
                ) : null}
              </SheetFooter>
            ) : null}
            <ConfirmDialog
              confirmLabel={confirmLabel(confirm)}
              description={confirmDescription(confirm)}
              destructive={
                confirm?.kind === "cancel" || confirm?.kind === "remove-reader"
              }
              onConfirm={() => {
                if (!confirm) {
                  return;
                }
                if (confirm.kind === "start") {
                  onStartVoting();
                }
                if (confirm.kind === "winner") {
                  onPickWinner(confirm.bookId);
                }
                if (confirm.kind === "random") {
                  onRandomWinner();
                }
                if (confirm.kind === "cancel") {
                  onCancel();
                }
                if (confirm.kind === "complete") {
                  onComplete();
                }
                if (confirm.kind === "remove-reader") {
                  onRemoveReader(confirm.userId);
                }
                setConfirm(null);
              }}
              onOpenChange={(next) => {
                if (!next) {
                  setConfirm(null);
                }
              }}
              open={confirm !== null}
              pending={pending}
              title={confirmTitle(confirm)}
            />
            <Dialog
              onOpenChange={(next) => {
                if (!next) {
                  setEditingReader(null);
                }
              }}
              open={editingReader !== null}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit reader progress</DialogTitle>
                  <DialogDescription>
                    {editingReader
                      ? `Update ${editingReader.name}'s status for this read.`
                      : "Update progress."}
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="reader-progress">Progress</FieldLabel>
                    <NumberInput
                      id="reader-progress"
                      max={100}
                      min={0}
                      onValueChange={setEditPercentage}
                      value={editPercentage}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="reader-notes">Notes</FieldLabel>
                    <Textarea
                      id="reader-notes"
                      onChange={(event) => setEditNotes(event.target.value)}
                      value={editNotes}
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button
                    disabled={pending || editPercentage === null}
                    onClick={() => {
                      if (!editingReader || editPercentage === null) {
                        return;
                      }
                      onUpdateProgress(editingReader.userId, {
                        percentage: editPercentage,
                        notes: editNotes.trim() || null,
                      });
                      setEditingReader(null);
                    }}
                  >
                    Save progress
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function SessionDates({ session }: { session: ReadSessionDetail }) {
  const rows = [
    ["Created", formatDate(session.createdAt)],
    ["Vote started", formatDate(session.votingStartedAt, true)],
    ["Vote ended", formatDate(session.votingEndedAt, true)],
    ["Read started", formatDate(session.startedAt)],
    ["Finish by", formatDate(session.readingDeadline)],
    ["Completed", formatDate(session.completedAt)],
    ["Cancelled", formatDate(session.cancelledAt)],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  if (rows.length === 0) {
    return null;
  }

  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      {rows.map(([label, value]) => (
        <div className="flex flex-col gap-0.5" key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function readerAverages(readers: ReadSessionReader[]) {
  const withProgress = readers.filter((reader) => reader.progress);
  const reviews = readers.flatMap((reader) =>
    reader.review ? [reader.review] : [],
  );
  const progress =
    withProgress.length === 0
      ? 0
      : Math.round(
          withProgress.reduce(
            (sum, reader) => sum + (reader.progress?.percentage ?? 0),
            0,
          ) / withProgress.length,
        );

  return {
    progress,
    finished: readers.filter((reader) => reader.progress?.isCompleted).length,
    reviewCount: reviews.length,
    rating:
      reviews.length === 0
        ? null
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length,
  };
}

function confirmTitle(confirm: ConfirmKind | null) {
  switch (confirm?.kind) {
    case "start":
      return "Start the Discord vote?";
    case "winner":
      return `Start the read with ${confirm.title}?`;
    case "random":
      return "Pick a winner at random?";
    case "cancel":
      return "Cancel this session?";
    case "complete":
      return "End this session now?";
    case "remove-reader":
      return `Remove ${confirm.name}?`;
    default:
      return "Are you sure?";
  }
}

function confirmDescription(confirm: ConfirmKind | null) {
  switch (confirm?.kind) {
    case "start":
      return "This posts the slate to Discord and starts a 12-hour vote.";
    case "winner":
      return "Readers will start this book and the vote will close.";
    case "random":
      return "One slate book will be chosen and the read will start.";
    case "cancel":
      return "The vote or read will stop. This cannot be undone.";
    case "complete":
      return "The book will be marked finished for the club.";
    case "remove-reader":
      return "They will leave this session roster.";
    default:
      return "Please confirm this action.";
  }
}

function confirmLabel(confirm: ConfirmKind | null) {
  switch (confirm?.kind) {
    case "start":
      return "Start voting";
    case "winner":
    case "random":
      return "Pick winner";
    case "cancel":
      return "Cancel session";
    case "complete":
      return "Complete";
    case "remove-reader":
      return "Remove";
    default:
      return "Confirm";
  }
}
