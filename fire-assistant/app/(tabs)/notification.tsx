"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRef, useState } from "react"
import { Animated, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnimatedScreen } from "../../components/AnimatedScreen"

const TABS = ["All", "Recent", "History"]
const SCREEN_WIDTH = Dimensions.get("window").width

const Colors = {
  primary: "#e02a1f",
  primaryLight: "#FF6659",
  secondary: "#1A1A1A",
  tertiary: "#6B7280",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  accent: "#8B5CF6",
  danger: "#EF4444",
  info: "#3B82F6",
}

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "Emergency Fire Alert",
    message: "Fire reported at Osu Market. Emergency units dispatched. Stay clear of the area for your safety.",
    time: "2m ago",
    type: "alert",
    unread: true,
    priority: "high",
    location: "Osu Market, Accra",
    category: "Emergency",
  },
  {
    id: "2",
    title: "Rescue Operation Complete",
    message: "Successful rescue operation completed at Ridge Hospital. All personnel safe and accounted for.",
    time: "1h ago",
    type: "info",
    unread: false,
    priority: "medium",
    location: "Ridge Hospital",
    category: "Update",
  },
  {
    id: "3",
    title: "Monthly Safety Reminder",
    message: "Remember to check your smoke detectors monthly and replace batteries as needed for optimal safety.",
    time: "Today",
    type: "tip",
    unread: true,
    priority: "low",
    location: "General",
    category: "Safety Tip",
  },
  {
    id: "4",
    title: "Incident Successfully Resolved",
    message: "Minor fire incident in Labadi Apartment complex has been fully resolved. No casualties reported.",
    time: "Yesterday",
    type: "success",
    unread: false,
    priority: "medium",
    location: "Labadi, Accra",
    category: "Resolution",
  },
  {
    id: "5",
    title: "Fire Safety Drill Completed",
    message: "Scheduled fire drill conducted at Accra Mall. All safety protocols executed successfully.",
    time: "2 days ago",
    type: "history",
    unread: false,
    priority: "low",
    location: "Accra Mall",
    category: "Training",
  },
  {
    id: "6",
    title: "Equipment Maintenance Alert",
    message:
      "Routine maintenance scheduled for fire safety equipment in your area. Brief service interruption expected.",
    time: "3 days ago",
    type: "info",
    unread: false,
    priority: "low",
    location: "East Legon",
    category: "Maintenance",
  },
]

const typeConfig = {
  alert: {
    icon: "flame",
    color: Colors.danger,
    bg: Colors.danger + "15",
    gradient: [Colors.danger, Colors.primary] as const,
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
    gradient: [Colors.success, "#059669"] as const,
  },
  history: {
    icon: "time",
    color: Colors.tertiary,
    bg: Colors.tertiary + "15",
    gradient: [Colors.tertiary, "#4B5563"] as const,
  },
}

const priorityConfig = {
  high: { color: Colors.danger, label: "HIGH" },
  medium: { color: Colors.warning, label: "MED" },
  low: { color: Colors.success, label: "LOW" },
}

function NotificationIcon({ type, unread }: { type: string; unread: boolean }) {
  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.info

  return (
    <View style={[styles.iconWrapper, { backgroundColor: config.bg }]}>
      {unread ? (
        <LinearGradient colors={config.gradient} style={styles.iconGradient}>
          <Ionicons name={config.icon as any} size={24} color={Colors.surface} />
        </LinearGradient>
      ) : (
        <Ionicons name={config.icon as any} size={24} color={config.color} />
      )}
    </View>
  )
}

function filterNotifications(tab: string) {
  if (tab === "All") return MOCK_NOTIFICATIONS
  if (tab === "Recent") return MOCK_NOTIFICATIONS.filter((n) => n.unread)
  if (tab === "History") return MOCK_NOTIFICATIONS.filter((n) => !n.unread)
  return MOCK_NOTIFICATIONS
}

