"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@brigada/ui/components/alert";
import { Button } from "@brigada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@brigada/ui/components/dialog";
import { Field, FieldLabel } from "@brigada/ui/components/field";
import { Input } from "@brigada/ui/components/input";
import { Textarea } from "@brigada/ui/components/textarea";
import { toast } from "@brigada/ui/components/toast";
import { CircleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readResponseError } from "../lib/api-error";

type Hit = {
  olibKey: string;
  title: string;
  author: string | null;
  pageCount: number | null;
  firstPublishYear: number | null;
  subtitle: string | null;
  coverId: number | null;
};

function hitIsComplete(hit: Hit) {
  return Boolean(hit.author && hit.pageCount && hit.firstPublishYear);
}

export function NominateBookDialog({
  book,
}: {
  book?: { id: string; title: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [searching, setSearching] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const selected = hits.find((hit) => hit.olibKey === selectedKey) ?? null;
  const selectedReady = selected ? hitIsComplete(selected) : false;

  function reset() {
    setQuery("");
    setHits([]);
    setSelectedKey(null);
    setReason("");
    setError(null);
    setSearched(false);
  }

  async function search() {
    const q = query.trim();
    if (!q) {
      return;
    }
    setSearching(true);
    setError(null);
    setSelectedKey(null);
    try {
      const response = await fetch(
        `/api/read/books/search?q=${encodeURIComponent(q)}`,
        { credentials: "include", cache: "no-store" },
      );
      if (!response.ok) {
        throw new Error(
          await readResponseError(response, "Could not search Open Library"),
        );
      }
      setHits((await response.json()) as Hit[]);
      setSearched(true);
    } catch (cause) {
      setHits([]);
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not search Open Library",
      );
    } finally {
      setSearching(false);
    }
  }

  async function submit() {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Add a short reason.");
      return;
    }
    if (!book && (!selected || !selectedReady)) {
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/read/me/nominations", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          book
            ? { bookId: book.id, reason: trimmed }
            : {
                reason: trimmed,
                olibKey: selected?.olibKey,
                title: selected?.title,
                author: selected?.author,
                pageCount: selected?.pageCount,
                firstPublishYear: selected?.firstPublishYear,
                subtitle: selected?.subtitle,
                coverId: selected?.coverId,
              },
        ),
      });
      if (!response.ok) {
        throw new Error(
          await readResponseError(response, "Could not nominate this book"),
        );
      }
      setOpen(false);
      reset();
      toast.add({ type: "success", title: "Nominated" });
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Could not nominate this book";
      setError(message);
      toast.add({
        type: "error",
        title: "That didn’t work",
        description: message,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        {book ? "Nominate for a later vote" : "Nominate a book"}
      </Button>
      <Dialog
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            reset();
          }
        }}
        open={open}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {book ? `Nominate ${book.title}` : "Nominate a book"}
            </DialogTitle>
            <DialogDescription>
              {book
                ? "Say why the club should read it later. The title and author stay as they are."
                : "Search Open Library, then say why the club should read it. You can’t change the title or author."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            {book ? null : (
              <Field>
                <FieldLabel htmlFor="nominate-search">
                  Title or author
                </FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="nominate-search"
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void search();
                      }
                    }}
                    value={query}
                  />
                  <Button
                    disabled={searching || query.trim().length === 0}
                    onClick={() => void search()}
                    type="button"
                    variant="outline"
                  >
                    {searching ? "Searching…" : "Search"}
                  </Button>
                </div>
              </Field>
            )}
            {book ? null : searched && hits.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No titles matched.
              </p>
            ) : null}
            {hits.length > 0 ? (
              <ul className="flex max-h-52 flex-col overflow-y-auto">
                {hits.map((hit) => {
                  const active = hit.olibKey === selectedKey;
                  return (
                    <li key={hit.olibKey}>
                      <button
                        className={`flex w-full flex-col gap-0.5 border-b py-2 text-left last:border-b-0 ${active ? "text-foreground" : "text-muted-foreground"}`}
                        onClick={() => setSelectedKey(hit.olibKey)}
                        type="button"
                      >
                        <span className="font-medium text-foreground">
                          {hit.title}
                        </span>
                        <span className="text-sm">
                          {hit.author ?? "Author unknown"}
                          {hit.firstPublishYear
                            ? `, ${hit.firstPublishYear}`
                            : ""}
                          {hit.pageCount ? `, ${hit.pageCount} pages` : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {book || selected ? (
              <Field>
                <FieldLabel htmlFor="nominate-reason">Why this book</FieldLabel>
                <Textarea
                  id="nominate-reason"
                  maxLength={280}
                  onChange={(event) => setReason(event.target.value)}
                  value={reason}
                />
              </Field>
            ) : null}
            {selected && !selectedReady ? (
              <p className="text-sm text-muted-foreground">
                Open Library is missing a page count or year. Ask an admin to
                add this title.
              </p>
            ) : null}
            {error ? (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>That didn’t work</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter>
              <Button
                disabled={
                  pending ||
                  reason.trim().length === 0 ||
                  (!book && !selectedReady)
                }
                type="submit"
              >
                {pending ? "Nominating…" : "Nominate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
