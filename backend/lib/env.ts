export function getNudgeServiceBaseUrl() {
  const baseUrl = process.env.NUDGE_SERVICE_API_URL;

  if (!baseUrl) {
    throw new Error("Missing required environment variable: NUDGE_SERVICE_API_URL");
  }

  return baseUrl.replace(/\/$/, "");
}
