"use client";

import { ProtectedAppShell } from "@/features/components/layout/ProtectedAppShell";
import { NotificationsDashboardPage } from "@/features/pages/NotificationsDashboardPage";

export default function NotificationPage() {
  return (
    <ProtectedAppShell>
      <NotificationsDashboardPage />
    </ProtectedAppShell>
  );
}
