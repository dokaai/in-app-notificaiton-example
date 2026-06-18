import { API_ENDPOINTS } from '@/client/config/endpoints';
import { HttpClient } from '@/client/lib/http-client';
import {
  CustomerPreferenceGroup,
  GetCustomerPreferencesParams,
  GetAllInAppNotificationsParams,
  GetUnreadInAppNotificationsCountParams,
  HttpTransportConfig,
  InAppNotification,
  InAppNotificationTransport,
  MarkAllInAppNotificationsAsReadParams,
  MarkInAppNotificationAsReadParams,
  SaveGroupPreferenceParams,
  SaveTopicPreferenceParams,
} from '@/shared/types';

export class HttpInAppNotificationTransport
  implements InAppNotificationTransport
{
  private readonly client: HttpClient;
  private readonly inAppNotificationsBaseUrl: string;

  constructor(config: HttpTransportConfig) {
    this.inAppNotificationsBaseUrl = config.inAppNotificationsBaseUrl;
    this.client = new HttpClient({
      accessToken: config.accessToken,
      authToken: config.authToken,
      fetch: config.fetch,
      defaultHeaders: config.defaultHeaders,
    });
  }

  async getAllInAppNotifications({
    page = 1,
    size = 10,
    isRead,
  }: GetAllInAppNotificationsParams): Promise<InAppNotification[]> {
    const url = API_ENDPOINTS.GET_ALL_INAPP_NOTIFICATIONS({
      baseUrl: this.inAppNotificationsBaseUrl,
      page,
      size,
      isRead,
    });

    return this.client.get<InAppNotification[]>(url);
  }

  async markInAppNotificationAsRead({
    notificationId,
  }: MarkInAppNotificationAsReadParams): Promise<unknown> {
    const url = API_ENDPOINTS.MARK_INAPP_NOTIFICATION_AS_READ({
      baseUrl: this.inAppNotificationsBaseUrl,
      notificationId,
    });

    return this.client.put(url);
  }

  async markAllInAppNotificationsAsRead(
    _params: MarkAllInAppNotificationsAsReadParams
  ): Promise<unknown> {
    const url = API_ENDPOINTS.MARK_ALL_INAPP_NOTIFICATIONS_AS_READ({
      baseUrl: this.inAppNotificationsBaseUrl,
    });

    return this.client.put(url, {});
  }

  async getUnreadInAppNotificationsCount(
    _params: GetUnreadInAppNotificationsCountParams
  ): Promise<unknown> {
    const url = API_ENDPOINTS.GET_UNREAD_INAPP_NOTIFICATIONS_COUNT({
      baseUrl: this.inAppNotificationsBaseUrl,
    });

    return this.client.get(url);
  }

  async getCustomerPreferences({
    projectId,
  }: GetCustomerPreferencesParams): Promise<CustomerPreferenceGroup[] | unknown> {
    const url = API_ENDPOINTS.GET_CUSTOMER_PREFERENCES({
      baseUrl: this.inAppNotificationsBaseUrl,
      projectId,
    });

    return this.client.get<CustomerPreferenceGroup[] | unknown>(url);
  }

  async saveGroupPreference({
    groupId,
    body,
  }: SaveGroupPreferenceParams): Promise<unknown> {
    const url = API_ENDPOINTS.SAVE_GROUP_PREFERENCE({
      baseUrl: this.inAppNotificationsBaseUrl,
      groupId,
    });

    return this.client.post(url, body);
  }

  async saveTopicPreference({
    topicId,
    body,
  }: SaveTopicPreferenceParams): Promise<unknown> {
    const url = API_ENDPOINTS.SAVE_TOPIC_PREFERENCE({
      baseUrl: this.inAppNotificationsBaseUrl,
      topicId,
    });

    return this.client.post(url, body);
  }
}

export const createHttpInAppNotificationTransport = (
  config: HttpTransportConfig
) => new HttpInAppNotificationTransport(config);
