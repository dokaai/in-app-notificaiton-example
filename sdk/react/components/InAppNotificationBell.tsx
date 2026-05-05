export interface InAppNotificationBellProps {
  unreadCount?: number;
}

export const InAppNotificationBell = ({
  unreadCount = 0,
}: InAppNotificationBellProps) => {
  return (
    <button type='button' aria-label='Open notifications'>
      Notifications
      {unreadCount > 0 ? ` (${unreadCount})` : ''}
    </button>
  );
};
