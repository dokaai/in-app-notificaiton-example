import { cn } from "@/features/utils/cn";

export function Avatar({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white",
        className
      )}
      aria-hidden="true"
    >
      {label.slice(0, 1).toUpperCase()}
    </div>
  );
}
