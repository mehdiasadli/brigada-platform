"use client";

import { Badge } from "@brigada/ui/components/badge";
import { Button } from "@brigada/ui/components/button";
import { Checkbox } from "@brigada/ui/components/checkbox";
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
import { format, parseISO } from "date-fns";
import { BookCover } from "../../../../components/book-cover";
import type { ReadBook, ReadSessionDetail } from "../../../../lib/read-admin";

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
}) {
  const canEdit = session?.status === "not_started";
  const canVote = session?.status === "voting";
  const canComplete = session?.status === "active";
  const canCancel =
    session?.status === "not_started" ||
    session?.status === "voting" ||
    session?.status === "active";

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
              {session.votingDeadline || session.readingDeadline ? (
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {session.votingDeadline ? (
                    <p>
                      Vote ends{" "}
                      {format(parseISO(session.votingDeadline), "d MMM, HH:mm")}
                    </p>
                  ) : null}
                  {session.readingDeadline ? (
                    <p>
                      Finish by{" "}
                      {format(parseISO(session.readingDeadline), "d MMM yyyy")}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {session.book ? (
                <div className="flex gap-4">
                  <BookCover
                    className="w-24"
                    coverId={session.book.coverId}
                    title={session.book.title}
                  />
                  <p className="text-sm text-muted-foreground">
                    {session.book.subtitle ??
                      `${session.book.firstPublishYear}`}
                  </p>
                </div>
              ) : null}
              {canEdit ? (
                <section className="flex flex-col gap-3">
                  <h3 className="font-medium">Slate</h3>
                  {suggestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add books from the Books page first.
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
                    <Button disabled={pending} onClick={onStartVoting}>
                      Start voting
                    </Button>
                  </div>
                </section>
              ) : null}
              {session.candidates.length > 0 && !canEdit ? (
                <section className="flex flex-col gap-3">
                  <h3 className="font-medium">Slate</h3>
                  <ul className="flex flex-col gap-3">
                    {session.candidates.map((candidate) => (
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
                        {canVote ? (
                          <Button
                            disabled={pending}
                            onClick={() => onPickWinner(candidate.bookId)}
                            size="sm"
                            variant="outline"
                          >
                            Pick
                          </Button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  {canVote ? (
                    <Button
                      disabled={pending}
                      onClick={onRandomWinner}
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
                  <ul className="flex flex-col gap-2">
                    {session.readers.map((reader) => (
                      <li
                        className="flex items-center justify-between gap-3"
                        key={reader.userId}
                      >
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
                            onClick={() => onRemoveReader(reader.userId)}
                            size="sm"
                            variant="ghost"
                          >
                            Remove
                          </Button>
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
                  <Button disabled={pending} onClick={onComplete}>
                    Force complete
                  </Button>
                ) : null}
                {canCancel ? (
                  <Button
                    disabled={pending}
                    onClick={onCancel}
                    variant="destructive"
                  >
                    Cancel session
                  </Button>
                ) : null}
              </SheetFooter>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
