import { GetCustomerByIdParams } from './customer';
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
import { Customer } from './customer';

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
  getCustomerById(params: GetCustomerByIdParams): Promise<Customer>;
}

export interface HttpTransportConfig {
  inAppNotificationsBaseUrl: string;
  projectScopeBaseUrl: string;
  accessToken?: string;
  orgId?: string;
  fetch?: typeof fetch;
  defaultHeaders?: HeadersInit;
}
