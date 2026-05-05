"use client";

import { useEffect, useMemo } from "react";
import type { InAppNotification } from "@sdk/shared/types";
import { useToast } from "@/features/hooks/useToast";
import { useOptionalInAppSdkClient } from "@/features/providers/InAppSdkHostProvider";
import { useSdkStore } from "@/features/store/useSdkStore";
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/api-feedback";
import {
  fetchHostCustomerDetails,
  fetchHostNotifications,
  fetchHostUnreadCount,
  getSocketCustomerKeyFromCustomer,
  mapSdkCustomerToCustomerDetails,
  mapSdkNotificationToUiItem,
  normalizeIncomingNotification,
  subscribeToInAppMessages,
} from "@/lib/inapp-sdk";

export function InAppSdkBootstrap() {
  const isAuthenticated = useSdkStore((state) => state.isAuthenticated);
  const projectId = useSdkStore((state) => state.projectId);
  const customerPoolId = useSdkStore((state) => state.customerPoolId);
  const customerId = useSdkStore((state) => state.customerId);
  const orgId = useSdkStore((state) => state.orgId);
  const jwtToken = useSdkStore((state) => state.jwtToken);
  const customerDetails = useSdkStore((state) => state.customerDetails);
  const socketSubscriptionNonce = useSdkStore((state) => state.socketSubscriptionNonce);
  const setCustomerDetails = useSdkStore((state) => state.setCustomerDetails);
  const setNotifications = useSdkStore((state) => state.setNotifications);
  const setUnreadCount = useSdkStore((state) => state.setUnreadCount);
  const upsertNotification = useSdkStore((state) => state.upsertNotification);
  const setNotificationsLoading = useSdkStore((state) => state.setNotificationsLoading);
  const setNotificationsError = useSdkStore((state) => state.setNotificationsError);
  const setSocketStatus = useSdkStore((state) => state.setSocketStatus);
  const client = useOptionalInAppSdkClient();
  const toast = useToast();
  const canBootstrap = Boolean(
    client &&
    isAuthenticated &&
    projectId &&
    customerPoolId &&
    customerId
  );
  const socketCustomerKey = useMemo(() => {
    if (!customerDetails?.id) {
      return customerId || null;
    }

    return customerDetails.id;
  }, [customerDetails?.id, customerId]);

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
        const customer = customerDetails
          ? null
          : await fetchHostCustomerDetails(sdkClient, {
              projectId,
              orgId,
              customerPoolId,
              customerId,
              jwtToken,
            });

        if (isCancelled) {
          return;
        }

        const resolvedCustomerDetails = customer
          ? mapSdkCustomerToCustomerDetails(customer)
          : customerDetails;

        if (customer) {
          setCustomerDetails(resolvedCustomerDetails);
          toast.success(getApiSuccessMessage(customer, "Customer details fetched successfully."));
        }

        const socketCustomerKey = customer
          ? getSocketCustomerKeyFromCustomer(customer)
          : resolvedCustomerDetails?.id;
        const [response, unreadCount] = await Promise.all([
          fetchHostNotifications(sdkClient, customerId),
          fetchHostUnreadCount(sdkClient, customerId),
        ]);

        if (isCancelled) {
          return;
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
    customerId,
    customerDetails,
    customerPoolId,
    isAuthenticated,
    jwtToken,
    orgId,
    projectId,
    setCustomerDetails,
    setNotifications,
    setUnreadCount,
    upsertNotification,
    setSocketStatus,
    setNotificationsError,
    setNotificationsLoading,
  ]);

  useEffect(() => {
    if (!canBootstrap || !client || !socketCustomerKey) {
      return;
    }

    return subscribeToInAppMessages(
      {
        projectId,
        orgId,
        customerPoolId,
        customerId,
        jwtToken,
        socketCustomerKey,
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
    customerId,
    customerPoolId,
    jwtToken,
    orgId,
    projectId,
    setSocketStatus,
    socketCustomerKey,
    socketSubscriptionNonce,
    upsertNotification,
  ]);

  return null;
}
