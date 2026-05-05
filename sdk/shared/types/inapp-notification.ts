export interface InAppNotificationActionButton {
  name: string;
  url?: string;
  onclickAction?: string;
}

export interface InAppNotificationAvatar {
  iconURL: string;
  fallBackName?: string;
  iconRedirectURL?: string;
}

export interface InAppNotificationAttachmentImage {
  iconURL: string;
  fallBackName?: string;
  iconRedirectURL?: string;
}

export interface InAppNotificationAttachment {
  type: string;
  fileName: string;
  url: string;
}

export interface InAppNotificationTag {
  tagName: string;
  url?: string;
  icon?: string;
}

export interface InAppNotificationContent {
  title: string;
  subTitle?: string;
  body: string;
  avatar?: InAppNotificationAvatar[];
  attachmentsImage?: InAppNotificationAttachmentImage[];
  attachments?: InAppNotificationAttachment[];
  itemRedirect?: string;
  tags?: InAppNotificationTag[];
  actionButtons?: {
    primary?: InAppNotificationActionButton | null;
    secondary?: InAppNotificationActionButton | null;
    tertiary?: InAppNotificationActionButton | null;
  };
}

export interface InAppNotification {
  id: string;
  customerId?: string;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
  title?: string;
  body?: string;
  content?: InAppNotificationContent;
  [key: string]: unknown;
}

export interface GetAllInAppNotificationsParams {
  customerId: string;
  page?: number;
  size?: number;
  isRead?: boolean;
}

export interface MarkInAppNotificationAsReadParams {
  notificationId: string;
  customerId: string;
}

export interface MarkAllInAppNotificationsAsReadParams {
  customerId: string;
}

export interface GetUnreadInAppNotificationsCountParams {
  customerId: string;
}