function NotificationsList({ filter }: { filter: string }) {
  const notifications = filterNotifications(filter)

  return (
    <ScrollView contentContainerStyle={styles.notificationsList} showsVerticalScrollIndicator={false}>
      {notifications.map((notification, index) => {
        const typeInfo = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.info
        const priorityInfo = priorityConfig[notification.priority as keyof typeof priorityConfig]

        return (
          <TouchableOpacity
            key={notification.id}
            style={[styles.notificationCard, notification.unread && styles.unreadCard]}
            activeOpacity={0.95}
          >
            {/* Priority Strip */}
            {notification.unread && <LinearGradient colors={typeInfo.gradient} style={styles.priorityStrip} />}

            {/* Card Content */}
            <View style={styles.cardContent}>
              {/* Header Section */}
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <NotificationIcon type={notification.type} unread={notification.unread} />
                  <View style={styles.headerInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.notificationTitle} numberOfLines={1}>
                        {notification.title}
                      </Text>
                      {notification.unread && <View style={styles.unreadIndicator} />}
                    </View>
                    <View style={styles.metaRow}>
                      <View style={[styles.categoryBadge, { backgroundColor: typeInfo.bg }]}>
                        <Text style={[styles.categoryText, { color: typeInfo.color }]}>{notification.category}</Text>
                      </View>
                      <View style={[styles.priorityBadge, { backgroundColor: priorityInfo.color + "15" }]}>
                        <Text style={[styles.priorityText, { color: priorityInfo.color }]}>{priorityInfo.label}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={14} color={Colors.tertiary} />
                  <Text style={styles.timeText}>{notification.time}</Text>
                </View>
              </View>

              {/* Message Content */}
              <View style={styles.messageSection}>
                <Text style={styles.notificationMessage} numberOfLines={3}>
                  {notification.message}
                </Text>
              </View>

              {/* Footer Section */}
              <View style={styles.cardFooter}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={14} color={Colors.tertiary} />
                  <Text style={styles.locationText}>{notification.location}</Text>
                </View>

                <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                  <Text style={styles.actionButtonText}>View</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )
      })}

      {notifications.length === 0 && (
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

  const handleTabPress = (idx: number) => {
    setActiveTab(idx)
    Animated.spring(indicatorAnim, {
      toValue: idx * (SCREEN_WIDTH / TABS.length),
      useNativeDriver: false,
      friction: 8,
      tension: 100,
    }).start()
  }

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <AnimatedScreen direction="up" delay={100}>
        <View style={styles.container}>
        {/* Enhanced Header */}
        <LinearGradient colors={[Colors.surface, Colors.background]} style={styles.headerGradient}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>Stay updated with emergency alerts and safety information</Text>
            </View>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.unreadBadgeGradient}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </LinearGradient>

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

        <NotificationsList filter={TABS[activeTab]} />
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Enhanced Header Styles
  headerGradient: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.tertiary,
    fontWeight: "500",
  },
  unreadBadge: {
    borderRadius: 20,
    overflow: "hidden",
  },
  unreadBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: "center",
  },
  unreadBadgeText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: "700",
  },

  // Enhanced Tab Bar
  topBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 2,
    position: "relative",
  },
  activeTab: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabText: {
    fontSize: 14,
    color: Colors.tertiary,
    fontWeight: "600",
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "700",
  },
  tabActiveIndicator: {
    position: "absolute",
    bottom: 4,
    width: 20,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  // Notifications List
  notificationsList: {
    padding: 20,
    gap: 16,
  },

  // Enhanced Notification Card
  notificationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    position: "relative",
  },
  unreadCard: {
    borderColor: Colors.primary + "30",
    backgroundColor: Colors.primary + "05",
  },

  priorityStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 1,
  },

  cardContent: {
    padding: 20,
    paddingLeft: 24,
  },

  // Enhanced Card Header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.secondary,
    flex: 1,
    marginRight: 8,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    color: Colors.tertiary,
    fontWeight: "500",
  },

  // Enhanced Icon Styles
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Message Section
  messageSection: {
    marginBottom: 16,
  },
  notificationMessage: {
    fontSize: 15,
    color: Colors.tertiary,
    lineHeight: 22,
  },

  // Enhanced Card Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: Colors.tertiary,
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  actionButtonText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },

  // Enhanced Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.tertiary,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
}) 