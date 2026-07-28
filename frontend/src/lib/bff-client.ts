"use client";

export class FrontendBffError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "FrontendBffError";
    this.status = status;
    this.data = data;
  }
}

async function parseBffResponse(response: Response) {
  return response.json().catch(() => null);
}

export async function requestBff<T>(
  url: string,
  options: RequestInit & { jwtToken?: string } = {}
) {
  const { jwtToken, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (jwtToken) {
    requestHeaders.set("Authorization", `Bearer ${jwtToken}`);
  }

  if (init.body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers: requestHeaders,
  });
  const data = await parseBffResponse(response);

  if (!response.ok) {
    throw new FrontendBffError(
      `Request failed with status ${response.status}`,
      response.status,
      data
    );
  }

  return data as T;
}
