"use client";

import type {
  CustomerPreferenceGroup,
  SaveGroupPreferenceBody,
  SaveTopicPreferenceBody,
} from "@backend/types";
import { requestBff } from "@/lib/bff-client";

export interface PreferencesResponse {
  preferences: CustomerPreferenceGroup[];
  message?: string;
}

export function fetchPreferences(
  jwtToken: string,
  projectId?: string
) {
  const params = new URLSearchParams();

  if (projectId) {
    params.set("projectId", projectId);
  }

  return requestBff<PreferencesResponse>(
    `/api/preferences${params.toString() ? `?${params.toString()}` : ""}`,
    {
      jwtToken,
    }
  );
}

export function saveGroupPreference(
  jwtToken: string,
  groupId: string,
  body: SaveGroupPreferenceBody
) {
  return requestBff<unknown>(
    `/api/preferences/groups/${encodeURIComponent(groupId)}`,
    {
      method: "POST",
      jwtToken,
      body: JSON.stringify(body),
    }
  );
}

export function saveTopicPreference(
  jwtToken: string,
  topicId: string,
  body: SaveTopicPreferenceBody
) {
  return requestBff<unknown>(
    `/api/preferences/topics/${encodeURIComponent(topicId)}`,
    {
      method: "POST",
      jwtToken,
      body: JSON.stringify(body),
    }
  );
}
