import {
  GetUnreadInAppNotificationsCountParams,
  GetAllInAppNotificationsParams,
  InAppNotification,
  MarkAllInAppNotificationsAsReadParams,
  MarkInAppNotificationAsReadParams,
} from './inapp-notification';
import {
  CustomerPreferenceGroup,
  GetCustomerPreferencesParams,
  SaveGroupPreferenceParams,
  SaveTopicPreferenceParams,
} from './preference';

export interface InAppNotificationTransport {
  getAllInAppNotifications(
    params: GetAllInAppNotificationsParams
  ): Promise<InAppNotification[]>;
  markInAppNotificationAsRead(
    params: MarkInAppNotificationAsReadParams
  ): Promise<unknown>;
  markAllInAppNotificationsAsRead(
    params: MarkAllInAppNotificationsAsReadParams
  ): Promise<unknown>;
  getUnreadInAppNotificationsCount(
    params: GetUnreadInAppNotificationsCountParams
  ): Promise<unknown>;
  getCustomerPreferences(
    params: GetCustomerPreferencesParams
  ): Promise<CustomerPreferenceGroup[] | unknown>;
  saveGroupPreference(
    params: SaveGroupPreferenceParams
  ): Promise<unknown>;
  saveTopicPreference(
    params: SaveTopicPreferenceParams
  ): Promise<unknown>;
}

export interface HttpTransportConfig {
  inAppNotificationsBaseUrl: string;
  projectScopeBaseUrl?: string;
  accessToken?: string;
  authToken?: string;
  fetch?: typeof fetch;
  defaultHeaders?: HeadersInit;
}
