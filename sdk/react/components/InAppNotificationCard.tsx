import { InAppNotification } from '@/shared/types';

export interface InAppNotificationCardProps {
  notification: InAppNotification;
}

export const InAppNotificationCard = ({
  notification,
}: InAppNotificationCardProps) => {
  const title =
    notification.content?.title || notification.title || 'Untitled notification';
  const body = notification.content?.body || notification.body || '';

  return (
    <article>
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
    </article>
  );
};
