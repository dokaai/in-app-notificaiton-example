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
import { useSdkStore } from "@/features/store/useSdkStore";
import { useInAppSdkClient } from "@/features/providers/InAppSdkHostProvider";
import {
  fetchHostNotifications,
  mapSdkNotificationToUiItem,
} from "@/lib/inapp-sdk";
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/api-feedback";

export function NotificationsDashboardPage() {
  const client = useInAppSdkClient();
  const toast = useToast();
  const customerId = useSdkStore((state) => state.customerId);
  const notifications = useSdkStore((state) => state.notifications);
  const notificationsLoading = useSdkStore((state) => state.notificationsLoading);
  const notificationsError = useSdkStore((state) => state.notificationsError);
  const markAllAsRead = useSdkStore((state) => state.markAllAsRead);
  const markNotificationAsRead = useSdkStore((state) => state.markNotificationAsRead);
  const setNotifications = useSdkStore((state) => state.setNotifications);
  const setNotificationsLoading = useSdkStore((state) => state.setNotificationsLoading);
  const setNotificationsError = useSdkStore((state) => state.setNotificationsError);
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
    if (!customerId) {
      return;
    }

    const nextPage = options?.nextPage ?? page;
    const nextSize = options?.nextSize ?? size;
    const nextFilter = options?.nextFilter ?? filter;

    setNotificationsLoading(true);
    setNotificationsError(null);

    try {
      const response = await fetchHostNotifications(
        client,
        customerId,
        {
          page: nextPage,
          size: nextSize,
          isRead:
            nextFilter === "all"
              ? undefined
              : nextFilter === "read",
        }
      );
      setNotifications(response.notifications.map(mapSdkNotificationToUiItem));
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
    if (!customerId) {
      return;
    }

    if (!hasMountedRef.current && notifications.length > 0 && page === 1 && size === 10 && filter === "all") {
      hasMountedRef.current = true;
      return;
    }

    hasMountedRef.current = true;
    void handleRefresh();
  }, [customerId, filter, page, size]);

  async function handleMarkNotificationAsRead(notificationId: string) {
    if (!customerId) {
      return;
    }

    try {
      const response = await client.notifications.markAsRead({
        notificationId,
        customerId,
      });
      markNotificationAsRead(notificationId);
      toast.success(getApiSuccessMessage(response, "Notification marked as read."));
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to mark notification as read.");
      setNotificationsError(message);
      toast.error(message);
    }
  }

  async function handleMarkAllAsRead() {
    if (!customerId) {
      return;
    }

    try {
      const response = await client.notifications.markAllAsRead({
        customerId,
      });
      markAllAsRead();
      toast.success(getApiSuccessMessage(response, "All notifications marked as read."));
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to mark all notifications as read.");
      setNotificationsError(message);
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <PageHeader
          title="Notifications Dashboard"
          description="Track the DokaAI in-app notification experience through the host app and SDK integration layer."
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

      <NotificationListWrapper
        isLoading={notificationsLoading}
        notifications={notifications}
        onMarkAsRead={(notificationId) => void handleMarkNotificationAsRead(notificationId)}
      />
    </div>
  );
}
