import type { CustomerPreferenceGroup } from "../types";
import { readBearerTokenFromHeaders } from "../lib/bearer-token";
import { requestNudgeApi } from "../lib/http-client";
import { jsonError } from "../lib/respond";

interface CustomerPreferencesApiEnvelope {
  data?: CustomerPreferenceGroup[];
  message?: string;
  [key: string]: unknown;
}

export async function getCustomerPreferences(jwtToken: string) {
  const response = await requestNudgeApi<unknown>(
    "/nudge/customer-preferences/",
    jwtToken
  );

  if (Array.isArray(response)) {
    return {
      preferences: response as CustomerPreferenceGroup[],
      message: "Customer preferences fetched successfully",
    };
  }

  const envelope = response as CustomerPreferencesApiEnvelope;

  return {
    preferences: Array.isArray(envelope.data) ? envelope.data : [],
    message:
      typeof envelope.message === "string"
        ? envelope.message
        : "Customer preferences fetched successfully",
  };
}

export async function GET(request: Request) {
  try {
    const jwtToken = readBearerTokenFromHeaders(request.headers);
    const data = await getCustomerPreferences(jwtToken);

    return Response.json(data);
  } catch (error) {
    return jsonError(error, "Unable to fetch customer preferences.");
  }
}
