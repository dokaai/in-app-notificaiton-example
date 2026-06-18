"use client";

import { useEffect } from "react";
import { useToast } from "@/features/hooks/useToast";
import { useOptionalInAppSdkClient } from "@/features/providers/InAppSdkHostProvider";
import { useSdkStore } from "@/features/store/useSdkStore";
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/api-feedback";
import {
  getCustomerJwtExpirationTime,
  refreshCustomerJwtIfNeeded,
} from "@/lib/customer-jwt";
import {
  fetchHostNotifications,
  fetchHostUnreadCount,
  buildCustomerDetails,
  mapSdkNotificationToUiItem,
  normalizeIncomingNotification,
  subscribeToInAppMessages,
} from "@/lib/inapp-sdk";

export function InAppSdkBootstrap() {
  const isAuthenticated = useSdkStore((state) => state.isAuthenticated);
  const customerJwtPrivateKey = useSdkStore((state) => state.customerJwtPrivateKey);
  const customerSigningKeyId = useSdkStore((state) => state.customerSigningKeyId);
  const customerUniqueCustomerId = useSdkStore((state) => state.customerUniqueCustomerId);
  const customerWorkspaceId = useSdkStore((state) => state.customerWorkspaceId);
  const customerProductSpaceCode = useSdkStore((state) => state.customerProductSpaceCode);
  const jwtToken = useSdkStore((state) => state.jwtToken);
  const customerDetails = useSdkStore((state) => state.customerDetails);
  const socketSubscriptionNonce = useSdkStore((state) => state.socketSubscriptionNonce);
  const updateJwtToken = useSdkStore((state) => state.updateJwtToken);
  const setCustomerDetails = useSdkStore((state) => state.setCustomerDetails);
  const setNotifications = useSdkStore((state) => state.setNotifications);
  const setUnreadCount = useSdkStore((state) => state.setUnreadCount);
  const upsertNotification = useSdkStore((state) => state.upsertNotification);
  const setNotificationsLoading = useSdkStore((state) => state.setNotificationsLoading);
  const setNotificationsError = useSdkStore((state) => state.setNotificationsError);
  const setSocketStatus = useSdkStore((state) => state.setSocketStatus);
  const client = useOptionalInAppSdkClient();
  const toast = useToast();
  const canBootstrap = Boolean(client && isAuthenticated && customerUniqueCustomerId);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !customerJwtPrivateKey ||
      !customerSigningKeyId ||
      !customerUniqueCustomerId ||
      !customerWorkspaceId ||
      !customerProductSpaceCode ||
      !jwtToken
    ) {
      return;
    }

    let isCancelled = false;
    let refreshTimeoutId: number | null = null;

    async function syncJwtToken(currentToken: string) {
      try {
        const result = await refreshCustomerJwtIfNeeded({
          currentToken,
          privateKey: customerJwtPrivateKey,
          signingKeyId: customerSigningKeyId,
          uniqueCustomerId: customerUniqueCustomerId,
          workspaceId: customerWorkspaceId,
          productSpaceCode: customerProductSpaceCode,
        });

        if (isCancelled) {
          return;
        }

        const nextToken = result.jwtToken;

        if (result.refreshed && nextToken !== currentToken) {
          updateJwtToken(nextToken);
        }

        const expirationTime =
          result.expirationTime ?? getCustomerJwtExpirationTime(nextToken);
        const refreshDelay = expirationTime
          ? Math.max(expirationTime - Date.now() - 60 * 1000, 5 * 1000)
          : 14 * 60 * 1000;

        refreshTimeoutId = window.setTimeout(() => {
          void syncJwtToken(nextToken);
        }, refreshDelay);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        toast.error(getApiErrorMessage(error, "Unable to refresh the customer bearer token."));
        refreshTimeoutId = window.setTimeout(() => {
          void syncJwtToken(currentToken);
        }, 30 * 1000);
      }
    }

    void syncJwtToken(jwtToken);

    return () => {
      isCancelled = true;

      if (refreshTimeoutId !== null) {
        window.clearTimeout(refreshTimeoutId);
      }
    };
  }, [
    customerJwtPrivateKey,
    customerProductSpaceCode,
    customerSigningKeyId,
    customerUniqueCustomerId,
    customerWorkspaceId,
    isAuthenticated,
    jwtToken,
    toast,
    updateJwtToken,
  ]);

  useEffect(() => {
    if (!canBootstrap || !client) {
      return;
    }

    let isCancelled = false;

    async function bootstrapSdkData() {
      const sdkClient = client;

      if (!sdkClient) {
        return;
      }

      setNotificationsLoading(true);
      setNotificationsError(null);

      try {
        const resolvedCustomerDetails =
          customerDetails ?? buildCustomerDetails(customerUniqueCustomerId);
        const [response, unreadCount] = await Promise.all([
          fetchHostNotifications(sdkClient),
          fetchHostUnreadCount(sdkClient),
        ]);

        if (isCancelled) {
          return;
        }

        if (!customerDetails) {
          setCustomerDetails(resolvedCustomerDetails);
        }

        setNotifications(response.notifications.map(mapSdkNotificationToUiItem));
        setUnreadCount(unreadCount);
        toast.success(
          getApiSuccessMessage(response, "All In App Notification fetched successfully")
        );
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setNotificationsError("Unable to load SDK data.");
        toast.error(getApiErrorMessage(error, "Unable to load SDK data."));
      } finally {
        if (!isCancelled) {
          setNotificationsLoading(false);
        }
      }
    }

    void bootstrapSdkData();

    return () => {
      isCancelled = true;
    };
  }, [
    canBootstrap,
    client,
    customerDetails,
    customerUniqueCustomerId,
    isAuthenticated,
    jwtToken,
    setCustomerDetails,
    setNotifications,
    setUnreadCount,
    setNotificationsError,
    setNotificationsLoading,
  ]);

  useEffect(() => {
    if (!canBootstrap || !client) {
      return;
    }

    return subscribeToInAppMessages(
      {
        customerUniqueCustomerId,
        jwtToken,
      },
      (payload) => {
        const incoming = normalizeIncomingNotification(payload);

        if (incoming) {
          upsertNotification(mapSdkNotificationToUiItem(incoming));
        }
      },
      setSocketStatus
    );
  }, [
    canBootstrap,
    client,
    customerUniqueCustomerId,
    jwtToken,
    setSocketStatus,
    socketSubscriptionNonce,
    upsertNotification,
  ]);

  return null;
}
