import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useState } from "react"
import {
    Dimensions,
    Linking,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { useAuthStore } from "../store/authStore"
import CustomAlert from "./CustomAlert"

const { width } = Dimensions.get("window")

interface HeaderProps {
  onEmergencyCall?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onEmergencyCall }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user } = useAuthStore()
  
  // Get user's first name
  const getFirstName = () => {
    if (!user?.name) return ''
    return user.name.split(' ')[0]
  }
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    visible: false,
    type: 'confirm',
    title: '',
    message: '',
  })

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  // Get time of day icon
  const getTimeIcon = () => {
    const hour = currentTime.getHours()
    if (hour < 6) return "moon"
    if (hour < 12) return "sunny"
    if (hour < 17) return "partly-sunny"
    if (hour < 20) return "partly-sunny"
    return "moon"
  }

  // Format time
  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const handleEmergencyCall = (number: string) => {
    setAlertConfig({
      visible: true,
      type: 'confirm',
      title: 'Emergency Call',
      message: `Are you sure you want to call ${number}? This will dial the emergency hotline.`,
      confirmText: 'Call Now',
      cancelText: 'Cancel',
      onConfirm: () => {
        setAlertConfig(prev => ({ ...prev, visible: false }))
        console.log(`Calling ${number}`)
        Linking.openURL(`tel:${number}`)
        onEmergencyCall?.()
      },
      onCancel: () => setAlertConfig(prev => ({ ...prev, visible: false })),
    })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <LinearGradient
        colors={["#ffffff", "#fafbfc"]}
        style={styles.headerContainer}
      >
        {/* Main Header Content */}
        <View style={styles.header}>
          {/* Left Side - Greeting and Time */}
          <View style={styles.leftSection}>
            <View style={styles.greetingContainer}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={getTimeIcon() as any} 
                  size={28} 
                  color="#d32f2f" 
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.greeting}>
                  {getGreeting()}
                  {getFirstName() && (
                    <Text style={styles.userName}> {getFirstName()}</Text>
                  )}
                </Text>
                <Text style={styles.time}>{formatTime()}</Text>
              </View>
            </View>
          </View>

          {/* Right Side - Emergency Numbers */}
          <View style={styles.rightSection}>
            <Text style={styles.emergencyLabel}>Emergency</Text>
            <View style={styles.emergencyButtons}>
              <TouchableOpacity 
                style={styles.emergencyButton} 
                onPress={() => handleEmergencyCall("192")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#d32f2f", "#b71c1c"]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="call" size={14} color="#ffffff" />
                  <Text style={styles.emergencyButtonText}>192</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.emergencyButton} 
                onPress={() => handleEmergencyCall("112")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#d32f2f", "#b71c1c"]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="call" size={14} color="#ffffff" />
                  <Text style={styles.emergencyButtonText}>112</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Border */}
        <View style={styles.bottomBorder} />
      </LinearGradient>
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 15,
    
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  leftSection: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    shadowColor: "#d32f2f",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    letterSpacing: -0.3,
    marginBottom: 4,
    lineHeight: 28,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#d32f2f",
    letterSpacing: -0.3,
  },
  time: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  emergencyLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emergencyButtons: {
    flexDirection: "row",
    gap: 8,
  },
  emergencyButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#d32f2f",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  emergencyButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  bottomBorder: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginTop: 15,
  },
})

export default Header 