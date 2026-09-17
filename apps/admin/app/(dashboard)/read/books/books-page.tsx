"use client";

import { Button } from "@brigada/ui/components/button";
import { Input } from "@brigada/ui/components/input";
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
import {
  createReadBook,
  listReadBooks,
  type OpenLibraryHit,
  readBooksQueryKey,
  searchOpenLibrary,
  updateReadBook,
} from "../../../../lib/read-admin";

export function ReadBooksPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<OpenLibraryHit[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Partial<OpenLibraryHit>>>(
    {},
  );

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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: readBooksQueryKey() }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => updateReadBook(id, { status: "removed" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: readBooksQueryKey() }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">Books</h1>
        <p className="text-sm text-muted-foreground">
          Search OpenLibrary, then fill title, author, pages, and year before
          adding.
        </p>
      </div>
      <ActionError
        error={firstError(
          books.error,
          search.error,
          create.error,
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Year</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {hits.map((hit) => {
              const draft = { ...hit, ...drafts[hit.olibKey] };
              return (
                <TableRow key={hit.olibKey}>
                  <TableCell>
                    <Input
                      defaultValue={hit.title}
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
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={hit.author ?? ""}
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
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={hit.pageCount ?? ""}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [hit.olibKey]: {
                            ...current[hit.olibKey],
                            pageCount: Number(event.target.value),
                          },
                        }))
                      }
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={hit.firstPublishYear ?? ""}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [hit.olibKey]: {
                            ...current[hit.olibKey],
                            firstPublishYear: Number(event.target.value),
                          },
                        }))
                      }
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : null}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Club list</h2>
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.pageCount}</TableCell>
                <TableCell>{book.status}</TableCell>
                <TableCell className="text-right">
                  {book.status !== "removed" ? (
                    <Button
                      onClick={() => remove.mutate(book.id)}
                      size="sm"
                      variant="outline"
                    >
                      Remove
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
