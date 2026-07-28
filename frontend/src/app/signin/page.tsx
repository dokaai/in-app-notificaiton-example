"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginScreen } from "@/features/components/auth/LoginScreen";
import { useDemoStore } from "@/features/store/useDemoStore";

export default function SignInPage() {
  const router = useRouter();
  const isAuthenticated = useDemoStore((state) => state.isAuthenticated);
  const isHydrated = useDemoStore((state) => state.isHydrated);
  const initializeFromStorage = useDemoStore((state) => state.initializeFromStorage);

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated || isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </main>
    );
  }

  return <LoginScreen />;
}
