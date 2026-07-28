"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  NotificationActions,
  NotificationReadFilter,
} from "@/features/components/notifications/NotificationActions";
import { NotificationListWrapper } from "@/features/components/notifications/NotificationListWrapper";
import { PageHeader } from "@/features/components/shared/PageHeader";
import { useToast } from "@/features/hooks/useToast";
import { useDemoStore } from "@/features/store/useDemoStore";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead as markNotificationAsReadOnServer,
} from "@/lib/notifications-api";
import { mapNotificationToUiItem } from "@/lib/notification-mappers";
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/api-feedback";

export function NotificationsDashboardPage() {
  const toast = useToast();
  const jwtToken = useDemoStore((state) => state.jwtToken);
  const notifications = useDemoStore((state) => state.notifications);
  const notificationsLoading = useDemoStore((state) => state.notificationsLoading);
  const notificationsError = useDemoStore((state) => state.notificationsError);
  const markAllAsRead = useDemoStore((state) => state.markAllAsRead);
  const markNotificationAsRead = useDemoStore((state) => state.markNotificationAsRead);
  const setNotifications = useDemoStore((state) => state.setNotifications);
  const setNotificationsLoading = useDemoStore((state) => state.setNotificationsLoading);
  const setNotificationsError = useDemoStore((state) => state.setNotificationsError);
  const [filter, setFilter] = useState<NotificationReadFilter>("all");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const hasMountedRef = useRef(false);

  async function handleRefresh(options?: {
    nextPage?: number;
    nextSize?: number;
    nextFilter?: NotificationReadFilter;
    shouldToast?: boolean;
  }) {
    const nextPage = options?.nextPage ?? page;
    const nextSize = options?.nextSize ?? size;
    const nextFilter = options?.nextFilter ?? filter;

    setNotificationsLoading(true);
    setNotificationsError(null);

    try {
      const response = await fetchNotifications(jwtToken, {
        page: nextPage,
        size: nextSize,
        isRead:
          nextFilter === "all"
            ? undefined
            : nextFilter === "read",
      });
      setNotifications(response.notifications.map(mapNotificationToUiItem));
      setHasMore(Boolean(response.metaData?.hasMore));
      setPage(response.metaData?.page ?? nextPage);
      setSize(response.metaData?.pageSize ?? nextSize);
      setTotalCount(response.metaData?.count ?? response.notifications.length);

      if (options?.shouldToast) {
        toast.success(
          getApiSuccessMessage(response, "All In App Notification fetched successfully")
        );
      }
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to refresh notifications.");
      setNotificationsError(message);
      toast.error(message);
    } finally {
      setNotificationsLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / size));

  useEffect(() => {
    if (!hasMountedRef.current && notifications.length > 0 && page === 1 && size === 10 && filter === "all") {
      hasMountedRef.current = true;
      return;
    }

    hasMountedRef.current = true;
    void handleRefresh();
  }, [filter, page, size]);

  async function handleMarkNotificationAsRead(notificationId: string) {
    try {
      const response = await markNotificationAsReadOnServer(jwtToken, notificationId);
      markNotificationAsRead(notificationId);
      toast.success(getApiSuccessMessage(response, "Notification marked as read."));
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to mark notification as read.");
      setNotificationsError(message);
      toast.error(message);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      const response = await markAllNotificationsAsRead(jwtToken);
      markAllAsRead();
      toast.success(getApiSuccessMessage(response, "All notifications marked as read."));
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to mark all notifications as read.");
      setNotificationsError(message);
      toast.error(message);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
      <div className="shrink-0">
        <PageHeader
          title="Notifications Dashboard"
          description="Track the DokaAI in-app notification experience through the frontend and BFF integration layer."
          actions={
            <NotificationActions
              filter={filter}
              page={page}
              size={size}
              hasMore={hasMore}
              totalPages={totalPages}
              onFilterChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
              onNextPage={() => setPage((current) => current + 1)}
              onPrevPage={() => setPage((current) => Math.max(1, current - 1))}
              onSizeChange={(value) => {
                setSize(value);
                setPage(1);
              }}
              onMarkAllAsRead={() => void handleMarkAllAsRead()}
            />
          }
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-2 pr-1">
        <NotificationListWrapper
          isLoading={notificationsLoading}
          notifications={notifications}
          onMarkAsRead={(notificationId) => void handleMarkNotificationAsRead(notificationId)}
        />
      </div>
    </div>
  );
}
