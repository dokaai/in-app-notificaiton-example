"use client";

import {
  createHttpInAppNotificationTransport,
  createInAppNotificationSdkClient,
  InAppNotificationSdkClient,
} from "@sdk/client";
import type {
  CustomerPreferenceGroup,
  PreferenceChannelKey,
  Customer,
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
  projectId: string;
  orgId: string;
  customerPoolId: string;
  customerId: string;
  jwtToken: string;
  socketCustomerKey?: string;
}

export interface HostSdkRuntimeConfig {
  inAppNotificationsApiUrl: string;
  projectScopeApiUrl: string;
  inAppSocketUrl: string;
}

interface SocketBridgeResponse {
  success: boolean;
  message?: string;
}

interface SocketStreamMessage {
  type: "connected" | "notification" | "error";
  data?: unknown;
  message?: string;
}

interface SocketEnvelope<TPayload = unknown> {
  event?: string;
  data?: TPayload;
  payload?: TPayload;
  [key: string]: unknown;
}

interface CustomerAttributeField {
  value?: unknown;
  fieldName?: string;
  fieldDisplayName?: string;
  [key: string]: unknown;
}

interface CustomerApiEnvelope {
  data?: Record<string, CustomerAttributeField>;
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

const CUSTOMER_POOL_MODULE = "customer-pools";
const INAPP_SOCKET_EVENT = "inAppMessage";
let activeSocketStream: EventSource | null = null;

function getCustomerFieldValue(customer: Customer, fieldName: string) {
  const envelope = customer as CustomerApiEnvelope;
  const field = envelope.data?.[fieldName];

  if (field && typeof field === "object" && "value" in field) {
    return field.value;
  }

  return customer.attributes?.find((attribute) => attribute.fieldName === fieldName)?.value;
}

function getCustomerUniqueCustomerId(customer: Customer) {
  const value = getCustomerFieldValue(customer, "uniqueCustomerId");
  return typeof value === "string" && value ? value : null;
}

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

export function mapSdkCustomerToCustomerDetails(customer: Customer): CustomerDetails {
  const firstName = getCustomerFieldValue(customer, "firstName");
  const lastName = getCustomerFieldValue(customer, "lastName");
  const email =
    getCustomerFieldValue(customer, "emailId") ??
    getCustomerFieldValue(customer, "email");
  const fallbackName = getCustomerFieldValue(customer, "name");
  const fullName = [firstName, lastName]
    .filter((part): part is string => typeof part === "string" && Boolean(part.trim()))
    .join(" ");

  return {
    id:
      customer.id ||
      getCustomerUniqueCustomerId(customer) ||
      (typeof fallbackName === "string" ? fallbackName : "Unknown Customer"),
    name:
      fullName ||
      (typeof fallbackName === "string" && fallbackName
        ? fallbackName
        : "Taylor Morgan"),
    email: typeof email === "string" ? email : "taylor.morgan@demo.dokaai.ai",
  };
}

export function createHostInAppSdkClient(auth: HostSdkAuthConfig) {
  const env = getHostAppEnv();

  return createInAppNotificationSdkClient({
    transport: createHttpInAppNotificationTransport({
      inAppNotificationsBaseUrl: env.inAppNotificationsApiUrl,
      projectScopeBaseUrl: env.projectScopeApiUrl,
      accessToken: auth.jwtToken,
      orgId: auth.orgId,
    }),
  });
}

export function getHostSdkRuntimeConfig(): HostSdkRuntimeConfig {
  return getHostAppEnv();
}

export async function fetchHostCustomerDetails(
  client: InAppNotificationSdkClient,
  auth: HostSdkAuthConfig
) {
  return client.customers.getById({
    projectId: auth.projectId,
    customerPoolModule: CUSTOMER_POOL_MODULE,
    customerPoolId: auth.customerPoolId,
    customerId: auth.customerId,
    attributeTypes: "all",
  });
}

export async function fetchHostNotifications(
  client: InAppNotificationSdkClient,
  customerId: string,
  options: {
    page?: number;
    size?: number;
    isRead?: boolean;
  } = {}
) {
  const response = await client.notifications.getAll({
    customerId,
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
  client: InAppNotificationSdkClient,
  customerId: string
) {
  const response = await client.notifications.getUnreadCount({ customerId });

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
  projectId: string,
  customerId: string
) {
  const response = await client.preferences.getAll({
    projectId,
    customerId,
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
  if (activeSocketStream) {
    activeSocketStream.close();
    activeSocketStream = null;
  }
}

export async function connectHostSocket(
  auth: HostSdkAuthConfig,
  onStatusChange?: (status: SocketStatus) => void,
  timeoutMs = 8000
) {
  onStatusChange?.("connecting");

  const response = await fetch("/api/socket/connect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerKey: auth.socketCustomerKey ?? auth.customerId,
      orgId: auth.orgId,
      jwtToken: auth.jwtToken,
      timeoutMs,
    }),
  });

  const payload = (await response.json().catch(() => null)) as SocketBridgeResponse | null;

  if (!response.ok || !payload?.success) {
    onStatusChange?.("error");
    throw new Error(payload?.message || "Unable to establish WebSocket connection.");
  }

  onStatusChange?.("connected");
  return payload;
}

export function subscribeToInAppMessages<TPayload = unknown>(
  auth: HostSdkAuthConfig,
  listener: (payload: TPayload) => void,
  onStatusChange?: (status: SocketStatus) => void
) {
  disconnectHostSocket();

  const searchParams = new URLSearchParams({
    customerKey: auth.socketCustomerKey ?? auth.customerId,
    orgId: auth.orgId,
    jwtToken: auth.jwtToken,
  });

  const stream = new EventSource(`/api/socket/stream?${searchParams.toString()}`);
  activeSocketStream = stream;

  const handleConnected = () => {
    onStatusChange?.("connected");
  };

  const handleNotification = (event: MessageEvent<string>) => {
    try {
      const message = JSON.parse(event.data) as SocketStreamMessage;
      listener((message.data ?? message) as TPayload);
    } catch {
      listener(event.data as TPayload);
    }
  };

  const handleError = () => {
    onStatusChange?.("error");
  };

  stream.addEventListener("connected", handleConnected as EventListener);
  stream.addEventListener(INAPP_SOCKET_EVENT, handleNotification as EventListener);
  stream.onerror = handleError;

  return () => {
    stream.removeEventListener("connected", handleConnected as EventListener);
    stream.removeEventListener(INAPP_SOCKET_EVENT, handleNotification as EventListener);
    stream.close();

    if (activeSocketStream === stream) {
      activeSocketStream = null;
    }
  };
}

export function getSocketCustomerKeyFromCustomer(customer: Customer) {
  return (
    getCustomerUniqueCustomerId(customer) ||
    customer.externalId ||
    customer.id ||
    null
  );
}
