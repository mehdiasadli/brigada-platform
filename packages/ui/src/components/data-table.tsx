"use client";

import { Button } from "@brigada/ui/components/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@brigada/ui/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@brigada/ui/components/table";
import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortHref?: string;
  sortDirection?: "asc" | "desc";
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  empty,
  page,
  pageCount,
  getPageHref,
  limit,
  limitOptions = [10, 20, 50],
  getLimitHref,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  page: number;
  pageCount: number;
  getPageHref: (page: number) => string;
  limit: number;
  limitOptions?: number[];
  getLimitHref: (limit: number) => string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id}>
                {column.sortHref ? (
                  <a className="hover:underline" href={column.sortHref}>
                    {column.header}
                    {column.sortDirection ? (
                      <span className="text-muted-foreground">
                        {column.sortDirection === "asc" ? " ↑" : " ↓"}
                      </span>
                    ) : null}
                  </a>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow
                key={getRowKey(row)}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={column.id}>{column.cell(row)}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                {empty ?? "No results."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2">
          {limitOptions.map((option) => (
            <Button
              key={option}
              nativeButton={false}
              render={<a href={getLimitHref(option)} />}
              size="sm"
              variant={option === limit ? "outline" : "ghost"}
            >
              {option}
            </Button>
          ))}
        </div>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={page <= 1}
                href={page > 1 ? getPageHref(page - 1) : undefined}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-2 text-sm text-muted-foreground">
                Page {page} of {pageCount}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                aria-disabled={page >= pageCount}
                href={page < pageCount ? getPageHref(page + 1) : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
