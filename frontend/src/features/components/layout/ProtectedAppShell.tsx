"use client";

import { useEffect } from "react";
import { LoginScreen } from "@/features/components/auth/LoginScreen";
import { DashboardLayout } from "@/features/components/layout/DashboardLayout";
import { useDemoStore } from "@/features/store/useDemoStore";

export function ProtectedAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useDemoStore((state) => state.isAuthenticated);
  const isHydrated = useDemoStore((state) => state.isHydrated);
  const initializeFromStorage = useDemoStore((state) => state.initializeFromStorage);

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
