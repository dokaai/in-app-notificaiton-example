"use client";

import { createContext, useContext, useMemo } from "react";
import type { InAppNotificationSdkClient } from "@sdk/client";
import { useSdkStore } from "@/features/store/useSdkStore";
import { InAppSdkBootstrap } from "@/features/providers/InAppSdkBootstrap";
import { createHostInAppSdkClient } from "@/lib/inapp-sdk";

const InAppSdkClientContext = createContext<InAppNotificationSdkClient | null>(null);

export function InAppSdkHostProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useSdkStore((state) => state.isAuthenticated);
  const customerUniqueCustomerId = useSdkStore((state) => state.customerUniqueCustomerId);
  const jwtToken = useSdkStore((state) => state.jwtToken);

  const client = useMemo(
    () => {
      if (
        !isAuthenticated ||
        !customerUniqueCustomerId ||
        !jwtToken
      ) {
        return null;
      }

      return createHostInAppSdkClient({
        customerUniqueCustomerId,
        jwtToken,
      });
    },
    [
      customerUniqueCustomerId,
      isAuthenticated,
      jwtToken,
    ]
  );

  return (
    <InAppSdkClientContext.Provider value={client}>
      <InAppSdkBootstrap />
      {children}
    </InAppSdkClientContext.Provider>
  );
}

export function useInAppSdkClient() {
  const client = useContext(InAppSdkClientContext);

  if (!client) {
    throw new Error("In-app SDK client is not initialized yet.");
  }

  return client;
}

export function useOptionalInAppSdkClient() {
  return useContext(InAppSdkClientContext);
}
