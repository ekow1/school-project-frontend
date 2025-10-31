import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import {
    StyleSheet,
    Text,
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

interface WeatherCardProps {
  temperature?: number
  description?: string
  riskLevel?: string
  humidity?: number
  windSpeed?: number
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  temperature = 28,
  description = "Partly Cloudy",
  riskLevel = "Low",
  humidity = 65,
  windSpeed = 12,
}) => {
  const getWeatherIcon = () => {
    if (description.toLowerCase().includes("sunny")) return "sunny"
    if (description.toLowerCase().includes("cloudy")) return "partly-sunny"
    if (description.toLowerCase().includes("rain")) return "rainy"
    if (description.toLowerCase().includes("storm")) return "thunderstorm"
    return "partly-sunny"
  }

  const getRiskColor = () => {
    switch (riskLevel.toLowerCase()) {
      case "high":
        return Colors.danger
      case "medium":
        return Colors.warning
      case "low":
        return Colors.success
      default:
        return Colors.success
    }
  }

  return (
    <View style={styles.weatherCard}>
      <LinearGradient
        colors={[Colors.surface, Colors.surfaceVariant]}
        style={styles.weatherGradient}
      >
        <View style={styles.weatherHeader}>
          <View style={styles.weatherIconContainer}>
            <Ionicons name={getWeatherIcon() as any} size={28} color={Colors.warning} />
          </View>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherTemp}>{temperature}°C</Text>
            <Text style={styles.weatherDesc}>{description}</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor() }]}>
            <Text style={styles.riskBadgeText}>Fire Risk: {riskLevel}</Text>
          </View>
        </View>

        <View style={styles.weatherDetails}>
          <View style={styles.weatherDetailItem}>
            <Ionicons name="water" size={16} color={Colors.accent} />
            <Text style={styles.weatherDetailText}>{humidity}%</Text>
          </View>
          <View style={styles.weatherDetailItem}>
            <Ionicons name="speedometer" size={16} color={Colors.accent} />
            <Text style={styles.weatherDetailText}>{windSpeed} km/h</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  weatherCard: {
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  weatherGradient: {
    borderRadius: 24,
    padding: 24,
  },
  weatherHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  weatherIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weatherInfo: {
    flex: 1,
    marginLeft: 16,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.secondary,
    marginBottom: 4,
  },
  weatherDesc: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.warning,
  },
  riskBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  riskBadgeText: {
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 12,
  },
  weatherDetails: {
    flexDirection: "row",
    gap: 24,
  },
  weatherDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  weatherDetailText: {
    fontSize: 14,
    color: Colors.tertiary,
    fontWeight: "500",
  },
})

export default WeatherCard 