import { BffApiError } from "./api-error";

export function readBearerTokenFromHeaders(headers: Headers) {
  const authorization = headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new BffApiError("Missing bearer token.", 401, null);
  }

  return authorization.slice("Bearer ".length).trim();
}
