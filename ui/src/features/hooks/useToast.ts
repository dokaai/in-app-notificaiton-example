"use client";

import { useMemo } from "react";
import { useToastStore } from "@/features/store/useToastStore";

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);

  return useMemo(
    () => ({
      success: (message: string) => addToast({ message, variant: "success" }),
      error: (message: string) => addToast({ message, variant: "error" }),
      info: (message: string) => addToast({ message, variant: "info" }),
    }),
    [addToast]
  );
}
