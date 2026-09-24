"use client";

import { Badge } from "@brigada/ui/components/badge";
import { Button } from "@brigada/ui/components/button";
import { Field, FieldLabel } from "@brigada/ui/components/field";
import { Input } from "@brigada/ui/components/input";
import { NumberInput } from "@brigada/ui/components/number-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@brigada/ui/components/table";
import { toast } from "@brigada/ui/components/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActionError, firstError } from "../../../../components/action-error";
import { BookCover } from "../../../../components/book-cover";
import {
  createReadBook,
  listReadBooks,
  type OpenLibraryHit,
  type ReadBook,
  readBooksQueryKey,
  searchOpenLibrary,
  updateReadBook,
} from "../../../../lib/read-admin";
import { BookSheet } from "./book-sheet";
import { OpenNominations } from "./nominations";

function bookStatusLabel(status: ReadBook["status"]) {
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

function bookStatusVariant(status: ReadBook["status"]) {
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

export function ReadBooksPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<OpenLibraryHit[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Partial<OpenLibraryHit>>>(
    {},
  );
  const [editing, setEditing] = useState<ReadBook | null>(null);

  const books = useQuery({
    queryKey: readBooksQueryKey(),
    queryFn: listReadBooks,
  });

  const search = useMutation({
    mutationFn: searchOpenLibrary,
    onSuccess: setHits,
  });

  const create = useMutation({
    mutationFn: createReadBook,
    onSuccess: () => {
      toast.add({ type: "success", title: "Book added" });
      void queryClient.invalidateQueries({ queryKey: readBooksQueryKey() });
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Parameters<typeof updateReadBook>[1];
    }) => updateReadBook(id, patch),
    onSuccess: (book) => {
      toast.add({ type: "success", title: "Book updated" });
      setEditing(book);
      void queryClient.invalidateQueries({ queryKey: readBooksQueryKey() });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => updateReadBook(id, { status: "removed" }),
    onSuccess: () => {
      toast.add({ type: "success", title: "Book removed" });
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: readBooksQueryKey() });
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">Books</h1>
        <p className="text-sm text-muted-foreground">
          Search OpenLibrary, then fill title, author, pages, and year before
          adding.
        </p>
      </div>
      <OpenNominations />
      <ActionError
        error={firstError(
          books.error,
          search.error,
          create.error,
          update.error,
          remove.error,
        )}
      />
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (query.trim()) {
            search.mutate(query.trim());
          }
        }}
      >
        <Input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search OpenLibrary"
          value={query}
        />
        <Button disabled={search.isPending} type="submit">
          Search
        </Button>
      </form>
      {hits.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-medium">Search results</h2>
          <ul className="flex flex-col">
            {hits.map((hit) => {
              const draft = { ...hit, ...drafts[hit.olibKey] };
              return (
                <li
                  className="grid gap-4 border-b py-4 last:border-b-0 md:grid-cols-[4.5rem_1fr_auto] md:items-start"
                  key={hit.olibKey}
                >
                  <BookCover
                    className="w-18"
                    coverId={draft.coverId}
                    title={draft.title ?? hit.title}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-sm"
                        htmlFor={`title-${hit.olibKey}`}
                      >
                        Title
                      </label>
                      <Input
                        defaultValue={hit.title}
                        id={`title-${hit.olibKey}`}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [hit.olibKey]: {
                              ...current[hit.olibKey],
                              title: event.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-sm"
                        htmlFor={`author-${hit.olibKey}`}
                      >
                        Author
                      </label>
                      <Input
                        defaultValue={hit.author ?? ""}
                        id={`author-${hit.olibKey}`}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [hit.olibKey]: {
                              ...current[hit.olibKey],
                              author: event.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <Field>
                      <FieldLabel htmlFor={`pages-${hit.olibKey}`}>
                        Pages
                      </FieldLabel>
                      <NumberInput
                        allowEmpty
                        id={`pages-${hit.olibKey}`}
                        max={20_000}
                        min={1}
                        onValueChange={(pageCount) =>
                          setDrafts((current) => ({
                            ...current,
                            [hit.olibKey]: {
                              ...current[hit.olibKey],
                              pageCount: pageCount ?? undefined,
                            },
                          }))
                        }
                        value={draft.pageCount ?? null}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`year-${hit.olibKey}`}>
                        Year
                      </FieldLabel>
                      <NumberInput
                        allowEmpty
                        id={`year-${hit.olibKey}`}
                        max={2100}
                        min={1000}
                        onValueChange={(firstPublishYear) =>
                          setDrafts((current) => ({
                            ...current,
                            [hit.olibKey]: {
                              ...current[hit.olibKey],
                              firstPublishYear: firstPublishYear ?? undefined,
                            },
                          }))
                        }
                        value={draft.firstPublishYear ?? null}
                      />
                    </Field>
                  </div>
                  <Button
                    className="md:mt-6"
                    disabled={create.isPending}
                    onClick={() => {
                      if (
                        !draft.title ||
                        !draft.author ||
                        !draft.pageCount ||
                        !draft.firstPublishYear
                      ) {
                        toast.add({
                          type: "warning",
                          title: "Fill the required fields",
                          description:
                            "Title, author, pages, and year are required.",
                        });
                        return;
                      }

                      create.mutate({
                        olibKey: hit.olibKey,
                        title: draft.title,
                        author: draft.author,
                        pageCount: draft.pageCount,
                        firstPublishYear: draft.firstPublishYear,
                        subtitle: draft.subtitle,
                        coverId: draft.coverId,
                      });
                    }}
                    size="sm"
                  >
                    Add
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Club list</h2>
        {(books.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No books yet. Search OpenLibrary above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(books.data ?? []).map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <BookCover
                      className="w-10"
                      coverId={book.coverId}
                      title={book.title}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.pageCount}</TableCell>
                  <TableCell>
                    <Badge variant={bookStatusVariant(book.status)}>
                      {bookStatusLabel(book.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => setEditing(book)}
                      size="sm"
                      variant="outline"
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
      <BookSheet
        book={editing}
        onClose={() => setEditing(null)}
        onRemove={() => {
          if (editing) {
            remove.mutate(editing.id);
          }
        }}
        onSave={(patch) => {
          if (editing) {
            update.mutate({ id: editing.id, patch });
          }
        }}
        open={editing !== null}
        pending={update.isPending || remove.isPending}
      />
    </div>
  );
}
