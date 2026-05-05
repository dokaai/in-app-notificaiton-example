const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_NUDGE_SERVICE_API_URL",
  "NEXT_PUBLIC_CUSTOMER_SERVICE_API_URL",
  "NEXT_PUBLIC_WSS_SERVICE_API_URL",
] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

const PUBLIC_ENV_VALUES: Record<RequiredEnvKey, string | undefined> = {
  NEXT_PUBLIC_NUDGE_SERVICE_API_URL:
    process.env.NEXT_PUBLIC_NUDGE_SERVICE_API_URL,
  NEXT_PUBLIC_CUSTOMER_SERVICE_API_URL:
    process.env.NEXT_PUBLIC_CUSTOMER_SERVICE_API_URL,
  NEXT_PUBLIC_WSS_SERVICE_API_URL:
    process.env.NEXT_PUBLIC_WSS_SERVICE_API_URL,
};

function readRequiredEnv(key: RequiredEnvKey) {
  const value = PUBLIC_ENV_VALUES[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getHostAppEnv() {
  return {
    inAppNotificationsApiUrl: readRequiredEnv("NEXT_PUBLIC_NUDGE_SERVICE_API_URL"),
    projectScopeApiUrl: readRequiredEnv("NEXT_PUBLIC_CUSTOMER_SERVICE_API_URL"),
    inAppSocketUrl: readRequiredEnv("NEXT_PUBLIC_WSS_SERVICE_API_URL"),
  };
}

export type HostAppEnv = ReturnType<typeof getHostAppEnv>;
