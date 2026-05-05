"use client";

import { Activity, AlertCircle, Bell, CheckCircle2, LoaderCircle, RadioTower, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/features/components/shared/PageHeader";
import { useSdkStore } from "@/features/store/useSdkStore";
import { SocketStatus } from "@/features/types/socket.types";
import { cn } from "@/features/utils/cn";

function DashboardMetric({
  title,
  value,
  hint,
  icon: Icon,
  iconWrapperClassName,
}: {
  title: string;
  value: string;
  hint: string;
  icon: typeof Bell;
  iconWrapperClassName?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary",
            iconWrapperClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function getSocketStatusLabel(status: SocketStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getSocketStatusIcon(status: SocketStatus) {
  if (status === "connected") {
    return RadioTower;
  }

  if (status === "connecting") {
    return LoaderCircle;
  }

  if (status === "error") {
    return AlertCircle;
  }

  return WifiOff;
}

function getSocketStatusIconStyles(status: SocketStatus) {
  if (status === "connected") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (status === "connecting") {
    return "bg-amber-50 text-amber-600";
  }

  if (status === "error") {
    return "bg-red-50 text-red-600";
  }

  return "bg-slate-100 text-slate-500";
}

export function DashboardOverviewPage() {
  const notifications = useSdkStore((state) => state.notifications);
  const socketStatus = useSdkStore((state) => state.socketStatus);
  const customerDetails = useSdkStore((state) => state.customerDetails);
  const unreadCount = useSdkStore((state) => state.unreadCount);

  const readCount = notifications.filter((notification) => notification.isRead).length;
  const latestNotification = notifications[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Track notification volume, live connection health, and customer activity from one overview."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric
          title="Total notifications"
          value={String(notifications.length)}
          hint="Loaded in the current session"
          icon={Bell}
        />
        <DashboardMetric
          title="Unread notifications"
          value={String(unreadCount)}
          hint="Notifications still marked unread"
          icon={Activity}
        />
        <DashboardMetric
          title="Read notifications"
          value={String(readCount)}
          hint="Notifications acknowledged in UI"
          icon={CheckCircle2}
        />
        <DashboardMetric
          title="Socket status"
          value={getSocketStatusLabel(socketStatus)}
          hint="Live delivery connection health"
          icon={getSocketStatusIcon(socketStatus)}
          iconWrapperClassName={getSocketStatusIconStyles(socketStatus)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Activity snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Latest notification
              </p>
              <p className="mt-3 text-base font-semibold text-foreground">
                {latestNotification?.title ?? "No notifications yet"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {latestNotification?.body ??
                  "Once notifications start flowing, the newest item will surface here."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <p className="text-sm font-medium text-foreground">Live delivery</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {socketStatus === "connected"
                    ? "Real-time notification delivery is active."
                    : "Live updates are currently not connected."}
                </p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm font-medium text-foreground">Notification health</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {unreadCount > 0
                    ? `${unreadCount} notification${unreadCount === 1 ? "" : "s"} still need attention.`
                    : "All notifications are currently marked as read."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Active customer
              </p>
              <p className="mt-3 text-base font-semibold text-foreground">
                {customerDetails?.name ?? "Loading customer"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {customerDetails?.email ?? "Customer details will appear here after session bootstrap."}
              </p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-sm font-medium text-foreground">What this dashboard will show later</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Delivery trends, read analytics, recent live events, and notification engagement summaries.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
