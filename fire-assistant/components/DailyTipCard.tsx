import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { StyleSheet, Text, View } from "react-native"

const C = {
  primary: "#C41230",
  secondary: "#1A1A1A",
  surface: "#FFFFFF",
}

interface DailyTipCardProps {
  title: string
  content: string
}

export const DailyTipCard: React.FC<DailyTipCardProps> = ({ title, content }) => {
  return (
    <View style={styles.card}>
      {/* header strip */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="bulb" size={14} color={C.surface} />
          <Text style={styles.badgeText}>SAFETY TIP</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{content}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.primary,
    borderWidth: 2,
    borderColor: C.secondary,
    padding: 20,
    shadowColor: C.secondary,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  header: { marginBottom: 14 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  badgeText: {
    color: C.surface,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: C.surface,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    lineHeight: 22,
    fontWeight: "500",
  },
})

export default DailyTipCard
