"use client";

import { CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";

export type NotificationReadFilter = "all" | "read" | "unread";

const FILTER_OPTIONS: { label: string; value: NotificationReadFilter }[] = [
  { label: "All", value: "all" },
  { label: "Read", value: "read" },
  { label: "Unread", value: "unread" },
];

const SIZE_OPTIONS = [10, 25, 50, 100];

export function NotificationActions({
  filter,
  page,
  size,
  hasMore,
  totalPages,
  onFilterChange,
  onSizeChange,
  onPrevPage,
  onNextPage,
  onMarkAllAsRead,
}: {
  filter: NotificationReadFilter;
  page: number;
  size: number;
  hasMore: boolean;
  totalPages: number;
  onFilterChange: (value: NotificationReadFilter) => void;
  onSizeChange: (value: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onMarkAllAsRead: () => void | Promise<void>;
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <Button className="h-10" variant="outline" onClick={onMarkAllAsRead}>
        <CheckCheck className="h-4 w-4" />
      </Button>
      <Dropdown
        ariaLabel="Notification read filter"
        options={FILTER_OPTIONS}
        value={filter}
        onChange={onFilterChange}
      />
      <div className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-1.5 py-1 shadow-sm">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={page <= 1}
          className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[4rem] text-center text-sm font-medium text-foreground">
          {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={onNextPage}
          disabled={!hasMore}
          className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <Dropdown
        ariaLabel="Notifications page size"
        options={SIZE_OPTIONS.map((option) => ({
          label: `${option}`,
          value: option,
        }))}
        value={size}
        onChange={onSizeChange}
      />
    </div>
  );
}
