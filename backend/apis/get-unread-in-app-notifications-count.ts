import { readBearerTokenFromHeaders } from "../lib/bearer-token";
import { requestNudgeApi } from "../lib/http-client";
import { jsonError } from "../lib/respond";

interface UnreadCountApiEnvelope {
  data?: number | { count?: number; unreadCount?: number };
  count?: number;
  unreadCount?: number;
  [key: string]: unknown;
}

export async function getUnreadInAppNotificationsCount(jwtToken: string) {
  const response = await requestNudgeApi<unknown>(
    "/nudge/in-app-notifications/unread-count",
    jwtToken
  );

  if (typeof response === "number") {
    return { unreadCount: response };
  }

  const envelope = response as UnreadCountApiEnvelope;

  if (typeof envelope.data === "number") {
    return { unreadCount: envelope.data };
  }

  if (envelope.data && typeof envelope.data === "object") {
    if (typeof envelope.data.unreadCount === "number") {
      return { unreadCount: envelope.data.unreadCount };
    }

    if (typeof envelope.data.count === "number") {
      return { unreadCount: envelope.data.count };
    }
  }

  if (typeof envelope.unreadCount === "number") {
    return { unreadCount: envelope.unreadCount };
  }

  if (typeof envelope.count === "number") {
    return { unreadCount: envelope.count };
  }

  return { unreadCount: 0 };
}

export async function GET(request: Request) {
  try {
    const jwtToken = readBearerTokenFromHeaders(request.headers);
    const data = await getUnreadInAppNotificationsCount(jwtToken);

    return Response.json(data);
  } catch (error) {
    return jsonError(error, "Unable to fetch unread notification count.");
  }
}
