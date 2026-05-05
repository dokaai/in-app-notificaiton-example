export const API_ENDPOINTS = {
  GET_ALL_INAPP_NOTIFICATIONS: ({
    baseUrl,
    customerId,
    page = 1,
    size = 10,
    isRead,
  }: {
    baseUrl: string;
    customerId: string;
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

    return `${baseUrl.replace(/\/$/, '')}/in-app-notifications/customer/${customerId}?${params.toString()}`;
  },

  MARK_INAPP_NOTIFICATION_AS_READ: ({
    baseUrl,
    notificationId,
    customerId,
  }: {
    baseUrl: string;
    notificationId: string;
    customerId: string;
  }) =>
    `${baseUrl.replace(/\/$/, '')}/in-app-notifications/${notificationId}/customer/${customerId}`,

  MARK_ALL_INAPP_NOTIFICATIONS_AS_READ: ({
    baseUrl,
    customerId,
  }: {
    baseUrl: string;
    customerId: string;
  }) =>
    `${baseUrl.replace(/\/$/, '')}/in-app-notifications/customer/${customerId}/read-all`,

  GET_UNREAD_INAPP_NOTIFICATIONS_COUNT: ({
    baseUrl,
    customerId,
  }: {
    baseUrl: string;
    customerId: string;
  }) =>
    `${baseUrl.replace(/\/$/, '')}/in-app-notifications/customer/${customerId}/unread-count`,

  GET_CUSTOMER_PREFERENCES: ({
    baseUrl,
    projectId,
    customerId,
  }: {
    baseUrl: string;
    projectId: string;
    customerId: string;
  }) =>
    `${baseUrl.replace(/\/$/, '')}/projects/${projectId}/customer-preferences/customer/${customerId}`,

  SAVE_GROUP_PREFERENCE: ({
    baseUrl,
    projectId,
    customerId,
    groupId,
  }: {
    baseUrl: string;
    projectId: string;
    customerId: string;
    groupId: string;
  }) =>
    `${baseUrl.replace(/\/$/, '')}/projects/${projectId}/customer-preferences/customer/${customerId}/save-group-preference/${groupId}`,

  SAVE_TOPIC_PREFERENCE: ({
    baseUrl,
    projectId,
    customerId,
    topicId,
  }: {
    baseUrl: string;
    projectId: string;
    customerId: string;
    topicId: string;
  }) =>
    `${baseUrl.replace(/\/$/, '')}/projects/${projectId}/customer-preferences/customer/${customerId}/save-topic-preference/${topicId}`,

  GET_CUSTOMER_BY_ID: ({
    baseUrl,
    projectId,
    customerPoolModule,
    customerPoolId,
    customerId,
    attributeTypes = 'all',
  }: {
    baseUrl: string;
    projectId: string;
    customerPoolModule: string;
    customerPoolId: string;
    customerId: string;
    attributeTypes?: string;
  }) =>
    `${baseUrl.replace(/\/$/, '')}/projects/${projectId}/${customerPoolModule}/${customerPoolId}/customers/${customerId}?attributeTypes=${attributeTypes}`,
};
