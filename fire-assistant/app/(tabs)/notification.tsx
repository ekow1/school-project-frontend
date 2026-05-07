"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from "../../constants/theme"
import { AnimatedScreen } from "../../components/AnimatedScreen"
import { NotificationItem, useNotificationStore } from "../../store/notificationStore"

const TABS = ["All", "Recent", "History"]
const SCREEN_WIDTH = Dimensions.get("window").width

const typeConfig: Record<string, { icon: string; color: string; bg: string; gradient: readonly [string, string] }> = {
  alert: {
    icon: "flame",
    color: Colors.danger,
    bg: Colors.danger + "15",
    gradient: [Colors.danger, Colors.primary] as const,
  },
  incident: {
    icon: "flame",
    color: Colors.danger,
    bg: Colors.danger + "15",
    gradient: [Colors.danger, Colors.primary] as const,
  },
  turnout_slip: {
    icon: "clipboard",
    color: Colors.accent,
    bg: Colors.accent + "15",
    gradient: [Colors.accent, Colors.primary] as const,
  },
  login: {
    icon: "log-in",
    color: Colors.success,
    bg: Colors.success + "15",
    gradient: [Colors.success, Colors.primary] as const,
  },
  info: {
    icon: "information-circle",
    color: Colors.info,
    bg: Colors.info + "15",
    gradient: [Colors.info, Colors.accent] as const,
  },
  tip: {
    icon: "bulb",
    color: Colors.warning,
    bg: Colors.warning + "15",
    gradient: [Colors.warning, "#F97316"] as const,
  },
  success: {
    icon: "checkmark-circle",
    color: Colors.success,
    bg: Colors.success + "15",
    gradient: [Colors.success, Colors.success] as const,
  },
  history: {
    icon: "time",
    color: Colors.tertiary,
    bg: Colors.tertiary + "15",
    gradient: [Colors.tertiary, Colors.secondary] as const,
  },
}

const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: Colors.danger, label: "HIGH" },
  medium: { color: Colors.warning, label: "MED" },
  low: { color: Colors.success, label: "LOW" },
}

function NotificationIcon({ type, unread }: { type: string; unread: boolean }) {
  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.info

  return (
    <View style={[styles.iconWrapper, { backgroundColor: unread ? config.color : config.bg }]}>
      <Ionicons name={config.icon as any} size={22} color={unread ? Colors.surface : config.color} />
    </View>
  )
}

// Helper function to get category from notification type
const getCategoryFromType = (type: string): string => {
  switch (type) {
    case 'incident':
      return 'Emergency';
    case 'turnout_slip':
      return 'Turnout';
    case 'login':
      return 'Login';
    case 'alert':
      return 'Alert';
    case 'info':
      return 'Info';
    case 'tip':
      return 'Safety Tip';
    case 'success':
      return 'Success';
    default:
      return 'Notification';
  }
}

