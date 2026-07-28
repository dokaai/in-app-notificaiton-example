import type { SaveTopicPreferenceBody } from "../types";
import { readBearerTokenFromHeaders } from "../lib/bearer-token";
import { requestNudgeApi } from "../lib/http-client";
import { jsonError } from "../lib/respond";

export function saveTopicPreference(
  jwtToken: string,
  topicId: string,
  body: SaveTopicPreferenceBody
) {
  return requestNudgeApi(
    `/nudge/customer-preferences/notification-topics/${encodeURIComponent(topicId)}`,
    jwtToken,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

export async function POST(
  request: Request,
  { params }: { params: { topicId: string } }
) {
  try {
    const jwtToken = readBearerTokenFromHeaders(request.headers);
    const body = await request.json();
    const data = await saveTopicPreference(jwtToken, params.topicId, body);

    return Response.json(data);
  } catch (error) {
    return jsonError(error, "Unable to save notification topic preference.");
  }
}
