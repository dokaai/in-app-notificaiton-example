"use client";

import { ProtectedAppShell } from "@/features/components/layout/ProtectedAppShell";
import { DashboardOverviewPage } from "@/features/pages/DashboardOverviewPage";

export default function HomePage() {
  return (
    <ProtectedAppShell>
      <DashboardOverviewPage />
    </ProtectedAppShell>
  );
}
