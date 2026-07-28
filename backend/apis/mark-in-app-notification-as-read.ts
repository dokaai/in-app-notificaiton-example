import { readBearerTokenFromHeaders } from "../lib/bearer-token";
import { requestNudgeApi } from "../lib/http-client";
import { jsonError } from "../lib/respond";

export function markInAppNotificationAsRead(
  jwtToken: string,
  notificationId: string
) {
  return requestNudgeApi(
    `/nudge/in-app-notifications/${encodeURIComponent(notificationId)}/read`,
    jwtToken,
    {
      method: "PUT",
    }
  );
}

export async function PUT(
  request: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const jwtToken = readBearerTokenFromHeaders(request.headers);
    const data = await markInAppNotificationAsRead(
      jwtToken,
      params.notificationId
    );

    return Response.json(data);
  } catch (error) {
    return jsonError(error, "Unable to mark notification as read.");
  }
}
