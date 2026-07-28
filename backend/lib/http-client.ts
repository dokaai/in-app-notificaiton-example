import { BffApiError } from "./api-error";
import { getNudgeServiceBaseUrl } from "./env";

async function parseResponse(response: Response) {
  return response.json().catch(() => null);
}

export async function requestNudgeApi<T>(
  path: string,
  jwtToken: string,
  init: RequestInit = {}
) {
  const response = await fetch(`${getNudgeServiceBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    throw new BffApiError(
      `Request failed with status ${response.status}`,
      response.status,
      data
    );
  }

  return data as T;
}
