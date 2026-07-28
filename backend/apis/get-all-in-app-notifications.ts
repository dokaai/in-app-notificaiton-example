import type { GetAllInAppNotificationsParams, InAppNotification } from "../types";
import { readBearerTokenFromHeaders } from "../lib/bearer-token";
import { requestNudgeApi } from "../lib/http-client";
import { jsonError } from "../lib/respond";

interface NotificationsApiEnvelope {
  data?: InAppNotification[] | { notifications?: InAppNotification[]; items?: InAppNotification[] };
  notifications?: InAppNotification[];
  items?: InAppNotification[];
  metaData?: {
    page?: number;
    hasMore?: boolean;
    pageSize?: number;
    count?: number;
  } | null;
  message?: string;
  [key: string]: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pickNotifications(response: unknown): InAppNotification[] {
  if (Array.isArray(response)) {
    return response;
  }

  const envelope = response as NotificationsApiEnvelope;

  if (Array.isArray(envelope.data)) {
    return envelope.data;
  }

  if (Array.isArray(envelope.notifications)) {
    return envelope.notifications;
  }

  if (Array.isArray(envelope.items)) {
    return envelope.items;
  }

  if (isRecord(envelope.data)) {
    if (Array.isArray(envelope.data.notifications)) {
      return envelope.data.notifications as InAppNotification[];
    }

    if (Array.isArray(envelope.data.items)) {
      return envelope.data.items as InAppNotification[];
    }
  }

  return [];
}

export async function getAllInAppNotifications(
  jwtToken: string,
  { page = 1, size = 10, isRead }: GetAllInAppNotificationsParams
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (typeof isRead === "boolean") {
    params.set("isRead", String(isRead));
  }

  const response = await requestNudgeApi<unknown>(
    `/nudge/in-app-notifications/?${params.toString()}`,
    jwtToken
  );
  const envelope = response as NotificationsApiEnvelope;
  const notifications = pickNotifications(response);

  return {
    notifications,
    message:
      typeof envelope.message === "string"
        ? envelope.message
        : "All In App Notification fetched successfully",
    metaData: {
      page: envelope.metaData?.page ?? page,
      hasMore: Boolean(envelope.metaData?.hasMore),
      pageSize: envelope.metaData?.pageSize ?? size,
      count: envelope.metaData?.count ?? notifications.length,
    },
  };
}

export async function GET(request: Request) {
  try {
    const jwtToken = readBearerTokenFromHeaders(request.headers);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const size = Number(url.searchParams.get("size") ?? 10);
    const isReadParam = url.searchParams.get("isRead");
    const isRead =
      isReadParam === null ? undefined : isReadParam.toLowerCase() === "true";
    const data = await getAllInAppNotifications(jwtToken, {
      page: Number.isFinite(page) ? page : 1,
      size: Number.isFinite(size) ? size : 10,
      isRead,
    });

    return Response.json(data);
  } catch (error) {
    return jsonError(error, "Unable to fetch notifications.");
  }
}
