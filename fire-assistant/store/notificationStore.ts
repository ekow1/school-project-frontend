import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: 'turnout_slip' | 'incident' | 'login' | 'alert' | 'info';
    priority: 'high' | 'medium' | 'low';
    timestamp: string;
    read: boolean;
    data?: {
        reportId?: string;
        incidentType?: string;
        location?: string;
        officerId?: string;
    };
}

interface NotificationState {
    notifications: NotificationItem[];
    unreadCount: number;
    hasNewTurnoutSlip: boolean;
    hasNewIncident: boolean;
    lastIncidentId: string | null;
    lastTurnoutSlipId: string | null;

    // Actions
    addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    setNewTurnoutSlip: (reportId: string) => void;
    setNewIncident: (reportId: string) => void;
    clearNewTurnoutSlip: () => void;
    clearNewIncident: () => void;
    initialize: () => Promise<void>;
}

const NOTIFICATIONS_KEY = '@notifications';
const NEW_INCIDENT_KEY = '@new_incident_id';
const NEW_TURNOUT_SLIP_KEY = '@new_turnout_slip_id';

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    hasNewTurnoutSlip: false,
    hasNewIncident: false,
    lastIncidentId: null,
    lastTurnoutSlipId: null,

    addNotification: async (notificationData) => {
        // Check if notification already exists to avoid duplicates
        const existingNotifications = get().notifications;
        const isDuplicate = existingNotifications.some(
            (n) =>
                n.title === notificationData.title &&
                n.message === notificationData.message &&
                n.type === notificationData.type &&
                // Only consider duplicates within the last 30 seconds
                new Date(n.timestamp).getTime() > Date.now() - 30000
        );

        if (isDuplicate) {
            console.log('Notification already exists, skipping duplicate');
            return;
        }

        const newNotification: NotificationItem = {
            ...notificationData,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            read: false,
        };

        set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));

        // Persist to AsyncStorage
        try {
            const currentNotifications = get().notifications;
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(currentNotifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    },

    markAsRead: async (id: string) => {
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
        }));

        // Persist to AsyncStorage
        try {
            const currentNotifications = get().notifications;
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(currentNotifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    },

    markAllAsRead: async () => {
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        }));

        // Persist to AsyncStorage
        try {
            const currentNotifications = get().notifications;
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(currentNotifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    },

    removeNotification: async (id: string) => {
        set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            const unreadCount = notification && !notification.read
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount;

            return {
                notifications: state.notifications.filter((n) => n.id !== id),
                unreadCount,
            };
        });

        // Persist to AsyncStorage
        try {
            const currentNotifications = get().notifications;
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(currentNotifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    },

    clearAll: async () => {
        set({
            notifications: [],
            unreadCount: 0,
        });

        // Clear from AsyncStorage
        try {
            await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    },

    setNewTurnoutSlip: async (reportId: string) => {
        set({
            hasNewTurnoutSlip: true,
            lastTurnoutSlipId: reportId,
        });

        // Persist to AsyncStorage
        try {
            await AsyncStorage.setItem(NEW_TURNOUT_SLIP_KEY, reportId);
        } catch (error) {
            console.error('Error saving turnout slip status:', error);
        }
    },

    setNewIncident: async (reportId: string) => {
        set({
            hasNewIncident: true,
            lastIncidentId: reportId,
        });

        // Persist to AsyncStorage
        try {
            await AsyncStorage.setItem(NEW_INCIDENT_KEY, reportId);
        } catch (error) {
            console.error('Error saving incident status:', error);
        }
    },

    clearNewTurnoutSlip: async () => {
        set({
            hasNewTurnoutSlip: false,
            lastTurnoutSlipId: null,
        });

        // Clear from AsyncStorage
        try {
            await AsyncStorage.removeItem(NEW_TURNOUT_SLIP_KEY);
        } catch (error) {
            console.error('Error clearing turnout slip status:', error);
        }
    },

    clearNewIncident: async () => {
        set({
            hasNewIncident: false,
            lastIncidentId: null,
        });

        // Clear from AsyncStorage
        try {
            await AsyncStorage.removeItem(NEW_INCIDENT_KEY);
        } catch (error) {
            console.error('Error clearing incident status:', error);
        }
    },

    initialize: async () => {
        try {
            // Load notifications
            const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
            if (notificationsJson) {
                const notifications = JSON.parse(notificationsJson);
                const unreadCount = notifications.filter((n: NotificationItem) => !n.read).length;
                set({ notifications, unreadCount });
            }

            // Load incident status
            const lastIncidentId = await AsyncStorage.getItem(NEW_INCIDENT_KEY);
            if (lastIncidentId) {
                set({ hasNewIncident: true, lastIncidentId });
            }

            // Load turnout slip status
            const lastTurnoutSlipId = await AsyncStorage.getItem(NEW_TURNOUT_SLIP_KEY);
            if (lastTurnoutSlipId) {
                set({ hasNewTurnoutSlip: true, lastTurnoutSlipId });
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    },
}));
