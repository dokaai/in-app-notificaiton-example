import { InAppNotification } from '@/shared/types';
import { InAppNotificationBell } from '@/react/components/InAppNotificationBell';
import { InAppNotificationFeed } from '@/react/components/InAppNotificationFeed';

export interface InAppNotificationPanelProps {
  notifications?: InAppNotification[];
  unreadCount?: number;
}

export const InAppNotificationPanel = ({
  notifications = [],
  unreadCount = 0,
}: InAppNotificationPanelProps) => {
  return (
    <section>
      <InAppNotificationBell unreadCount={unreadCount} />
      <InAppNotificationFeed notifications={notifications} />
    </section>
  );
};
