import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"

const Colors = {
  primary: "#D32F2F",
  primaryLight: "#FF6659",
  primaryDark: "#9A0007",
  secondary: "#1A1A1A",
  tertiary: "#6B7280",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceVariant: "#F1F5F9",
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  accent: "#8B5CF6",
  shadow: "rgba(0, 0, 0, 0.1)",
}

interface DailyTipCardProps {
  tip: string
  onPress?: () => void
}

export const DailyTipCard: React.FC<DailyTipCardProps> = ({
  tip,
  onPress,
}) => {
  return (
    <View style={styles.dailyTipCard}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.tipGradient}
      >
        <View style={styles.tipHeader}>
          <View style={styles.tipBadge}>
            <Ionicons name="bulb" size={16} color={Colors.surface} />
            <Text style={styles.tipBadgeText}>Daily Safety Tip</Text>
          </View>
        </View>

        <Text style={styles.dailyTipText}>{tip}</Text>

        {onPress && (
          <TouchableOpacity style={styles.tipActionButton} onPress={onPress}>
            <Text style={styles.tipActionText}>Learn More</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  dailyTipCard: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  tipGradient: {
    borderRadius: 20,
    padding: 24,
  },
  tipHeader: {
    marginBottom: 16,
  },
  tipBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  tipBadgeText: {
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  dailyTipText: {
    fontSize: 16,
    color: Colors.surface,
    fontWeight: "500",
    lineHeight: 24,
    marginBottom: 16,
  },
  tipActionButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  tipActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
})

export default DailyTipCard 