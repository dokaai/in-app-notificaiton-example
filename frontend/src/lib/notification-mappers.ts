"use client";

import type { InAppNotification } from "@backend/types";
import type { InAppNotificationItem } from "@/features/types/notification.types";

interface SocketEnvelope<TPayload = unknown> {
  event?: string;
  data?: TPayload;
  payload?: TPayload;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseJsonRecord(value: string) {
  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? (parsed as NotificationContentShape) : null;
  } catch {
    return null;
  }
}

function readStringLikeId(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function getServerNotificationId(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return (
    readStringLikeId(value.id) ??
    readStringLikeId(value.notificationId) ??
    readStringLikeId(value.inAppNotificationId) ??
    readStringLikeId(value.messageId) ??
    readStringLikeId(value._id)
  );
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
  const content = isRecord(notification.content) ? notification.content : null;

  if (content && "payload" in content) {
    const nestedPayload = getParsedNotificationPayload(
      content.payload as NotificationPayloadEnvelope["payload"]
    );

    if (nestedPayload) {
      return nestedPayload;
    }
  }

  if (content) {
    return content as NotificationContentShape;
  }

  return payload ?? undefined;
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

  const serverNotificationId = getServerNotificationId(notification);

  if (serverNotificationId) {
    return serverNotificationId;
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
  const envelopeNotificationId = getServerNotificationId(socketEnvelope);

  if (envelopeNotificationId && ("payload" in socketEnvelope || "content" in socketEnvelope)) {
    return {
      ...socketEnvelope,
      id: envelopeNotificationId,
    } as InAppNotification;
  }

  const candidate = socketEnvelope.data ?? socketEnvelope.payload ?? payload;

  if (!isRecord(candidate)) {
    return null;
  }

  if ("notification" in candidate && isRecord(candidate.notification)) {
    const normalizedNotification = normalizeIncomingNotification(candidate.notification);

    return normalizedNotification && envelopeNotificationId
      ? {
          ...normalizedNotification,
          id: getServerNotificationId(normalizedNotification) ?? envelopeNotificationId,
        }
      : normalizedNotification;
  }

  const candidateNotificationId =
    getServerNotificationId(candidate) ?? envelopeNotificationId;

  if ("id" in candidate || "payload" in candidate || "content" in candidate) {
    return {
      ...candidate,
      ...(candidateNotificationId ? { id: candidateNotificationId } : {}),
    } as InAppNotification;
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
      id: candidateNotificationId ?? `${customerId ?? "unknown-customer"}:${timestampCandidate}`,
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

export function mapNotificationToUiItem(
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
