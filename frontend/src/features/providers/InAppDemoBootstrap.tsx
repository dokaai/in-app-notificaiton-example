"use client";

import { useEffect } from "react";
import { useToast } from "@/features/hooks/useToast";
import { useDemoStore } from "@/features/store/useDemoStore";
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/api-feedback";
import { requestCustomerJwt } from "@/lib/auth-api";
import { buildCustomerDetails } from "@/lib/customer";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
} from "@/lib/notifications-api";
import {
  mapNotificationToUiItem,
  normalizeIncomingNotification,
} from "@/lib/notification-mappers";
import {
  subscribeToInAppMessages,
} from "@/lib/socket-client";

const CUSTOMER_TOKEN_REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const CUSTOMER_TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000;

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;

  return window.atob(`${normalized}${"=".repeat(paddingLength)}`);
}

function getJwtExpirationTime(jwtToken: string) {
  const [, payload] = jwtToken.split(".");

  if (!payload) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown };
    return typeof parsedPayload.exp === "number" ? parsedPayload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function shouldRefreshJwt(jwtToken: string) {
  const expirationTime = getJwtExpirationTime(jwtToken);

  if (!expirationTime) {
    return true;
  }

  return expirationTime - Date.now() <= CUSTOMER_TOKEN_REFRESH_BUFFER_MS;
}

export function InAppDemoBootstrap() {
  const isAuthenticated = useDemoStore((state) => state.isAuthenticated);
  const customerJwtPrivateKey = useDemoStore((state) => state.customerJwtPrivateKey);
  const customerSigningKeyId = useDemoStore((state) => state.customerSigningKeyId);
  const customerUniqueCustomerId = useDemoStore((state) => state.customerUniqueCustomerId);
  const customerWorkspaceId = useDemoStore((state) => state.customerWorkspaceId);
  const customerProductSpaceCode = useDemoStore((state) => state.customerProductSpaceCode);
  const jwtToken = useDemoStore((state) => state.jwtToken);
  const customerDetails = useDemoStore((state) => state.customerDetails);
  const socketSubscriptionNonce = useDemoStore((state) => state.socketSubscriptionNonce);
  const updateJwtToken = useDemoStore((state) => state.updateJwtToken);
  const setCustomerDetails = useDemoStore((state) => state.setCustomerDetails);
  const setNotifications = useDemoStore((state) => state.setNotifications);
  const setUnreadCount = useDemoStore((state) => state.setUnreadCount);
  const upsertNotification = useDemoStore((state) => state.upsertNotification);
  const setNotificationsLoading = useDemoStore((state) => state.setNotificationsLoading);
  const setNotificationsError = useDemoStore((state) => state.setNotificationsError);
  const setSocketStatus = useDemoStore((state) => state.setSocketStatus);
  const toast = useToast();
  const canBootstrap = Boolean(isAuthenticated && customerUniqueCustomerId && jwtToken);
  const hasTokenGenerationValues = Boolean(customerJwtPrivateKey && customerSigningKeyId);
  const shouldWaitForFreshToken = Boolean(
    jwtToken && hasTokenGenerationValues && shouldRefreshJwt(jwtToken)
  );

  useEffect(() => {
    if (
      !isAuthenticated ||
      !customerJwtPrivateKey ||
      !customerSigningKeyId ||
      !customerUniqueCustomerId ||
      !customerWorkspaceId ||
      !customerProductSpaceCode
    ) {
      return;
    }

    let isCancelled = false;

    async function remintCustomerToken() {
      try {
        const response = await requestCustomerJwt({
          privateKey: customerJwtPrivateKey,
          signingKeyId: customerSigningKeyId,
          uniqueCustomerId: customerUniqueCustomerId,
          workspaceId: customerWorkspaceId,
          productSpaceCode: customerProductSpaceCode,
          expiresIn: "15m",
        });

        if (isCancelled) {
          return;
        }

        updateJwtToken(response.jwtToken);
      } catch (error) {
        if (!isCancelled) {
          toast.error(getApiErrorMessage(error, "Unable to refresh the customer token."));
        }
      }
    }

    void remintCustomerToken();

    const refreshIntervalId = window.setInterval(() => {
      void remintCustomerToken();
    }, CUSTOMER_TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(refreshIntervalId);
    };
  }, [
    customerJwtPrivateKey,
    customerProductSpaceCode,
    customerSigningKeyId,
    customerUniqueCustomerId,
    customerWorkspaceId,
    isAuthenticated,
    toast,
    updateJwtToken,
  ]);

  useEffect(() => {
    if (!canBootstrap || shouldWaitForFreshToken) {
      return;
    }

    let isCancelled = false;

    async function bootstrapDemoData() {
      setNotificationsLoading(true);
      setNotificationsError(null);

      try {
        const resolvedCustomerDetails =
          customerDetails ?? buildCustomerDetails(customerUniqueCustomerId);
        const [response, unreadCount] = await Promise.all([
          fetchNotifications(jwtToken),
          fetchUnreadNotificationCount(jwtToken),
        ]);

        if (isCancelled) {
          return;
        }

        if (!customerDetails) {
          setCustomerDetails(resolvedCustomerDetails);
        }

        setNotifications(response.notifications.map(mapNotificationToUiItem));
        setUnreadCount(unreadCount);
        toast.success(
          getApiSuccessMessage(response, "All In App Notification fetched successfully")
        );
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setNotificationsError("Unable to load notification data.");
        toast.error(getApiErrorMessage(error, "Unable to load notification data."));
      } finally {
        if (!isCancelled) {
          setNotificationsLoading(false);
        }
      }
    }

    void bootstrapDemoData();

    return () => {
      isCancelled = true;
    };
  }, [
    canBootstrap,
    customerDetails,
    customerUniqueCustomerId,
    isAuthenticated,
    jwtToken,
    setCustomerDetails,
    setNotifications,
    setUnreadCount,
    setNotificationsError,
    setNotificationsLoading,
    shouldWaitForFreshToken,
  ]);

  useEffect(() => {
    if (!canBootstrap) {
      return;
    }

    return subscribeToInAppMessages(
      {
        customerUniqueCustomerId,
        jwtToken,
      },
      (payload) => {
        console.log("[InApp socket] raw notification payload", payload);
        const incoming = normalizeIncomingNotification(payload);

        if (incoming) {
          const notificationItem = mapNotificationToUiItem(incoming);
          console.log("[InApp socket] mapped notification id", notificationItem.id);
          upsertNotification(notificationItem);
        }
      },
      setSocketStatus
    );
  }, [
    canBootstrap,
    customerUniqueCustomerId,
    jwtToken,
    setSocketStatus,
    socketSubscriptionNonce,
    upsertNotification,
  ]);

  return null;
}
