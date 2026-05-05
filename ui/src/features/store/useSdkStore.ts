import { create } from "zustand";
import { MOCK_NOTIFICATIONS } from "@/features/constants/mockNotifications";
import { clearAuthFromStorage, readAuthFromStorage, saveAuthToStorage, saveJwtTokenToStorage } from "@/features/utils/storage";
import { CustomerDetails, LoginPayload } from "@/features/types/auth.types";
import { InAppNotificationItem } from "@/features/types/notification.types";
import { SocketStatus } from "@/features/types/socket.types";

interface SdkState {
  isHydrated: boolean;
  isAuthenticated: boolean;
  projectId: string;
  orgId: string;
  customerPoolId: string;
  customerId: string;
  jwtToken: string;
  customerDetails: CustomerDetails | null;
  socketStatus: SocketStatus;
  notifications: InAppNotificationItem[];
  unreadCount: number;
  notificationsLoading: boolean;
  notificationsError: string | null;
  socketSubscriptionNonce: number;
  login: (payload: LoginPayload) => void;
  logout: () => void;
  initializeFromStorage: () => void;
  updateJwtToken: (jwtToken: string) => void;
  setCustomerDetails: (customerDetails: CustomerDetails | null) => void;
  setNotifications: (notifications: InAppNotificationItem[]) => void;
  setUnreadCount: (count: number) => void;
  upsertNotification: (notification: InAppNotificationItem) => void;
  markNotificationAsRead: (notificationId: string) => void;
  setNotificationsLoading: (isLoading: boolean) => void;
  setNotificationsError: (error: string | null) => void;
  setSocketStatus: (status: SocketStatus) => void;
  bumpSocketSubscriptionNonce: () => void;
  reconnectSocketMock: () => void;
  markAllAsRead: () => void;
  refreshNotificationsMock: () => void;
  addMockNotification: () => void;
}

export const useSdkStore = create<SdkState>((set, get) => ({
  isHydrated: false,
  isAuthenticated: false,
  projectId: "",
  orgId: "",
  customerPoolId: "",
  customerId: "",
  jwtToken: "",
  customerDetails: null,
  socketStatus: "disconnected",
  notifications: [],
  unreadCount: 0,
  notificationsLoading: false,
  notificationsError: null,
  socketSubscriptionNonce: 0,
  login: ({ projectId, orgId, customerPoolId, customerId, jwtToken }) => {
    saveAuthToStorage({ projectId, orgId, customerPoolId, customerId, jwtToken });
    set({
      isAuthenticated: true,
      projectId,
      orgId,
      customerPoolId,
      customerId,
      jwtToken,
      customerDetails: null,
      socketStatus: "disconnected",
      unreadCount: 0,
      socketSubscriptionNonce: 0,
    });
  },
  logout: () => {
    clearAuthFromStorage();
    set({
      isAuthenticated: false,
      projectId: "",
      orgId: "",
      customerPoolId: "",
      customerId: "",
      jwtToken: "",
      customerDetails: null,
      socketStatus: "disconnected",
      notifications: [],
      unreadCount: 0,
      notificationsLoading: false,
      notificationsError: null,
      socketSubscriptionNonce: 0,
    });
  },
  initializeFromStorage: () => {
    if (get().isHydrated) {
      return;
    }

    const auth = readAuthFromStorage();

    if (!auth) {
      set({ isHydrated: true, socketStatus: "disconnected" });
      return;
    }

    set({
      isHydrated: true,
      isAuthenticated: true,
      projectId: auth.projectId,
      orgId: auth.orgId,
      customerPoolId: auth.customerPoolId,
      customerId: auth.customerId,
      jwtToken: auth.jwtToken,
      customerDetails: null,
      socketStatus: "disconnected",
    });
  },
  updateJwtToken: (jwtToken) => {
    saveJwtTokenToStorage(jwtToken);
    set({ jwtToken });
  },
  setCustomerDetails: (customerDetails) => set({ customerDetails }),
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  upsertNotification: (notification) =>
    set((state) => {
      const existing = state.notifications.find((item) => item.id === notification.id);

      if (!existing) {
        return {
          unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
          notifications: [notification, ...state.notifications],
        };
      }

      return {
        unreadCount:
          existing.isRead || !notification.isRead
            ? state.unreadCount
            : Math.max(0, state.unreadCount - 1),
        notifications: state.notifications.map((item) =>
          item.id === notification.id ? notification : item
        ),
      };
    }),
  markNotificationAsRead: (notificationId) =>
    set((state) => {
      const target = state.notifications.find((notification) => notification.id === notificationId);

      return {
        unreadCount:
          target && !target.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        notifications: state.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        ),
      };
    }),
  setNotificationsLoading: (notificationsLoading) => set({ notificationsLoading }),
  setNotificationsError: (notificationsError) => set({ notificationsError }),
  setSocketStatus: (status) => set({ socketStatus: status }),
  bumpSocketSubscriptionNonce: () =>
    set((state) => ({
      socketSubscriptionNonce: state.socketSubscriptionNonce + 1,
    })),
  reconnectSocketMock: () => {
    set({ socketStatus: "connecting" });
    window.setTimeout(() => {
      set({ socketStatus: "connected" });
    }, 900);
  },
  markAllAsRead: () =>
    set((state) => ({
      unreadCount: 0,
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    })),
  refreshNotificationsMock: () => {
    set({ notificationsLoading: true, notificationsError: null });
    window.setTimeout(() => {
      set({
        notificationsLoading: false,
        notifications: [...get().notifications],
      });
    }, 800);
  },
  addMockNotification: () =>
    set((state) => ({
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: "New in-app notification received",
          subtitle: "Mock real-time event",
          body: "This notification was added from the demo control panel. Real socket events will be connected later.",
          timestamp: new Date().toISOString(),
          isRead: false,
          tags: [
            { id: "mock-live-demo", label: "Live Demo" },
            { id: "mock-event", label: "Mock Event" },
          ],
          actions: [{ id: "open", label: "Open" }],
        },
        ...state.notifications,
      ],
    })),
}));
