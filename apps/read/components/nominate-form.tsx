"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@brigada/ui/components/alert";
import { Button } from "@brigada/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@brigada/ui/components/field";
import { Input } from "@brigada/ui/components/input";
import { NumberInput } from "@brigada/ui/components/number-input";
import { toast } from "@brigada/ui/components/toast";
import { CircleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readResponseError } from "../lib/api-error";
import { BookCover } from "./book-cover";

type Hit = {
  olibKey: string;
  title: string;
  author: string | null;
  pageCount: number | null;
  firstPublishYear: number | null;
  subtitle: string | null;
  coverId: number | null;
};

export function NominateForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Partial<Hit>>>({});
  const [pending, setPending] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!query.trim()) {
            return;
          }
          setPending(true);
          setError(null);
          void fetch(`/api/read/search?q=${encodeURIComponent(query.trim())}`, {
            credentials: "include",
          })
            .then(async (response) => {
              if (!response.ok) {
                throw new Error(
                  await readResponseError(response, "Search failed"),
                );
              }
              setHits((await response.json()) as Hit[]);
            })
            .catch((caught: unknown) => {
              const message =
                caught instanceof Error ? caught.message : "Search failed";
              setError(message);
            })
            .finally(() => setPending(false));
        }}
      >
        <Input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Open Library"
          value={query}
        />
        <Button disabled={pending} type="submit">
          Search
        </Button>
      </form>
      {error ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>That didn’t work</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {hits.length > 0 ? (
        <ul className="flex flex-col">
          {hits.map((hit) => {
            const draft = { ...hit, ...drafts[hit.olibKey] };
            return (
              <li
                className="grid gap-4 border-b py-4 last:border-b-0 md:grid-cols-[4.5rem_1fr_auto] md:items-start"
                key={hit.olibKey}
              >
                <BookCover
                  coverId={draft.coverId ?? null}
                  title={draft.title ?? hit.title}
                />
                <FieldGroup className="grid gap-2 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`title-${hit.olibKey}`}>
                      Title
                    </FieldLabel>
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
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`author-${hit.olibKey}`}>
                      Author
                    </FieldLabel>
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
                  </Field>
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
                </FieldGroup>
                <Button
                  className="md:mt-6"
                  disabled={saving !== null}
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
                    setSaving(hit.olibKey);
                    void fetch("/api/read/books", {
                      method: "POST",
                      credentials: "include",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({
                        olibKey: hit.olibKey,
                        title: draft.title,
                        author: draft.author,
                        pageCount: draft.pageCount,
                        firstPublishYear: draft.firstPublishYear,
                        subtitle: draft.subtitle,
                        coverId: draft.coverId,
                      }),
                    })
                      .then(async (response) => {
                        if (!response.ok) {
                          const message = await readResponseError(
                            response,
                            "Could not add the book",
                          );
                          toast.add({
                            type: "error",
                            title: "That didn’t work",
                            description: message,
                          });
                          return;
                        }
                        const book = (await response.json()) as {
                          slug: string;
                        };
                        toast.add({ type: "success", title: "Book nominated" });
                        router.push(`/books/${book.slug}`);
                      })
                      .finally(() => setSaving(null));
                  }}
                  size="sm"
                >
                  Nominate
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
