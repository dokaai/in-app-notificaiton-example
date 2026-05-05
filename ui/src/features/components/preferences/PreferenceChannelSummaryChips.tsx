"use client";

import { Badge } from "@/components/ui/badge";

export function PreferenceChannelSummaryChips({
  labels,
  emptyLabel = "All channels disabled",
}: {
  labels: string[];
  emptyLabel?: string;
}) {
  if (labels.length === 0) {
    return <span className="text-sm text-muted-foreground">{emptyLabel}</span>;
  }

  return (
    <>
      {labels.map((label) => (
        <Badge
          key={label}
          className="rounded-full bg-primary-light px-3 py-1 text-primary hover:bg-primary-light"
        >
          {label}
        </Badge>
      ))}
    </>
  );
}
