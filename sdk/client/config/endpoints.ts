export const API_ENDPOINTS = {
  GET_ALL_INAPP_NOTIFICATIONS: ({
    baseUrl,
    page = 1,
    size = 10,
    isRead,
  }: {
    baseUrl: string;
    page?: number;
    size?: number;
    isRead?: boolean;
  }) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (typeof isRead === 'boolean') {
      params.set('isRead', String(isRead));
    }

    return `${baseUrl.replace(/\/$/, '')}/nudge/in-app-notifications/?${params.toString()}`;
  },

  MARK_INAPP_NOTIFICATION_AS_READ: ({
    baseUrl,
    notificationId,
  }: {
    baseUrl: string;
    notificationId: string;
  }) =>
    `${baseUrl.replace(/\/$/, '')}/nudge/in-app-notifications/${notificationId}/read`,

  MARK_ALL_INAPP_NOTIFICATIONS_AS_READ: ({ baseUrl }: { baseUrl: string }) =>
    `${baseUrl.replace(/\/$/, '')}/nudge/in-app-notifications/read-all`,

  GET_UNREAD_INAPP_NOTIFICATIONS_COUNT: ({ baseUrl }: { baseUrl: string }) =>
    `${baseUrl.replace(/\/$/, '')}/nudge/in-app-notifications/unread-count`,

  GET_CUSTOMER_PREFERENCES: ({
    baseUrl,
    projectId,
  }: {
    baseUrl: string;
    projectId?: string;
  }) =>
    `${baseUrl.replace(/\/$/, '')}/nudge/customer-preferences/`,

  SAVE_GROUP_PREFERENCE: ({
    baseUrl,
    groupId,
  }: {
    baseUrl: string;
    groupId: string;
  }) =>
    `${baseUrl.replace(/\/$/, '')}/nudge/customer-preferences/notification-groups/${groupId}`,

  SAVE_TOPIC_PREFERENCE: ({
    baseUrl,
    topicId,
  }: {
    baseUrl: string;
    topicId: string;
  }) =>
    `${baseUrl.replace(/\/$/, '')}/nudge/customer-preferences/notification-topics/${topicId}`,
};
