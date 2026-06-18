import {
  GetAllInAppNotificationsParams,
  GetUnreadInAppNotificationsCountParams,
  InAppNotification,
  InAppNotificationTransport,
  MarkAllInAppNotificationsAsReadParams,
  MarkInAppNotificationAsReadParams,
} from '@/shared/types';

export class InAppNotificationsService {
  constructor(private readonly transport: InAppNotificationTransport) {}

  async getAll({
    page = 1,
    size = 10,
    isRead,
  }: GetAllInAppNotificationsParams) {
    return this.transport.getAllInAppNotifications({
      page,
      size,
      isRead,
    });
  }

  async markAsRead({
    notificationId,
  }: MarkInAppNotificationAsReadParams) {
    return this.transport.markInAppNotificationAsRead({
      notificationId,
    });
  }

  async markAllAsRead({}: MarkAllInAppNotificationsAsReadParams) {
    return this.transport.markAllInAppNotificationsAsRead({});
  }

  async getUnreadCount({}: GetUnreadInAppNotificationsCountParams) {
    return this.transport.getUnreadInAppNotificationsCount({});
  }
}
