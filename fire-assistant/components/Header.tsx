import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import {
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

const C = {
  primary: "#C41230",
  secondary: "#1A1A1A",
  surface: "#FFFFFF",
  bg: "#FFF8EF",
}

interface HeaderProps {
  onEmergencyCall?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onEmergencyCall }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user } = useAuthStore()
  const firstName = user?.name?.split(" ")[0] ?? ""

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean
    type: "confirm"
    title: string
    message: string
    onConfirm?: () => void
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
  }>({ visible: false, type: "confirm", title: "", message: "" })

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const hour = currentTime.getHours()
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"

  const timeStr = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  const dial = (number: string) => {
    setAlertConfig({
      visible: true,
      type: "confirm",
      title: "Emergency Call",
      message: `Call emergency number ${number}?`,
      confirmText: "Call Now",
      cancelText: "Cancel",
      onConfirm: () => {
        setAlertConfig(p => ({ ...p, visible: false }))
        Linking.openURL(`tel:${number}`)
        onEmergencyCall?.()
      },
      onCancel: () => setAlertConfig(p => ({ ...p, visible: false })),
    })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={styles.header}>
        {/* Left: icon + greeting */}
        <View style={styles.left}>
          <View style={styles.iconBox}>
            <Ionicons name="flame" size={22} color={C.surface} />
          </View>
          <View>
            <Text style={styles.greeting}>
              {greeting}
              {firstName ? <Text style={styles.name}>, {firstName}</Text> : null}
            </Text>
            <Text style={styles.time}>{timeStr}</Text>
          </View>
        </View>

        {/* Right: emergency buttons */}
        <View style={styles.right}>
          <Text style={styles.emergencyLabel}>EMERGENCY</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.callBtn} onPress={() => dial("192")} activeOpacity={0.75}>
              <Ionicons name="call" size={11} color={C.surface} />
              <Text style={styles.callBtnText}>192</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callBtn} onPress={() => dial("112")} activeOpacity={0.75}>
              <Ionicons name="call" size={11} color={C.surface} />
              <Text style={styles.callBtnText}>112</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
  safe: { backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 3,
    borderBottomColor: C.secondary,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: C.primary,
    borderWidth: 2,
    borderColor: C.secondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.secondary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  greeting: { fontSize: 15, fontWeight: "700", color: C.secondary },
  name: { color: C.primary, fontWeight: "800" },
  time: { fontSize: 11, color: "#6B7280", fontWeight: "600", marginTop: 2 },
  right: { alignItems: "flex-end" },
  emergencyLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: C.secondary,
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  btnRow: { flexDirection: "row", gap: 6 },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.primary,
    borderWidth: 2,
    borderColor: C.secondary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    shadowColor: C.secondary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  callBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
})

export default Header
