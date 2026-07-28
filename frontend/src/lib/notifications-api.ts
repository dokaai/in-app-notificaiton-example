"use client";

import type { InAppNotification } from "@backend/types";
import { requestBff } from "@/lib/bff-client";

export interface NotificationsResponse {
  notifications: InAppNotification[];
  message?: string;
  metaData: {
    page: number;
    hasMore: boolean;
    pageSize: number;
    count: number;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export async function fetchNotifications(
  jwtToken: string,
  options: {
    page?: number;
    size?: number;
    isRead?: boolean;
  } = {}
) {
  const params = new URLSearchParams({
    page: String(options.page ?? 1),
    size: String(options.size ?? 10),
  });

  if (typeof options.isRead === "boolean") {
    params.set("isRead", String(options.isRead));
  }

  return requestBff<NotificationsResponse>(`/api/notifications?${params.toString()}`, {
    jwtToken,
  });
}

export async function fetchUnreadNotificationCount(jwtToken: string) {
  const response = await requestBff<UnreadCountResponse>(
    "/api/notifications/unread-count",
    {
      jwtToken,
    }
  );

  return response.unreadCount;
}

export function markNotificationAsRead(
  jwtToken: string,
  notificationId: string
) {
  return requestBff<unknown>(
    `/api/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "PUT",
      jwtToken,
    }
  );
}

export function markAllNotificationsAsRead(jwtToken: string) {
  return requestBff<unknown>("/api/notifications/read-all", {
    method: "PUT",
    jwtToken,
  });
}
