"use client";

import { useEffect } from "react";
import { useToast } from "@/features/hooks/useToast";
import { useDemoStore } from "@/features/store/useDemoStore";
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/api-feedback";
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

export function InAppDemoBootstrap() {
  const isAuthenticated = useDemoStore((state) => state.isAuthenticated);
  const customerUniqueCustomerId = useDemoStore((state) => state.customerUniqueCustomerId);
  const jwtToken = useDemoStore((state) => state.jwtToken);
  const customerDetails = useDemoStore((state) => state.customerDetails);
  const socketSubscriptionNonce = useDemoStore((state) => state.socketSubscriptionNonce);
  const setCustomerDetails = useDemoStore((state) => state.setCustomerDetails);
  const setNotifications = useDemoStore((state) => state.setNotifications);
  const setUnreadCount = useDemoStore((state) => state.setUnreadCount);
  const upsertNotification = useDemoStore((state) => state.upsertNotification);
  const setNotificationsLoading = useDemoStore((state) => state.setNotificationsLoading);
  const setNotificationsError = useDemoStore((state) => state.setNotificationsError);
  const setSocketStatus = useDemoStore((state) => state.setSocketStatus);
  const toast = useToast();
  const canBootstrap = Boolean(isAuthenticated && customerUniqueCustomerId && jwtToken);

  useEffect(() => {
    if (!canBootstrap) {
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
        const incoming = normalizeIncomingNotification(payload);

        if (incoming) {
          upsertNotification(mapNotificationToUiItem(incoming));
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
