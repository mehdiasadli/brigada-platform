"use client";

import { Button } from "@brigada/ui/components/button";
import { Skeleton } from "@brigada/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@brigada/ui/components/table";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@brigada/ui/components/toggle-group";
import { cn } from "cn";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  sortDirection?: "asc" | "desc";
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  selectedKey,
  empty,
  loading = false,
  page,
  pageCount,
  onPageChange,
  limit,
  limitOptions = [10, 20, 50],
  onLimitChange,
  onSort,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedKey?: string;
  empty?: ReactNode;
  loading?: boolean;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  limit: number;
  limitOptions?: number[];
  onLimitChange: (limit: number) => void;
  onSort?: (columnId: string) => void;
}) {
  const skeletonRows = Math.min(limit, 8);

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, row: T) {
    if (!onRowClick) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id}>
                {column.sortable && onSort ? (
                  <Button
                    onClick={() => onSort(column.id)}
                    size="sm"
                    variant="ghost"
                  >
                    {column.header}
                    {column.sortDirection === "asc" ? (
                      <ArrowUpIcon data-icon="inline-end" />
                    ) : null}
                    {column.sortDirection === "desc" ? (
                      <ArrowDownIcon data-icon="inline-end" />
                    ) : null}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && data.length === 0 ? (
            Array.from({ length: skeletonRows }, (_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length > 0 ? (
            data.map((row) => {
              const key = getRowKey(row);
              const selected = selectedKey === key;

              return (
                <TableRow
                  key={key}
                  className={cn(onRowClick ? "cursor-pointer" : undefined)}
                  data-state={selected ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => handleRowKeyDown(event, row)
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id}>{column.cell(row)}</TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell className="h-32" colSpan={columns.length}>
                {empty ?? "No results."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <ToggleGroup
          onValueChange={(next) => {
            const selected = next[0];
            if (selected) {
              onLimitChange(Number(selected));
            }
          }}
          size="sm"
          spacing={0}
          value={[String(limit)]}
          variant="outline"
        >
          {limitOptions.map((option) => (
            <ToggleGroupItem key={option} value={String(option)}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <Button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            size="sm"
            variant="ghost"
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Previous
          </Button>
          <span className="px-2 text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Button
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            size="sm"
            variant="ghost"
          >
            Next
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  );
}
