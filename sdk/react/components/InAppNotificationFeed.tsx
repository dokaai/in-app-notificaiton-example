import { InAppNotification } from '@/shared/types';
import { InAppNotificationCard } from '@/react/components/InAppNotificationCard';

export interface InAppNotificationFeedProps {
  notifications?: InAppNotification[];
  emptyText?: string;
}

export const InAppNotificationFeed = ({
  notifications = [],
  emptyText = 'No notifications found.',
}: InAppNotificationFeedProps) => {
  if (notifications.length === 0) {
    return <div>{emptyText}</div>;
  }

  return (
    <div>
      {notifications.map((notification, index) => (
        <InAppNotificationCard
          key={notification.id || `${index}`}
          notification={notification}
        />
      ))}
    </div>
  );
};
