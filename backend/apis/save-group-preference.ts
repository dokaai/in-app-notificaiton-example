import type { SaveGroupPreferenceBody } from "../types";
import { readBearerTokenFromHeaders } from "../lib/bearer-token";
import { requestNudgeApi } from "../lib/http-client";
import { jsonError } from "../lib/respond";

export function saveGroupPreference(
  jwtToken: string,
  groupId: string,
  body: SaveGroupPreferenceBody
) {
  return requestNudgeApi(
    `/nudge/customer-preferences/notification-groups/${encodeURIComponent(groupId)}`,
    jwtToken,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

export async function POST(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const jwtToken = readBearerTokenFromHeaders(request.headers);
    const body = await request.json();
    const data = await saveGroupPreference(jwtToken, params.groupId, body);

    return Response.json(data);
  } catch (error) {
    return jsonError(error, "Unable to save notification group preference.");
  }
}
