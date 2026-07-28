export interface NotificationAvatar {
  id: string;
  name: string;
  imageUrl?: string;
  redirectUrl?: string;
}

export interface NotificationAttachment {
  id: string;
  fileName: string;
  url?: string;
}

export interface NotificationTag {
  id: string;
  label: string;
  url?: string;
}

export interface NotificationImage {
  id: string;
  imageUrl: string;
  redirectUrl?: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  url?: string;
}

export interface InAppNotificationItem {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  avatars?: NotificationAvatar[];
  tags?: NotificationTag[];
  attachments?: NotificationAttachment[];
  imageUrl?: string;
  images?: NotificationImage[];
  actions?: NotificationAction[];
  itemRedirect?: string;
}
