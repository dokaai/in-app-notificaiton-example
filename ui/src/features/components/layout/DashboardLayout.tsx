"use client";

import { Sidebar } from "@/features/components/layout/Sidebar";
import { Navbar } from "@/features/components/layout/Navbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen overflow-hidden bg-muted/50">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Navbar />
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
