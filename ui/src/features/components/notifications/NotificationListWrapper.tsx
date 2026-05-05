import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCheck, Expand, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationEmptyState } from "@/features/components/notifications/NotificationEmptyState";
import { NotificationSkeleton } from "@/features/components/notifications/NotificationSkeleton";
import { InAppNotificationItem } from "@/features/types/notification.types";
import { formatNotificationTime } from "@/features/utils/date";
import { cn } from "@/features/utils/cn";
import { useSdkStore } from "@/features/store/useSdkStore";

function NotificationAvatarStack({
  label,
  imageUrl,
  className,
  redirectUrl,
  expanded = false,
}: {
  label: string;
  imageUrl?: string;
  className?: string;
  redirectUrl?: string;
  expanded?: boolean;
}) {
  const avatarContent = imageUrl ? (
    <div
      className={cn(
        expanded
          ? "h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm mb-2"
          : "h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={label} className="h-full w-full object-cover" src={imageUrl} />
    </div>
  ) : (
    <Avatar
      className={cn(
        expanded ? "h-10 w-10 border-2 border-white text-sm shadow-sm" : "h-8 w-8 border-2 border-white text-xs shadow-sm",
        className
      )}
      label={label}
    />
  );

  if (!redirectUrl) {
    return avatarContent;
  }

  return (
    <button type="button" onClick={(event) => openInNewTab(redirectUrl, event)}>
      {avatarContent}
    </button>
  );
}

function openInNewTab(url?: string, event?: { stopPropagation?: () => void; preventDefault?: () => void }) {
  event?.stopPropagation?.();
  event?.preventDefault?.();

  if (!url) {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

function NotificationCard({
  notification,
  onOpenDetails,
  onMarkAsRead,
  readOnly = false,
  expanded = false,
  onCloseExpanded,
  disableCardRedirect = false,
}: {
  notification: InAppNotificationItem;
  onOpenDetails: (notification: InAppNotificationItem) => void;
  onMarkAsRead: (notificationId: string) => void | Promise<void>;
  readOnly?: boolean;
  expanded?: boolean;
  onCloseExpanded?: () => void;
  disableCardRedirect?: boolean;
}) {
  const topAvatars = expanded
    ? notification.avatars ?? []
    : notification.avatars?.slice(0, 3) ?? [];
  const extraAvatars = Math.max((notification.avatars?.length ?? 0) - topAvatars.length, 0);
  const visibleTags = expanded
    ? notification.tags ?? []
    : notification.tags?.slice(0, 3) ?? [];
  const extraTags = Math.max((notification.tags?.length ?? 0) - visibleTags.length, 0);
  const visibleAttachments = expanded
    ? notification.attachments ?? []
    : notification.attachments?.slice(0, 2) ?? [];
  const extraAttachments = Math.max((notification.attachments?.length ?? 0) - visibleAttachments.length, 0);
  const visibleActions = notification.actions?.slice(0, 3) ?? [];
  const totalImagesCount = notification.images?.length ?? (notification.imageUrl ? 1 : 0);
  const extraImagesCount = Math.max(totalImagesCount - 1, 0);
  const galleryImages = expanded
    ? notification.images?.length
      ? notification.images
      : notification.imageUrl
        ? [{ id: `${notification.id}-image-fallback`, imageUrl: notification.imageUrl }]
        : []
    : [];

  const isCardRedirectEnabled = Boolean(notification.itemRedirect) && !disableCardRedirect;

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm transition",
        isCardRedirectEnabled && "cursor-pointer",
        expanded && "shadow-2xl",
        notification.isRead ? "border-slate-200" : "border-primary/30 bg-primary-light/20"
      )}
      onClick={() => {
        if (isCardRedirectEnabled) {
          openInNewTab(notification.itemRedirect);
        }
      }}
      onKeyDown={(event) => {
        if (isCardRedirectEnabled && (event.key === "Enter" || event.key === " ")) {
          openInNewTab(notification.itemRedirect, event);
        }
      }}
      role={isCardRedirectEnabled ? "button" : undefined}
      tabIndex={isCardRedirectEnabled ? 0 : undefined}
    >
      <CardContent className={cn("relative p-4", expanded && "p-6 sm:p-6")}>
        {topAvatars.length > 0 ? (
          <div className="absolute left-0 h-10 w-1 rounded-r-full bg-primary" />
        ) : null}

        <div className="min-w-0">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center">
              {topAvatars.length > 0 ? (
                <>
                  {topAvatars.map((avatar, index) => (
                    <NotificationAvatarStack
                      key={avatar.id}
                      className={cn(index > 0 && "-ml-2")}
                      expanded={expanded}
                      imageUrl={avatar.imageUrl}
                      label={avatar.name}
                      redirectUrl={avatar.redirectUrl}
                    />
                  ))}
                  {!expanded && extraAvatars > 0 ? (
                    <span className="ml-2 whitespace-nowrap text-xs text-[#5F766C]">+{extraAvatars} more</span>
                  ) : null}
                </>
              ) : (
                <NotificationAvatarStack label={notification.title} />
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {!notification.isRead ? <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" /> : null}
              <span className="text-xs font-medium text-primary">{formatNotificationTime(notification.timestamp)}</span>
              {readOnly && expanded && onCloseExpanded ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCloseExpanded();
                  }}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Close notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
              {!readOnly ? (
                <>
                  <button
                    type="button"
                    disabled={notification.isRead}
                    onClick={(event) => {
                      event.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    className={cn(
                      "rounded-lg border p-1.5 transition disabled:cursor-not-allowed disabled:hover:bg-slate-50",
                      notification.isRead
                        ? "border-slate-200 bg-slate-50 text-slate-400"
                        : "border-primary/20 bg-primary-light text-primary hover:bg-primary-light/80"
                    )}
                    aria-label="Mark notification as read"
                    title="Mark as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenDetails(notification);
                    }}
                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                    aria-label="Open notification details"
                    title="Open details"
                  >
                    <Expand className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {galleryImages.length > 0 ? (
            <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={image.id ?? `${notification.id}-gallery-${index}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                  onClick={(event) => openInNewTab(image.redirectUrl ?? image.imageUrl, event)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`${notification.title} image ${index + 1}`}
                    className="h-28 w-full object-cover sm:h-32"
                    src={image.imageUrl}
                  />
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <h3 className={cn("text-[15px] font-semibold leading-6 text-[#0F172A]", expanded ? "" : "line-clamp-2")}>
                {notification.title}
              </h3>

              {notification.subtitle ? (
                <p className={cn("-mt-0.5 text-sm leading-5 text-[#8FA09C]", expanded ? "whitespace-pre-wrap" : "line-clamp-2")}>{notification.subtitle}</p>
              ) : null}

              <div
                className={cn(
                  "mt-1 text-[13px] leading-5 text-[#4B5563]",
                  expanded
                    ? "max-h-[12.5rem] overflow-y-auto whitespace-pre-wrap pr-1"
                    : "line-clamp-2 max-w-[1100px]"
                )}
              >
                {notification.body}
              </div>

              {visibleTags.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {visibleTags.map((tag, index) => (
                    <div key={tag.id} className="flex items-center gap-1">
                      {index > 0 ? <span className="text-slate-300">•</span> : null}
                      <button
                        type="button"
                        onClick={(event) => openInNewTab(tag.url, event)}
                        className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-[#5F766C] transition hover:border-primary/20 hover:bg-primary-light hover:text-primary"
                      >
                        {tag.label}
                      </button>
                    </div>
                  ))}
                  {!expanded && extraTags > 0 ? (
                    <span className="ml-1 text-xs font-medium text-[#5F766C]">+{extraTags} more</span>
                  ) : null}
                </div>
              ) : null}

              {visibleAttachments.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {visibleAttachments.map((attachment) => (
                    <button
                      type="button"
                      key={attachment.id}
                      onClick={(event) => openInNewTab(attachment.url, event)}
                      className={cn(
                        "rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-left text-xs font-medium text-slate-600",
                        "hover:bg-slate-100"
                      )}
                    >
                      {attachment.fileName}
                    </button>
                  ))}
                  {!expanded && extraAttachments > 0 ? (
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500">
                      +{extraAttachments} more
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {!expanded && notification.imageUrl ? (
              <div className="w-[4.5rem] shrink-0 self-center">
                <button
                  type="button"
                  className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                  onClick={(event) =>
                    openInNewTab(notification.images?.[0]?.redirectUrl ?? notification.imageUrl, event)
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={notification.title} className="h-[4.5rem] w-[4.5rem] object-cover" src={notification.imageUrl} />
                  {extraImagesCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold leading-none text-white shadow-sm">
                      +{extraImagesCount}
                    </span>
                  ) : null}
                </button>
              </div>
            ) : null}
          </div>

          {visibleActions.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-2 pt-2">
              {visibleActions.map((action, index) => (
                <Button
                  type="button"
                  key={action.id}
                  className={cn(
                    "h-7 max-w-[150px] rounded-md px-3 text-xs",
                    index === 0 && "bg-primary text-white hover:bg-primary-hover",
                    index >= 1 && "border border-primary bg-white text-primary hover:bg-primary-light"
                  )}
                  onClick={(event) => openInNewTab(action.url, event)}
                  size="sm"
                  variant={index === 0 ? "default" : "outline"}
                >
                  <span className="truncate">{action.label}</span>
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationDetailModal({
  notification,
  onClose,
  onMarkAsRead,
}: {
  notification: InAppNotificationItem | null;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => void | Promise<void>;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!notification) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [notification, onClose]);

  if (!notification) {
    return null;
  }

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed left-0 top-0 z-[999] h-screen w-screen overflow-hidden bg-slate-950/45 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex h-full w-full items-center justify-center px-4 py-6"
      >
        <div
          className="relative w-full max-w-5xl animate-[zoomIn_180ms_ease-out]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[28px] bg-white shadow-2xl p-3">
            <NotificationCard
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onOpenDetails={() => undefined}
              readOnly
              expanded
              onCloseExpanded={onClose}
              disableCardRedirect
            />
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes zoomIn {
          0% {
            opacity: 0;
            transform: scale(0.94);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
    ,
    document.body
  );
}

export function NotificationListWrapper({
  notifications,
  isLoading,
  onMarkAsRead,
}: {
  notifications: InAppNotificationItem[];
  isLoading: boolean;
  onMarkAsRead: (notificationId: string) => void | Promise<void>;
}) {
  const [selectedNotification, setSelectedNotification] = useState<InAppNotificationItem | null>(null);

  if (isLoading) {
    return <NotificationSkeleton />;
  }

  if (notifications.length === 0) {
    return <NotificationEmptyState />;
  }

  return (
    <>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onOpenDetails={setSelectedNotification}
          />
        ))}
      </div>
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onMarkAsRead={onMarkAsRead}
      />
    </>
  );
}
