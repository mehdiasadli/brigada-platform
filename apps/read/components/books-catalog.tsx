"use client";

import { Button } from "@brigada/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@brigada/ui/components/empty";
import { Field, FieldLabel } from "@brigada/ui/components/field";
import { Input } from "@brigada/ui/components/input";
import { NumberInput } from "@brigada/ui/components/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@brigada/ui/components/select";
import { useEffect, useMemo, useState } from "react";
import { readResponseError } from "../lib/api-error";
import type { CatalogPage, ReadBook } from "../lib/read-types";
import { BookCard } from "./book-card";

const SORTS = [
  { value: "createdAt:desc", label: "Newest added" },
  { value: "createdAt:asc", label: "Oldest added" },
  { value: "firstPublishYear:desc", label: "Newest published" },
  { value: "firstPublishYear:asc", label: "Oldest published" },
  { value: "pageCount:desc", label: "Most pages" },
  { value: "pageCount:asc", label: "Fewest pages" },
] as const;

const STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "readlist", label: "On the list" },
  { value: "reading", label: "Reading" },
  { value: "completed", label: "Finished" },
] as const;

export function BooksCatalog() {
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [status, setStatus] = useState("all");
  const [minYear, setMinYear] = useState<number | null>(null);
  const [maxYear, setMaxYear] = useState<number | null>(null);
  const [minPages, setMinPages] = useState<number | null>(null);
  const [maxPages, setMaxPages] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState("createdAt:desc");
  const [items, setItems] = useState<ReadBook[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [pending, setPending] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moreFilters, setMoreFilters] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setAppliedQ(q), 400);
    return () => window.clearTimeout(timeout);
  }, [q]);

  const query = useMemo(() => {
    const [sort, order] = sortKey.split(":") as [
      "createdAt" | "firstPublishYear" | "pageCount",
      "asc" | "desc",
    ];
    const params = new URLSearchParams();
    if (appliedQ.trim()) {
      params.set("q", appliedQ.trim());
    }
    if (status !== "all") {
      params.set("status", status);
    }
    if (minYear !== null) {
      params.set("minYear", String(minYear));
    }
    if (maxYear !== null) {
      params.set("maxYear", String(maxYear));
    }
    if (minPages !== null) {
      params.set("minPages", String(minPages));
    }
    if (maxPages !== null) {
      params.set("maxPages", String(maxPages));
    }
    params.set("sort", sort);
    params.set("order", order);
    params.set("limit", "20");
    return params.toString();
  }, [appliedQ, status, minYear, maxYear, minPages, maxPages, sortKey]);

  useEffect(() => {
    let cancelled = false;
    setPending(true);
    setError(null);
    void fetch(`/api/read/books?${query}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            await readResponseError(response, "Could not load books"),
          );
        }
        return (await response.json()) as CatalogPage;
      })
      .then((page) => {
        if (cancelled) {
          return;
        }
        setItems(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : "Could not load books",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPending(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const filtersOn =
    minYear !== null ||
    maxYear !== null ||
    minPages !== null ||
    maxPages !== null;

  async function loadMore() {
    if (!nextCursor) {
      return;
    }
    setLoadingMore(true);
    try {
      const response = await fetch(
        `/api/read/books?${query}&cursor=${nextCursor}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );
      if (!response.ok) {
        throw new Error(
          await readResponseError(response, "Could not load more books"),
        );
      }
      const page = (await response.json()) as CatalogPage;
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load more books",
      );
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <Field>
          <FieldLabel htmlFor="catalog-search">Search</FieldLabel>
          <Input
            id="catalog-search"
            onChange={(event) => setQ(event.target.value)}
            placeholder="Title or author"
            value={q}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select
              items={[...STATUSES]}
              onValueChange={(value) => {
                if (value) {
                  setStatus(value);
                }
              }}
              value={status}
            >
              <SelectTrigger className="w-full">
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
            <FieldLabel>Sort</FieldLabel>
            <Select
              items={[...SORTS]}
              onValueChange={(value) => {
                if (value) {
                  setSortKey(value);
                }
              }}
              value={sortKey}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Button
            onClick={() => setMoreFilters((current) => !current)}
            type="button"
            variant="outline"
          >
            {moreFilters
              ? "Hide filters"
              : filtersOn
                ? "Filters on"
                : "More filters"}
          </Button>
        </div>
        {moreFilters ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field>
              <FieldLabel htmlFor="min-year">From year</FieldLabel>
              <NumberInput
                allowEmpty
                id="min-year"
                max={2100}
                min={1000}
                onValueChange={setMinYear}
                placeholder="From"
                value={minYear}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="max-year">To year</FieldLabel>
              <NumberInput
                allowEmpty
                id="max-year"
                max={2100}
                min={1000}
                onValueChange={setMaxYear}
                placeholder="To"
                value={maxYear}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="min-pages">Min pages</FieldLabel>
              <NumberInput
                allowEmpty
                id="min-pages"
                max={20_000}
                min={1}
                onValueChange={setMinPages}
                placeholder="From"
                value={minPages}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="max-pages">Max pages</FieldLabel>
              <NumberInput
                allowEmpty
                id="max-pages"
                max={20_000}
                min={1}
                onValueChange={setMaxPages}
                placeholder="To"
                value={maxPages}
              />
            </Field>
          </div>
        ) : null}
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {pending ? (
        <p className="text-sm text-muted-foreground">Loading books…</p>
      ) : items.length === 0 ? (
        <Empty className="items-start rounded-none p-0 text-left">
          <EmptyHeader className="max-w-none items-start text-left">
            <EmptyTitle>No books match</EmptyTitle>
            <EmptyDescription>
              Try a different search or clear the filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {items.map((book) => (
            <BookCard book={book} key={book.id} />
          ))}
        </div>
      )}
      {nextCursor ? (
        <div>
          <Button
            disabled={loadingMore}
            onClick={() => void loadMore()}
            variant="outline"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
