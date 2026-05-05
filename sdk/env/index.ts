import { z } from 'zod';

const publicEnvSchema = {
  NEXT_PUBLIC_INAPP_NOTIFICATIONS_API_URL: z.string().url(),
  NEXT_PUBLIC_PROJECT_SCOPE_API_URL: z.string().url(),
  NEXT_PUBLIC_INAPP_SOCKET_URL: z.string().url(),
} as const;

const serverEnvSchema = {
  INAPP_NOTIFICATIONS_API_URL: z.string().url(),
  PROJECT_SCOPE_API_URL: z.string().url(),
  INAPP_SOCKET_URL: z.string().url(),
} as const;

type PublicEnv = {
  [K in keyof typeof publicEnvSchema]: z.infer<(typeof publicEnvSchema)[K]>;
};

type ServerEnv = {
  [K in keyof typeof serverEnvSchema]: z.infer<(typeof serverEnvSchema)[K]>;
};

type RuntimeEnv = {
  INAPP_NOTIFICATIONS_API_URL: string;
  PROJECT_SCOPE_API_URL: string;
  INAPP_SOCKET_URL: string;
};

const publicEnvCache: Partial<PublicEnv> = {};
const serverEnvCache: Partial<ServerEnv> = {};

const publicEnvValues: { [K in keyof PublicEnv]: string | undefined } = {
  NEXT_PUBLIC_INAPP_NOTIFICATIONS_API_URL:
    process.env.NEXT_PUBLIC_INAPP_NOTIFICATIONS_API_URL,
  NEXT_PUBLIC_PROJECT_SCOPE_API_URL:
    process.env.NEXT_PUBLIC_PROJECT_SCOPE_API_URL,
  NEXT_PUBLIC_INAPP_SOCKET_URL: process.env.NEXT_PUBLIC_INAPP_SOCKET_URL,
};

const getValidatedEnvValue = <
  TSchemaMap extends Record<string, z.ZodTypeAny>,
  TCache extends Partial<{ [K in keyof TSchemaMap]: z.infer<TSchemaMap[K]> }>
>(
  key: keyof TSchemaMap,
  schemaMap: TSchemaMap,
  cache: TCache,
  rawValue: unknown
) => {
  const cacheKey = key as string;

  if (cacheKey in cache) {
    return cache[key];
  }

  const value = schemaMap[key].parse(rawValue);
  cache[key] = value;
  return value;
};

const getServerEnv = (key: keyof typeof serverEnvSchema) =>
  getValidatedEnvValue(key, serverEnvSchema, serverEnvCache, process.env[key]);

const getPublicEnv = (key: keyof typeof publicEnvSchema) =>
  getValidatedEnvValue(key, publicEnvSchema, publicEnvCache, publicEnvValues[key]);

const runtimeEnvResolvers: Record<keyof RuntimeEnv, () => string> = {
  INAPP_NOTIFICATIONS_API_URL: () =>
    process.env.INAPP_NOTIFICATIONS_API_URL
      ? getServerEnv('INAPP_NOTIFICATIONS_API_URL')
      : getPublicEnv('NEXT_PUBLIC_INAPP_NOTIFICATIONS_API_URL'),
  PROJECT_SCOPE_API_URL: () =>
    process.env.PROJECT_SCOPE_API_URL
      ? getServerEnv('PROJECT_SCOPE_API_URL')
      : getPublicEnv('NEXT_PUBLIC_PROJECT_SCOPE_API_URL'),
  INAPP_SOCKET_URL: () =>
    process.env.INAPP_SOCKET_URL
      ? getServerEnv('INAPP_SOCKET_URL')
      : getPublicEnv('NEXT_PUBLIC_INAPP_SOCKET_URL'),
};

export const appEnv = new Proxy({} as RuntimeEnv, {
  get(_target, prop) {
    if (typeof prop !== 'string') {
      return undefined;
    }

    if (prop in runtimeEnvResolvers) {
      const key = prop as keyof RuntimeEnv;
      return runtimeEnvResolvers[key]();
    }

    if (prop in publicEnvSchema) {
      return getPublicEnv(prop as keyof typeof publicEnvSchema);
    }

    if (prop in serverEnvSchema) {
      return getServerEnv(prop as keyof typeof serverEnvSchema);
    }

    return undefined;
  },
});
