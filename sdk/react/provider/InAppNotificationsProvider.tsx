import { ReactNode, createContext, useContext } from 'react';
import { InAppUiConfig } from '@/react/types';

const InAppNotificationsUiContext = createContext<InAppUiConfig | null>(null);

export interface InAppNotificationsProviderProps {
  children: ReactNode;
  value?: InAppUiConfig;
}

export const InAppNotificationsProvider = ({
  children,
  value,
}: InAppNotificationsProviderProps) => (
  <InAppNotificationsUiContext.Provider value={value ?? {}}>
    {children}
  </InAppNotificationsUiContext.Provider>
);

export const useInAppNotificationsUi = () =>
  useContext(InAppNotificationsUiContext);
