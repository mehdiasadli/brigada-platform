"use client";

import { Badge } from "@brigada/ui/components/badge";
import { Button } from "@brigada/ui/components/button";
import { ConfirmDialog } from "@brigada/ui/components/confirm-dialog";
import { Field, FieldGroup, FieldLabel } from "@brigada/ui/components/field";
import { Input } from "@brigada/ui/components/input";
import { NumberInput } from "@brigada/ui/components/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@brigada/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@brigada/ui/components/sheet";
import { Textarea } from "@brigada/ui/components/textarea";
import { useEffect, useState } from "react";
import { BookCover } from "../../../../components/book-cover";
import type { ReadBook } from "../../../../lib/read-admin";

const STATUSES = [
  { value: "readlist", label: "On the list" },
  { value: "reading", label: "Reading" },
  { value: "completed", label: "Finished" },
  { value: "removed", label: "Removed" },
] as const;

function statusLabel(status: ReadBook["status"]) {
  return STATUSES.find((item) => item.value === status)?.label ?? status;
}

export function BookSheet({
  book,
  open,
  pending,
  onClose,
  onSave,
  onRemove,
}: {
  book: ReadBook | null;
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onSave: (
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
        | "coverId"
      >
    >,
  ) => void;
  onRemove: () => void;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [firstPublishYear, setFirstPublishYear] = useState<number | null>(null);
  const [status, setStatus] = useState<ReadBook["status"]>("readlist");
  const [coverId, setCoverId] = useState<number | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    if (!book) {
      return;
    }

    setTitle(book.title);
    setAuthor(book.author);
    setSubtitle(book.subtitle ?? "");
    setDescription(book.description ?? "");
    setPageCount(book.pageCount);
    setFirstPublishYear(book.firstPublishYear);
    setStatus(book.status);
    setCoverId(book.coverId);
    setConfirmRemove(false);
  }, [book]);

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
        {book ? (
          <>
            <SheetHeader>
              <Badge className="w-fit" variant="secondary">
                {statusLabel(book.status)}
              </Badge>
              <SheetTitle>Edit book</SheetTitle>
              <SheetDescription>
                Change the Open Library cover id if the imported cover is wrong.
              </SheetDescription>
            </SheetHeader>
            <form
              className="flex flex-col gap-6 px-4 pb-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (
                  !title.trim() ||
                  !author.trim() ||
                  !pageCount ||
                  !firstPublishYear
                ) {
                  return;
                }

                onSave({
                  title: title.trim(),
                  author: author.trim(),
                  subtitle: subtitle.trim() || null,
                  description: description.trim() || null,
                  pageCount,
                  firstPublishYear,
                  status,
                  coverId,
                });
              }}
            >
              <div className="flex gap-4">
                <BookCover
                  className="w-24 shrink-0"
                  coverId={coverId}
                  title={book.title}
                />
                <p className="text-sm text-muted-foreground">
                  {book.author}, {book.firstPublishYear}
                </p>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="book-cover">Cover id</FieldLabel>
                  <NumberInput
                    allowEmpty
                    id="book-cover"
                    min={1}
                    onValueChange={setCoverId}
                    value={coverId}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="book-title">Title</FieldLabel>
                  <Input
                    id="book-title"
                    onChange={(event) => setTitle(event.target.value)}
                    value={title}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="book-author">Author</FieldLabel>
                  <Input
                    id="book-author"
                    onChange={(event) => setAuthor(event.target.value)}
                    value={author}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="book-subtitle">Subtitle</FieldLabel>
                  <Input
                    id="book-subtitle"
                    onChange={(event) => setSubtitle(event.target.value)}
                    value={subtitle}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="book-pages">Pages</FieldLabel>
                  <NumberInput
                    id="book-pages"
                    max={20_000}
                    min={1}
                    onValueChange={setPageCount}
                    value={pageCount}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="book-year">First published</FieldLabel>
                  <NumberInput
                    id="book-year"
                    max={2100}
                    min={1000}
                    onValueChange={setFirstPublishYear}
                    value={firstPublishYear}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="book-status">Status</FieldLabel>
                  <Select
                    items={[...STATUSES]}
                    onValueChange={(value) => {
                      if (value) {
                        setStatus(value as ReadBook["status"]);
                      }
                    }}
                    value={status}
                  >
                    <SelectTrigger className="w-full" id="book-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="book-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    id="book-description"
                    onChange={(event) => setDescription(event.target.value)}
                    value={description}
                  />
                </Field>
              </FieldGroup>
              <SheetFooter className="px-0">
                {book.status !== "removed" ? (
                  <Button
                    onClick={() => setConfirmRemove(true)}
                    type="button"
                    variant="destructive"
                  >
                    Remove
                  </Button>
                ) : null}
                <Button disabled={pending} type="submit">
                  Save
                </Button>
              </SheetFooter>
            </form>
            <ConfirmDialog
              confirmLabel="Remove"
              description="It will leave the club list. Past sessions keep their history."
              destructive
              onConfirm={onRemove}
              onOpenChange={setConfirmRemove}
              open={confirmRemove}
              pending={pending}
              title="Remove this book?"
            />
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
