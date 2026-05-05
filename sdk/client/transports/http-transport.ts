import { API_ENDPOINTS } from '@/client/config/endpoints';
import { HttpClient } from '@/client/lib/http-client';
import {
  CustomerPreferenceGroup,
  Customer,
  GetCustomerByIdParams,
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
  private readonly projectScopeBaseUrl: string;

  constructor(config: HttpTransportConfig) {
    this.inAppNotificationsBaseUrl = config.inAppNotificationsBaseUrl;
    this.projectScopeBaseUrl = config.projectScopeBaseUrl;
    this.client = new HttpClient({
      accessToken: config.accessToken,
      orgId: config.orgId,
      fetch: config.fetch,
      defaultHeaders: config.defaultHeaders,
    });
  }

  async getAllInAppNotifications({
    customerId,
    page = 1,
    size = 10,
    isRead,
  }: GetAllInAppNotificationsParams): Promise<InAppNotification[]> {
    const url = API_ENDPOINTS.GET_ALL_INAPP_NOTIFICATIONS({
      baseUrl: this.inAppNotificationsBaseUrl,
      customerId,
      page,
      size,
      isRead,
    });

    return this.client.get<InAppNotification[]>(url);
  }

  async markInAppNotificationAsRead({
    notificationId,
    customerId,
  }: MarkInAppNotificationAsReadParams): Promise<unknown> {
    const url = API_ENDPOINTS.MARK_INAPP_NOTIFICATION_AS_READ({
      baseUrl: this.inAppNotificationsBaseUrl,
      notificationId,
      customerId,
    });

    return this.client.put(url);
  }

  async markAllInAppNotificationsAsRead({
    customerId,
  }: MarkAllInAppNotificationsAsReadParams): Promise<unknown> {
    const url = API_ENDPOINTS.MARK_ALL_INAPP_NOTIFICATIONS_AS_READ({
      baseUrl: this.inAppNotificationsBaseUrl,
      customerId,
    });

    return this.client.put(url);
  }

  async getUnreadInAppNotificationsCount({
    customerId,
  }: GetUnreadInAppNotificationsCountParams): Promise<unknown> {
    const url = API_ENDPOINTS.GET_UNREAD_INAPP_NOTIFICATIONS_COUNT({
      baseUrl: this.inAppNotificationsBaseUrl,
      customerId,
    });

    return this.client.get(url);
  }

  async getCustomerPreferences({
    projectId,
    customerId,
  }: GetCustomerPreferencesParams): Promise<CustomerPreferenceGroup[] | unknown> {
    const url = API_ENDPOINTS.GET_CUSTOMER_PREFERENCES({
      baseUrl: this.inAppNotificationsBaseUrl,
      projectId,
      customerId,
    });

    return this.client.get<CustomerPreferenceGroup[] | unknown>(url);
  }

  async saveGroupPreference({
    projectId,
    customerId,
    groupId,
    body,
  }: SaveGroupPreferenceParams): Promise<unknown> {
    const url = API_ENDPOINTS.SAVE_GROUP_PREFERENCE({
      baseUrl: this.inAppNotificationsBaseUrl,
      projectId,
      customerId,
      groupId,
    });

    return this.client.post(url, body);
  }

  async saveTopicPreference({
    projectId,
    customerId,
    topicId,
    body,
  }: SaveTopicPreferenceParams): Promise<unknown> {
    const url = API_ENDPOINTS.SAVE_TOPIC_PREFERENCE({
      baseUrl: this.inAppNotificationsBaseUrl,
      projectId,
      customerId,
      topicId,
    });

    return this.client.post(url, body);
  }

  async getCustomerById({
    projectId,
    customerPoolModule,
    customerPoolId,
    customerId,
    attributeTypes = 'all',
  }: GetCustomerByIdParams): Promise<Customer> {
    const url = API_ENDPOINTS.GET_CUSTOMER_BY_ID({
      baseUrl: this.projectScopeBaseUrl,
      projectId,
      customerPoolModule,
      customerPoolId,
      customerId,
      attributeTypes,
    });

    return this.client.get<Customer>(url);
  }
}

export const createHttpInAppNotificationTransport = (
  config: HttpTransportConfig
) => new HttpInAppNotificationTransport(config);
