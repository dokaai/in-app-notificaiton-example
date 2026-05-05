import { useMemo } from 'react';
import { InAppNotificationSdkClientConfig } from '@/client/sdk/client';
import { createInAppNotificationSdkClient } from '@/client';

export const useInAppNotificationsClient = (
  config: InAppNotificationSdkClientConfig
) =>
  useMemo(() => createInAppNotificationSdkClient(config), [config]);
