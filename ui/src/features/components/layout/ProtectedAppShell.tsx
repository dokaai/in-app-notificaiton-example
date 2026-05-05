"use client";

import { useEffect } from "react";
import { LoginScreen } from "@/features/components/auth/LoginScreen";
import { DashboardLayout } from "@/features/components/layout/DashboardLayout";
import { useSdkStore } from "@/features/store/useSdkStore";

export function ProtectedAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useSdkStore((state) => state.isAuthenticated);
  const isHydrated = useSdkStore((state) => state.isHydrated);
  const initializeFromStorage = useSdkStore((state) => state.initializeFromStorage);

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
