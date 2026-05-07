import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useFireReportsStore } from '../../store/fireReportsStore';
import { useNotificationStore } from '../../store/notificationStore';

const C = {
  primary: "#C41230",
  secondary: "#1A1A1A",
  tertiary: "#78716C",
  surface: "#FFFFFF",
  border: "#1A1A1A",
  warning: "#E8A020",
  danger: "#EF4444",
}

function Badge({ count, color }: { count: number | string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  )
}

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const { user } = useAuthStore()
  const isFireOfficer = user?.userType === 'fire_officer'
  const { reports } = useFireReportsStore()
  const { hasNewTurnoutSlip, hasNewIncident, unreadCount } = useNotificationStore()

  const pendingCount = reports.filter((r: any) => {
    const s = r.status?.toLowerCase()
    return s === 'pending' || s === 'accepted'
  }).length

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.tertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFF8EF",
          borderTopWidth: 4,
          borderTopColor: C.secondary,
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,
          height: 72 + insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
        tabBarButton: (props: any) => {
          if (props.to === null || props.href === null) return null
          const filtered = Object.fromEntries(
            Object.entries(props).filter(([_, v]) => v !== null)
          )
          return (
            <TouchableOpacity
              {...filtered}
              activeOpacity={0.7}
              style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
            />
          )
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Ionicons name={focused ? "flame" : "flame-outline"} size={22} color={focused ? C.surface : color} />
            </View>
          ),
        }}
      />

      {/* Turnout — officers only */}
      <Tabs.Screen
        name="turnout-slip"
        options={{
          title: 'Turnout',
          href: isFireOfficer ? '/turnout-slip' : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[focused ? styles.activeIcon : undefined, { position: 'relative' }]}>
              <Ionicons name={focused ? "clipboard" : "clipboard-outline"} size={22} color={focused ? C.surface : color} />
              {(hasNewTurnoutSlip || pendingCount > 0) && (
                <Badge color={C.danger} count={pendingCount > 9 ? '9+' : (hasNewTurnoutSlip ? '!' : pendingCount)} />
              )}
            </View>
          ),
        }}
      />

      {/* Alerts */}
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Alerts',
          href: '/notification',
          tabBarIcon: ({ color, focused }) => (
            <View style={[focused ? styles.activeIcon : undefined, { position: 'relative' }]}>
              <Ionicons name={focused ? "notifications" : "notifications-outline"} size={22} color={focused ? C.surface : color} />
              {(hasNewIncident || unreadCount > 0) && (
                <Badge color={C.warning} count={unreadCount > 9 ? '9+' : (hasNewIncident ? '!' : unreadCount)} />
              )}
            </View>
          ),
        }}
      />

      {/* Incidents */}
      <Tabs.Screen
        name="incidents"
        options={{
          title: 'Incidents',
          href: '/incidents',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Ionicons name={focused ? "document-text" : "document-text-outline"} size={22} color={focused ? C.surface : color} />
            </View>
          ),
        }}
      />

      {/* AI Chat */}
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'Assistant',
          href: '/ai-chat',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={22} color={focused ? C.surface : color} />
            </View>
          ),
        }}
      />

      {/* Stations — officers only */}
      <Tabs.Screen
        name="fire-stations"
        options={{
          title: 'Stations',
          href: isFireOfficer ? '/fire-stations' : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Ionicons name={focused ? "business" : "business-outline"} size={22} color={focused ? C.surface : color} />
            </View>
          ),
        }}
      />

      {/* Officer Profile */}
      <Tabs.Screen
        name="officer-profile"
        options={{
          title: 'Profile',
          href: isFireOfficer ? '/officer-profile' : null,
          tabBarIcon: ({ color, focused }) => {
            if (user?.image) {
              return (
                <View style={[focused ? styles.activeIcon : undefined, { padding: focused ? 1 : 0 }]}>
                  <View style={[styles.avatarRing, { borderColor: focused ? C.surface : C.tertiary }]}>
                    <Image source={{ uri: user.image }} style={styles.avatar} resizeMode="cover" />
                  </View>
                </View>
              )
            }
            return (
              <View style={focused ? styles.activeIcon : undefined}>
                <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={22} color={focused ? C.surface : color} />
              </View>
            )
          },
        }}
      />

      {/* Hidden tabs */}
      <Tabs.Screen name="news-feed" options={{ title: 'News', href: null }} />

      {/* Regular user Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: isFireOfficer ? null : '/profile',
          tabBarIcon: ({ color, focused }) => {
            const u = useAuthStore.getState().user
            if (u?.image) {
              return (
                <View style={[focused ? styles.activeIcon : undefined, { padding: focused ? 1 : 0 }]}>
                  <View style={[styles.avatarRing, { borderColor: focused ? C.surface : C.tertiary }]}>
                    <Image source={{ uri: u.image }} style={styles.avatar} resizeMode="cover" />
                  </View>
                </View>
              )
            }
            return (
              <View style={focused ? styles.activeIcon : undefined}>
                <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={22} color={focused ? C.surface : color} />
              </View>
            )
          },
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  activeIcon: {
    backgroundColor: C.primary,
    borderWidth: 2,
    borderColor: C.border,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  avatarRing: {
    width: 24,
    height: 24,
    borderRadius: 0,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
})
