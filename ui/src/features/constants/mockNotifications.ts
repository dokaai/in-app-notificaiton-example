import { InAppNotificationItem } from "@/features/types/notification.types";

export const MOCK_NOTIFICATIONS: InAppNotificationItem[] = [
  {
    id: "notif-1",
    title: "Your subscription payment has been received",
    subtitle: "Billing update",
    body: "Your Pro plan has been renewed successfully. Your invoice is now available for download.",
    timestamp: "2026-04-28T10:15:00.000Z",
    isRead: false,
    avatars: [
      { id: "a1", name: "Finance" },
      { id: "a2", name: "Support" },
      { id: "a3", name: "Admin" },
    ],
    tags: [
      { id: "t1", label: "Billing" },
      { id: "t2", label: "Pro Plan" },
      { id: "t3", label: "Invoice Ready" },
    ],
    attachments: [{ id: "f1", fileName: "invoice-april.pdf" }],
    actions: [
      { id: "act-1", label: "View Invoice" },
      { id: "act-2", label: "Manage Plan" },
    ],
  },
  {
    id: "notif-2",
    title: "Campaign performance report is ready",
    subtitle: "Marketing analytics",
    body: "Your weekly campaign performance summary is now available with updated customer engagement insights.",
    timestamp: "2026-04-28T08:40:00.000Z",
    isRead: false,
    avatars: [{ id: "a4", name: "Marketing" }],
    tags: [
      { id: "t4", label: "Campaign" },
      { id: "t5", label: "Weekly Report" },
      { id: "t6", label: "Insights" },
    ],
    imageUrl: "/mock-report-card.svg",
    actions: [{ id: "act-3", label: "Open Report" }],
  },
  {
    id: "notif-3",
    title: "Welcome to DokaAI In-App Notifications",
    body: "This demo uses mock notifications only. Backend delivery and real-time updates will be integrated later.",
    timestamp: "2026-04-27T17:20:00.000Z",
    isRead: true,
    tags: [
      { id: "t7", label: "SDK Demo" },
      { id: "t8", label: "Getting Started" },
    ],
  },
];
