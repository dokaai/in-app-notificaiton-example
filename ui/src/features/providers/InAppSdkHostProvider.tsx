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
  const projectId = useSdkStore((state) => state.projectId);
  const orgId = useSdkStore((state) => state.orgId);
  const customerPoolId = useSdkStore((state) => state.customerPoolId);
  const customerId = useSdkStore((state) => state.customerId);
  const jwtToken = useSdkStore((state) => state.jwtToken);

  const client = useMemo(
    () => {
      if (
        !isAuthenticated ||
        !projectId ||
        !orgId ||
        !customerPoolId ||
        !customerId ||
        !jwtToken
      ) {
        return null;
      }

      return createHostInAppSdkClient({
        projectId,
        orgId,
        customerPoolId,
        customerId,
        jwtToken,
      });
    },
    [
      customerId,
      customerPoolId,
      isAuthenticated,
      jwtToken,
      orgId,
      projectId,
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
