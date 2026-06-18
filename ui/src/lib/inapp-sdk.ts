"use client";

import { io, Socket } from "socket.io-client";
import {
  createHttpInAppNotificationTransport,
  createInAppNotificationSdkClient,
  InAppNotificationSdkClient,
} from "@sdk/client";
import type {
  CustomerPreferenceGroup,
  PreferenceChannelKey,
  InAppNotification,
} from "@sdk/shared/types";
import type { SocketStatus } from "@/features/types/socket.types";
import type { CustomerDetails } from "@/features/types/auth.types";
import type { InAppNotificationItem } from "@/features/types/notification.types";
import type {
  PreferenceChannelState,
  PreferenceGroup as UiPreferenceGroup,
  PreferenceTopic as UiPreferenceTopic,
} from "@/features/types/preference.types";
import { getHostAppEnv } from "@/config/host-env";

export interface HostSdkAuthConfig {
  customerUniqueCustomerId: string;
  jwtToken: string;
}

export interface HostSdkRuntimeConfig {
  inAppNotificationsApiUrl: string;
  inAppSocketUrl: string;
}

interface SocketBridgeResponse {
  success: boolean;
  message?: string;
}

interface SocketEnvelope<TPayload = unknown> {
  event?: string;
  data?: TPayload;
  payload?: TPayload;
  [key: string]: unknown;
}

interface NotificationsApiEnvelope {
  data?: InAppNotification[] | { notifications?: InAppNotification[]; items?: InAppNotification[] };
  notifications?: InAppNotification[];
  items?: InAppNotification[];
  metaData?: {
    page?: number;
    hasMore?: boolean;
    pageSize?: number;
    count?: number;
  } | null;
  [key: string]: unknown;
}

interface UnreadCountApiEnvelope {
  data?: number | { count?: number; unreadCount?: number };
  count?: number;
  unreadCount?: number;
  [key: string]: unknown;
}

interface CustomerPreferencesApiEnvelope {
  data?: CustomerPreferenceGroup[];
  [key: string]: unknown;
}

interface NotificationPayloadEnvelope {
  payload?: {
    title?: string;
    body?: string;
    subTitle?: string;
    avatar?: Array<{
      iconURL?: string;
      fallBackName?: string;
      iconRedirectURL?: string;
    }>;
    attachmentsImage?: Array<{
      iconURL?: string;
      fallBackName?: string;
      iconRedirectURL?: string;
    }>;
    attachments?: Array<{
      type?: string;
      fileName?: string;
      url?: string;
    }>;
    itemRedirect?: string;
    tags?: Array<{
      tagName?: string;
      url?: string;
      icon?: string;
    }>;
    actionButtons?: {
      primary?: { name?: string; url?: string; onclickAction?: string } | null;
      secondary?: { name?: string; url?: string; onclickAction?: string } | null;
      tertiary?: { name?: string; url?: string; onclickAction?: string } | null;
    };
    [key: string]: unknown;
  } | string;
  createdDate?: string;
  [key: string]: unknown;
}

type NotificationContentShape = NonNullable<
  Exclude<NotificationPayloadEnvelope["payload"], string>
>;

function parseJsonRecord(value: string) {
  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? (parsed as NotificationContentShape) : null;
  } catch {
    return null;
  }
}

function getParsedNotificationPayload(
  payload: NotificationPayloadEnvelope["payload"]
): NotificationContentShape | null {
  if (typeof payload === "string") {
    return parseJsonRecord(payload);
  }

  return isRecord(payload) ? (payload as NotificationContentShape) : null;
}

