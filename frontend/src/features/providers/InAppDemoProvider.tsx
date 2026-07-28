"use client";

import { InAppDemoBootstrap } from "@/features/providers/InAppDemoBootstrap";

export function InAppDemoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <InAppDemoBootstrap />
      {children}
    </>
  );
}
