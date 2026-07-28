import type { Metadata } from "next";
import { InAppDemoProvider } from "@/features/providers/InAppDemoProvider";
import { ToastProvider } from "@/features/providers/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "DokaAI In-App Notification Demo",
  description: "Frontend and BFF demo for DokaAI in-app notifications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <InAppDemoProvider>
          {children}
          <ToastProvider />
        </InAppDemoProvider>
      </body>
    </html>
  );
}