function getNotificationContent(notification: InAppNotification): NotificationContentShape | undefined {
  const payloadEnvelope = notification as NotificationPayloadEnvelope;
  const payload = getParsedNotificationPayload(payloadEnvelope.payload);

  if (notification.content && isRecord(notification.content)) {
    return notification.content as NotificationContentShape;
  }

  if (isRecord(notification.content) && "payload" in notification.content) {
    const nestedPayload = getParsedNotificationPayload(
      notification.content.payload as NotificationPayloadEnvelope["payload"]
    );

    if (nestedPayload) {
      return nestedPayload;
    }
  }

  if (payload) {
    return payload;
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildNotificationIdentity(notification: InAppNotification) {
  const payloadEnvelope = notification as NotificationPayloadEnvelope;
  const content = getNotificationContent(notification);
  const parsedPayload = getParsedNotificationPayload(payloadEnvelope.payload);
  const timestamp =
    payloadEnvelope.createdDate ??
    notification.createdAt ??
    notification.updatedAt ??
    new Date().toISOString();

  if (typeof notification.id === "string" && notification.id.trim()) {
    return notification.id;
  }

  const title = content?.title ?? parsedPayload?.title ?? notification.title ?? "";
  const body = content?.body ?? parsedPayload?.body ?? notification.body ?? "";
  const customerId =
    typeof notification.customerId === "string" ? notification.customerId : "unknown-customer";

  return `${customerId}:${timestamp}:${title}:${body}`;
}

function looksLikeNotificationContent(value: Record<string, unknown>) {
  return (
    "title" in value ||
    "body" in value ||
    "subTitle" in value ||
    "avatar" in value ||
    "attachmentsImage" in value ||
    "attachments" in value ||
    "itemRedirect" in value ||
    "tags" in value ||
    "actionButtons" in value
  );
}

export function normalizeIncomingNotification(payload: unknown): InAppNotification | null {
  if (!isRecord(payload)) {
    return null;
  }

  const socketEnvelope = payload as SocketEnvelope;
  const candidate = socketEnvelope.data ?? socketEnvelope.payload ?? payload;

  if (!isRecord(candidate)) {
    return null;
  }

  if ("notification" in candidate && isRecord(candidate.notification)) {
    return normalizeIncomingNotification(candidate.notification);
  }

  if ("id" in candidate || "payload" in candidate || "content" in candidate) {
    return candidate as InAppNotification;
  }

  if (looksLikeNotificationContent(candidate)) {
    const timestampCandidate =
      typeof candidate.createdDate === "string"
        ? candidate.createdDate
        : typeof candidate.createdAt === "string"
          ? candidate.createdAt
          : typeof candidate.updatedAt === "string"
            ? candidate.updatedAt
            : new Date().toISOString();

    const customerId =
      typeof candidate.customerId === "string" ? candidate.customerId : undefined;

    return {
      id:
        typeof candidate.id === "string" && candidate.id.trim()
          ? candidate.id
          : `${customerId ?? "unknown-customer"}:${timestampCandidate}`,
      customerId,
      isRead: Boolean(candidate.isRead),
      createdAt:
        typeof candidate.createdAt === "string" ? candidate.createdAt : timestampCandidate,
      updatedAt:
        typeof candidate.updatedAt === "string" ? candidate.updatedAt : timestampCandidate,
      payload: candidate as NotificationContentShape,
    } as InAppNotification;
  }

  return null;
}

const INAPP_SOCKET_EVENT = "inAppMessage";
const SOCKET_IO_HANDSHAKE_PATH = "/api/v1/wss/socket.io";
let activeSocketClient: Socket | null = null;

export function mapSdkNotificationToUiItem(
  notification: InAppNotification
): InAppNotificationItem {
  const payloadEnvelope = notification as NotificationPayloadEnvelope;
  const content = getNotificationContent(notification);
  const payload = getParsedNotificationPayload(payloadEnvelope.payload);
  const notificationId = buildNotificationIdentity(notification);
  const avatars =
    content?.avatar?.map((avatar, index) => ({
      id: `${notificationId}-avatar-${index}`,
      name: avatar.fallBackName ?? "User",
      imageUrl: avatar.iconURL || undefined,
      redirectUrl: avatar.iconRedirectURL || undefined,
    })) ?? [];

  const attachments =
    content?.attachments?.map((attachment, index) => ({
      id: `${notificationId}-attachment-${index}`,
      fileName: attachment.fileName ?? "Attachment",
      url: attachment.url,
    })) ?? [];

  const actions = [
    content?.actionButtons?.primary,
    content?.actionButtons?.secondary,
    content?.actionButtons?.tertiary,
  ]
    .filter(Boolean)
    .map((action, index) => ({
      id: `${notificationId}-action-${index}`,
      label: action?.name ?? "Open",
      url: action?.url,
    }));

  const images =
    content?.attachmentsImage
      ?.filter((image) => typeof image.iconURL === "string" && Boolean(image.iconURL))
      .map((image, index) => ({
        id: `${notificationId}-image-${index}`,
        imageUrl: image.iconURL as string,
        redirectUrl: image.iconRedirectURL || undefined,
      })) ?? [];

  return {
    id: notificationId,
    title:
      content?.title ??
      payload?.title ??
      notification.title ??
      "Untitled notification",
    subtitle: content?.subTitle ?? payload?.subTitle,
    body: content?.body ?? payload?.body ?? notification.body ?? "",
    timestamp:
      payloadEnvelope.createdDate ??
      notification.createdAt ??
      notification.updatedAt ??
      new Date().toISOString(),
    isRead: Boolean(notification.isRead),
    avatars,
    tags:
      content?.tags
        ?.map((tag, index) => ({
          id: `${notificationId}-tag-${index}`,
          label: tag.tagName ?? "",
          url: tag.url || undefined,
        }))
        .filter((tag) => Boolean(tag.label)) ?? [],
    attachments,
    imageUrl: images[0]?.imageUrl,
    images,
    actions,
    itemRedirect: content?.itemRedirect,
  };
}

export function buildCustomerDetails(uniqueCustomerId: string): CustomerDetails {
  return {
    id: uniqueCustomerId,
    name: uniqueCustomerId,
    email: `${uniqueCustomerId.toLowerCase()}@demo.dokaai.ai`,
  };
}

export function createHostInAppSdkClient(auth: HostSdkAuthConfig) {
  const env = getHostAppEnv();

  return createInAppNotificationSdkClient({
    transport: createHttpInAppNotificationTransport({
      inAppNotificationsBaseUrl: env.inAppNotificationsApiUrl,
      authToken: auth.jwtToken,
    }),
  });
}

export function getHostSdkRuntimeConfig(): HostSdkRuntimeConfig {
  return getHostAppEnv();
}

export async function fetchHostNotifications(
  client: InAppNotificationSdkClient,
  options: {
    page?: number;
    size?: number;
    isRead?: boolean;
  } = {}
) {
  const response = await client.notifications.getAll({
    page: options.page ?? 1,
    size: options.size ?? 10,
    isRead: options.isRead,
  });

  if (Array.isArray(response)) {
    return {
      notifications: response,
      message: "All In App Notification fetched successfully",
      metaData: {
        page: options.page ?? 1,
        hasMore: false,
        pageSize: options.size ?? 10,
        count: response.length,
      },
    };
  }

  const envelope = response as NotificationsApiEnvelope;

  if (Array.isArray(envelope.data)) {
    return {
      notifications: envelope.data,
      message: typeof envelope.message === "string" ? envelope.message : undefined,
      metaData: envelope.metaData ?? null,
    };
  }

  if (Array.isArray(envelope.notifications)) {
    return {
      notifications: envelope.notifications,
      message: typeof envelope.message === "string" ? envelope.message : undefined,
      metaData: envelope.metaData ?? null,
    };
  }

  if (Array.isArray(envelope.items)) {
    return {
      notifications: envelope.items,
      message: typeof envelope.message === "string" ? envelope.message : undefined,
      metaData: envelope.metaData ?? null,
    };
  }

  if (envelope.data && typeof envelope.data === "object") {
    if (Array.isArray(envelope.data.notifications)) {
      return {
        notifications: envelope.data.notifications,
        message: typeof envelope.message === "string" ? envelope.message : undefined,
        metaData: envelope.metaData ?? null,
      };
    }

    if (Array.isArray(envelope.data.items)) {
      return {
        notifications: envelope.data.items,
        message: typeof envelope.message === "string" ? envelope.message : undefined,
        metaData: envelope.metaData ?? null,
      };
    }
  }

  return {
    notifications: [],
    message: typeof envelope.message === "string" ? envelope.message : undefined,
    metaData: envelope.metaData ?? null,
  };
}

export async function fetchHostUnreadCount(
  client: InAppNotificationSdkClient
) {
  const response = await client.notifications.getUnreadCount({});

  if (typeof response === "number") {
    return response;
  }

  const envelope = response as UnreadCountApiEnvelope;

  if (typeof envelope.data === "number") {
    return envelope.data;
  }

  if (envelope.data && typeof envelope.data === "object") {
    if (typeof envelope.data.unreadCount === "number") {
      return envelope.data.unreadCount;
    }

    if (typeof envelope.data.count === "number") {
      return envelope.data.count;
    }
  }

  if (typeof envelope.unreadCount === "number") {
    return envelope.unreadCount;
  }

  if (typeof envelope.count === "number") {
    return envelope.count;
  }

  return 0;
}

export async function fetchHostPreferences(
  client: InAppNotificationSdkClient,
  projectId?: string
) {
  const response = await client.preferences.getAll({
    projectId,
  });

  if (Array.isArray(response)) {
    return {
      preferences: response,
      message: "Customer preferences fetched successfully",
    };
  }

  const envelope = response as CustomerPreferencesApiEnvelope;

  return {
    preferences: Array.isArray(envelope.data) ? envelope.data : [],
    message: typeof envelope.message === "string" ? envelope.message : undefined,
  };
}

export function mapPreferenceChannelState(
  preference: Record<PreferenceChannelKey, boolean>
) {
  return {
    email: Boolean(preference.email),
    inApp: Boolean(preference.in_app),
    sms: Boolean(preference.sms),
    push: Boolean(preference.push),
    whatsApp: Boolean(preference.whatsApp),
  };
}

export function mapSdkPreferencesToUiGroups(
  groups: CustomerPreferenceGroup[]
) {
  return groups.map((group) => ({
    id: group.groupId,
    name: group.groupName,
    description: group.groupDescription,
    isNotificationOff: Boolean(group.isGroupNotificationOff),
    channels: mapPreferenceChannelState(group.groupChannelLevelPreference),
    topics: group.topic.map((topic) => ({
      id: topic.topicId,
      name: topic.topicName,
      description: topic.topicDescription,
      isNotificationOff: Boolean(topic.isTopicNotificationOff),
      channels: mapPreferenceChannelState(topic.topicChannelLevelPreference),
    })),
  }));
}

export function mapUiChannelsToSdkPreference(
  channels: PreferenceChannelState
) {
  return {
    email: Boolean(channels.email),
    in_app: Boolean(channels.inApp),
    sms: Boolean(channels.sms),
    push: Boolean(channels.push),
    whatsApp: Boolean(channels.whatsApp),
  };
}

export function buildSaveGroupPreferencePayload(group: UiPreferenceGroup) {
  return {
    isGroupNotificationOff: Boolean(group.isNotificationOff),
    groupChannelLevelPreference: mapUiChannelsToSdkPreference(group.channels),
  };
}

export function buildSaveTopicPreferencePayload(topic: UiPreferenceTopic) {
  return {
    isTopicNotificationOff: Boolean(topic.isNotificationOff),
    topicChannelLevelPreference: mapUiChannelsToSdkPreference(topic.channels),
  };
}

export function disconnectHostSocket() {
  if (activeSocketClient) {
    activeSocketClient.disconnect();
    activeSocketClient = null;
  }
}

export async function connectHostSocket(
  auth: HostSdkAuthConfig,
  onStatusChange?: (status: SocketStatus) => void,
  timeoutMs = 15000
) {
  onStatusChange?.("connecting");
  const env = getHostAppEnv();

  return new Promise<SocketBridgeResponse>((resolve, reject) => {
    const socket = io(env.inAppSocketUrl, {
      path: SOCKET_IO_HANDSHAKE_PATH,
      transports: ["websocket"],
      forceNew: true,
      timeout: timeoutMs,
      auth: {
        token: `Bearer ${auth.jwtToken}`,
      },
    });

    const cleanup = () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
    };

    const handleConnect = () => {
      cleanup();
      socket.disconnect();
      onStatusChange?.("connected");
      resolve({ success: true });
    };

    const handleConnectError = (error: Error & { description?: unknown }) => {
      cleanup();
      socket.disconnect();
      onStatusChange?.("error");
      reject(
        new Error(
          typeof error?.message === "string" && error.message
            ? error.message
            : typeof error?.description === "string"
              ? error.description
              : "Unable to establish WebSocket connection."
        )
      );
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
  });
}

export function subscribeToInAppMessages<TPayload = unknown>(
  auth: HostSdkAuthConfig,
  listener: (payload: TPayload) => void,
  onStatusChange?: (status: SocketStatus) => void
) {
  disconnectHostSocket();
  const env = getHostAppEnv();
  const socket = io(env.inAppSocketUrl, {
    path: SOCKET_IO_HANDSHAKE_PATH,
    transports: ["websocket"],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    auth: {
      token: `Bearer ${auth.jwtToken}`,
    },
  });
  activeSocketClient = socket;

  const handleConnected = () => {
    onStatusChange?.("connected");
  };

  const handleNotification = (payload: unknown) => {
    try {
      listener(payload as TPayload);
    } catch {
      listener(payload as TPayload);
    }
  };

  const handleError = () => {
    onStatusChange?.("error");
  };

  socket.on("connect", handleConnected);
  socket.on(INAPP_SOCKET_EVENT, handleNotification);
  socket.on("connect_error", handleError);
  socket.on("disconnect", handleError);

  return () => {
    socket.off("connect", handleConnected);
    socket.off(INAPP_SOCKET_EVENT, handleNotification);
    socket.off("connect_error", handleError);
    socket.off("disconnect", handleError);
    socket.disconnect();

    if (activeSocketClient === socket) {
      activeSocketClient = null;
    }
  };
}
