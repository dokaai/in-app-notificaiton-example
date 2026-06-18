import { InAppNotificationsService } from '@/client/services/inapp-notifications';
import { PreferencesService } from '@/client/services/preferences';
import { InAppNotificationTransport } from '@/shared/types';

export interface InAppNotificationSdkClientConfig {
  transport: InAppNotificationTransport;
}

export class InAppNotificationSdkClient {
  readonly notifications: InAppNotificationsService;
  readonly preferences: PreferencesService;
  readonly transport: InAppNotificationTransport;

  constructor(config: InAppNotificationSdkClientConfig) {
    this.transport = config.transport;
    this.notifications = new InAppNotificationsService(this.transport);
    this.preferences = new PreferencesService(this.transport);
  }
}

export const createInAppNotificationSdkClient = (
  config: InAppNotificationSdkClientConfig
) => new InAppNotificationSdkClient(config);
