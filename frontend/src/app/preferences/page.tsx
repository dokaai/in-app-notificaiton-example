"use client";

import { ProtectedAppShell } from "@/features/components/layout/ProtectedAppShell";
import { PreferenceSettingsPage } from "@/features/components/preferences/PreferenceSettingsPage";

export default function PreferencesPage() {
  return (
    <ProtectedAppShell>
      <PreferenceSettingsPage />
    </ProtectedAppShell>
  );
}