// Helper function to format timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 172800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function NotificationsList({ filter, notifications, onMarkAsRead }: { filter: string; notifications: NotificationItem[]; onMarkAsRead: (id: string) => void }) {
  const filterNotifications = (notifs: NotificationItem[], tab: string): NotificationItem[] => {
    // First filter by tab, then filter out turnout_slip from alert/incident views
    let filtered = notifs;

    if (tab === "All") {
      filtered = filtered.filter((n) => n.type !== 'turnout_slip');
    } else if (tab === "Recent") {
      filtered = filtered.filter((n) => !n.read && n.type !== 'turnout_slip');
    } else if (tab === "History") {
      filtered = filtered.filter((n) => n.read && n.type !== 'turnout_slip');
    }

    return filtered;
  }

  const filteredNotifications = filterNotifications(notifications, filter)

  return (
    <ScrollView contentContainerStyle={styles.notificationsList} showsVerticalScrollIndicator={false}>
      {filteredNotifications.map((notification, index) => {
        const typeInfo = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.info
        const priorityInfo = priorityConfig[notification.priority as keyof typeof priorityConfig]

        return (
          <TouchableOpacity
            key={notification.id}
            style={[styles.notificationCard, !notification.read && styles.unreadCard]}
            activeOpacity={0.95}
            onPress={() => onMarkAsRead(notification.id)}
          >
            {/* Priority Strip */}
            {!notification.read && <View style={[styles.priorityStrip, { backgroundColor: typeInfo.color }]} />}

            {/* Card Content */}
            <View style={styles.cardContent}>
              {/* Header Section */}
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <NotificationIcon type={notification.type} unread={!notification.read} />
                  <View style={styles.headerInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.notificationTitle} numberOfLines={1}>
                        {notification.title}
                      </Text>
                      {!notification.read && <View style={styles.unreadIndicator} />}
                    </View>
                    <View style={styles.metaRow}>
                      <View style={[styles.categoryBadge, { backgroundColor: typeInfo.bg }]}>
                        <Text style={[styles.categoryText, { color: typeInfo.color }]}>{getCategoryFromType(notification.type)}</Text>
                      </View>
                      <View style={[styles.priorityBadge, { backgroundColor: priorityInfo.color + "15" }]}>
                        <Text style={[styles.priorityText, { color: priorityInfo.color }]}>{priorityInfo.label}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={14} color={Colors.tertiary} />
                  <Text style={styles.timeText}>{formatTimestamp(notification.timestamp)}</Text>
                </View>
              </View>

              {/* Message Content */}
              <View style={styles.messageSection}>
                <Text style={styles.notificationMessage} numberOfLines={3}>
                  {notification.message}
                </Text>
              </View>

              {/* Footer Section */}
              {notification.data?.location && (
                <View style={styles.cardFooter}>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color={Colors.tertiary} />
                    <Text style={styles.locationText}>{notification.data.location}</Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )
      })}

      {filteredNotifications.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <Ionicons name="notifications-outline" size={48} color={Colors.tertiary} />
          </View>
          <Text style={styles.emptyStateText}>No notifications in this category</Text>
          <Text style={styles.emptyStateSubtext}>You're all caught up! Check back later for updates.</Text>
        </View>
      )}
    </ScrollView>
  )
}

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState(0)
  const indicatorAnim = useRef(new Animated.Value(0)).current
  const { notifications, markAsRead, markAllAsRead, initialize } = useNotificationStore()

  useEffect(() => {
    initialize()
  }, [])

  const handleTabPress = (idx: number) => {
    setActiveTab(idx)
    Animated.spring(indicatorAnim, {
      toValue: idx * (SCREEN_WIDTH / TABS.length),
      useNativeDriver: false,
      friction: 8,
      tension: 100,
    }).start()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8EF" />
      <AnimatedScreen direction="up" delay={100}>
        <View style={styles.container}>
          {/* Enhanced Header */}
          <View style={styles.headerBlock}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <Text style={styles.headerSubtitle}>Emergency alerts & safety updates</Text>
              </View>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.markAllReadButton} onPress={markAllAsRead}>
                <Text style={styles.markAllReadText}>MARK ALL READ</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Enhanced Tab Bar */}
          <View style={styles.topBar}>
            <View style={styles.tabContainer}>
              {TABS.map((tab, idx) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === idx && styles.activeTab]}
                  onPress={() => handleTabPress(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, activeTab === idx && styles.activeTabText]}>{tab}</Text>
                  {activeTab === idx && <View style={styles.tabActiveIndicator} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <NotificationsList filter={TABS[activeTab]} notifications={notifications} onMarkAsRead={markAsRead} />
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  )
}

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NB.bg },
  container: { flex: 1, backgroundColor: NB.bg },

  headerBlock: { backgroundColor: NB.surface, borderBottomWidth: 3, borderBottomColor: NB.border },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: NB.border, textTransform: "uppercase", letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 12, color: NB.muted, fontWeight: "600", marginTop: 2 },
  unreadBadge: {
    backgroundColor: NB.primary, borderWidth: 2, borderColor: NB.border,
    paddingHorizontal: 10, paddingVertical: 5, minWidth: 36, alignItems: "center",
    shadowColor: NB.border, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  unreadBadgeText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  markAllReadButton: { paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#D4C4B5" },
  markAllReadText: { color: NB.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1 },

  topBar: { backgroundColor: NB.surface, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: NB.border },
  tabContainer: { flexDirection: "row", gap: 8 },
  tab: {
    flex: 1, alignItems: "center", paddingVertical: 10,
    borderWidth: 2, borderColor: NB.border, backgroundColor: NB.bg,
  },
  activeTab: { backgroundColor: NB.primary, shadowColor: NB.border, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
  tabText: { fontSize: 12, color: NB.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  activeTabText: { color: "#fff", fontWeight: "800" },
  tabActiveIndicator: { display: "none" },

  notificationsList: { padding: 16, gap: 12 },

  notificationCard: {
    backgroundColor: NB.surface,
    borderWidth: 2, borderColor: NB.border,
    overflow: "hidden", position: "relative",
    ...nbShadow,
  },
  unreadCard: { borderColor: NB.primary, borderWidth: 3 },
  priorityStrip: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5, zIndex: 1 },
  cardContent: { padding: 14, paddingLeft: 18 },

  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  headerLeft: { flexDirection: "row", alignItems: "flex-start", flex: 1, marginRight: 10 },
  headerInfo: { flex: 1, marginLeft: 10 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  notificationTitle: { fontSize: 14, fontWeight: "800", color: NB.border, flex: 1, marginRight: 6 },
  unreadIndicator: { width: 8, height: 8, backgroundColor: NB.primary, borderWidth: 1, borderColor: NB.border },

  metaRow: { flexDirection: "row", gap: 6 },
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 3, borderWidth: 2, borderColor: NB.border },
  categoryText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8 },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 3, borderWidth: 2, borderColor: NB.border },
  priorityText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },

  timeContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  timeText: { fontSize: 11, color: NB.muted, fontWeight: "600" },

  iconWrapper: { width: 40, height: 40, borderWidth: 2, borderColor: NB.border, justifyContent: "center", alignItems: "center" },
  iconGradient: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

  messageSection: { marginBottom: 10 },
  notificationMessage: { fontSize: 13, color: NB.muted, lineHeight: 19 },

  cardFooter: { flexDirection: "row", alignItems: "center", marginTop: 8, paddingTop: 10, borderTopWidth: 2, borderTopColor: NB.border },
  locationContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 11, color: NB.muted },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 2, borderColor: NB.border },
  actionButtonText: { fontSize: 11, color: NB.primary, fontWeight: "700" },

  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyStateIcon: { marginBottom: 16 },
  emptyStateText: { fontSize: 18, fontWeight: "800", color: NB.border, marginBottom: 8, textTransform: "uppercase" },
  emptyStateSubtext: { fontSize: 13, color: NB.muted, textAlign: "center" },
})
