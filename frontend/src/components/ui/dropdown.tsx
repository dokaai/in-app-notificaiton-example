"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/features/utils/cn";

export interface DropdownOption<TValue extends string | number> {
  label: string;
  value: TValue;
}

export function Dropdown<TValue extends string | number>({
  ariaLabel,
  label,
  options,
  value,
  onChange,
  className,
  triggerClassName,
  menuClassName,
}: {
  ariaLabel: string;
  label?: string;
  options: DropdownOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {label ? (
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex h-10 min-w-[80px] items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-foreground shadow-sm transition hover:border-slate-300",
          triggerClassName
        )}
      >
        <span>{selected.label}</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-500 transition", isOpen && "rotate-180")} />
      </button>
      {isOpen ? (
        <div
          className={cn(
            "absolute left-0 top-[calc(100%+0.5rem)] z-30 min-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-soft",
            menuClassName
          )}
        >
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition",
                option.value === value
                  ? "bg-primary-light text-primary"
                  : "text-foreground hover:bg-slate-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
