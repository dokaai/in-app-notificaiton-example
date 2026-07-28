import { readBearerTokenFromHeaders } from "../lib/bearer-token";
import { requestNudgeApi } from "../lib/http-client";
import { jsonError } from "../lib/respond";

export function markAllInAppNotificationsAsRead(jwtToken: string) {
  return requestNudgeApi("/nudge/in-app-notifications/read-all", jwtToken, {
    method: "PUT",
    body: JSON.stringify({}),
  });
}

export async function PUT(request: Request) {
  try {
    const jwtToken = readBearerTokenFromHeaders(request.headers);
    const data = await markAllInAppNotificationsAsRead(jwtToken);

    return Response.json(data);
  } catch (error) {
    return jsonError(error, "Unable to mark notifications as read.");
  }
}
