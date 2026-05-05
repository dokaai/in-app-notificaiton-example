import type { Metadata } from "next";
import { InAppSdkHostProvider } from "@/features/providers/InAppSdkHostProvider";
import { ToastProvider } from "@/features/providers/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "DokaAI In-App Notification SDK Demo",
  description: "UI-only demo for the DokaAI In-App Notification SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <InAppSdkHostProvider>
          {children}
          <ToastProvider />
        </InAppSdkHostProvider>
      </body>
    </html>
  );
}
