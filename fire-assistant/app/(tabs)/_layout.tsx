import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

const Colors = {
  primary: "#D32F2F",
  primaryLight: "#FF6659",
  primaryDark: "#9A0007",
  secondary: "#1A1A1A",
  tertiary: "#6B7280",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: insets.bottom + 8,
          paddingTop: 6,
          height: 80 + insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarButton: (props) => {
          const filteredProps = Object.fromEntries(Object.entries(props).filter(([_, v]) => v !== null));
          return (
            <TouchableOpacity
              {...filteredProps}
              activeOpacity={0.7}
              style={[
                props.style,
                {
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            />
          );
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "flame" : "flame-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="news-feed"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "newspaper" : "newspaper-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "notifications" : "notifications-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          title: 'Incidents',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "document-text" : "document-text-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="fire-stations"
        options={{
          title: 'Stations',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "business" : "business-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => {
            const hasProfileImage = user?.image;
            
            if (hasProfileImage) {
              return (
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    overflow: 'hidden',
                    borderWidth: focused ? 2 : 1,
                    borderColor: focused ? Colors.primary : Colors.border,
                  }}
                >
                  <Image
                    source={{ uri: user.image }}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="cover"
                  />
                </View>
              );
            }
            
            return (
              <Ionicons 
                name={focused ? "person-circle" : "person-circle-outline"} 
                size={28} 
                color={color} 
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
