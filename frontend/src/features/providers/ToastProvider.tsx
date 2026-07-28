"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useToastStore, type ToastItem } from "@/features/store/useToastStore";
import { cn } from "@/features/utils/cn";

function ToastIcon({ variant }: { variant: ToastItem["variant"] }) {
  if (variant === "success") {
    return <CheckCircle2 className="h-5 w-5 text-primary" />;
  }

  if (variant === "error") {
    return <XCircle className="h-5 w-5 text-red-500" />;
  }

  return <Info className="h-5 w-5 text-sky-500" />;
}

function ToastRow({ toast }: { toast: ToastItem }) {
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      removeToast(toast.id);
    }, 3600);

    return () => window.clearTimeout(timeout);
  }, [removeToast, toast.id]);

  return (
    <div
      className={cn(
         "pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-soft animate-[toastIn_180ms_ease-out]",
        toast.variant === "success" && "border-primary/20",
        toast.variant === "error" && "border-red-200",
        toast.variant === "info" && "border-sky-200"
      )}
    >
      <div className="mt-0.5 shrink-0">
        <ToastIcon variant={toast.variant} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          {toast.variant === "success" ? "Success" : toast.variant === "error" ? "Error" : "Info"}
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <>
      <div className="pointer-events-none fixed left-1/2 top-4 z-[1100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-3 sm:top-6">
        {toasts.map((toast) => (
          <ToastRow key={toast.id} toast={toast} />
        ))}
      </div>
      <style jsx global>{`
        @keyframes toastIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
