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
    customerId,
    page = 1,
    size = 10,
    isRead,
  }: GetAllInAppNotificationsParams) {
    return this.transport.getAllInAppNotifications({
      customerId,
      page,
      size,
      isRead,
    });
  }

  async markAsRead({
    notificationId,
    customerId,
  }: MarkInAppNotificationAsReadParams) {
    return this.transport.markInAppNotificationAsRead({
      notificationId,
      customerId,
    });
  }

  async markAllAsRead({
    customerId,
  }: MarkAllInAppNotificationsAsReadParams) {
    return this.transport.markAllInAppNotificationsAsRead({
      customerId,
    });
  }

  async getUnreadCount({
    customerId,
  }: GetUnreadInAppNotificationsCountParams) {
    return this.transport.getUnreadInAppNotificationsCount({
      customerId,
    });
  }
}
