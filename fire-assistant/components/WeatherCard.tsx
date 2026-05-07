import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { StyleSheet, Text, View } from "react-native"

const C = {
  primary: "#C41230",
  secondary: "#1A1A1A",
  surface: "#FFFFFF",
  bg: "#FFF8EF",
  success: "#10B981",
  warning: "#E8A020",
  danger: "#EF4444",
  accent: "#E8A020",
  tertiary: "#78716C",
  warningAlpha: "rgba(232, 160, 32, 0.1)",
}

const weatherCodes: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear Sky", icon: "sunny" },
  1: { description: "Mainly Clear", icon: "sunny" },
  2: { description: "Partly Cloudy", icon: "partly-sunny" },
  3: { description: "Overcast", icon: "cloud" },
  45: { description: "Fog", icon: "cloud" },
  48: { description: "Rime Fog", icon: "cloud" },
  51: { description: "Light Drizzle", icon: "rainy" },
  53: { description: "Drizzle", icon: "rainy" },
  55: { description: "Heavy Drizzle", icon: "rainy" },
  61: { description: "Light Rain", icon: "rainy" },
  63: { description: "Moderate Rain", icon: "rainy" },
  65: { description: "Heavy Rain", icon: "rainy" },
  80: { description: "Showers", icon: "rainy" },
  81: { description: "Heavy Showers", icon: "rainy" },
  82: { description: "Violent Showers", icon: "thunderstorm" },
  95: { description: "Thunderstorm", icon: "thunderstorm" },
  99: { description: "Thunderstorm + Hail", icon: "thunderstorm" },
}

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  precipitation: number
  isDay: number
}

interface WeatherCardProps {
  weather?: WeatherData
  fireRisk?: "Low" | "Medium" | "High" | "Extreme"
}

const riskMap = {
  Low:     { color: C.success, label: "LOW RISK" },
  Medium:  { color: C.warning, label: "MODERATE RISK" },
  High:    { color: C.danger,  label: "HIGH RISK" },
  Extreme: { color: "#7F1D1D", label: "EXTREME RISK" },
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, fireRisk = "Low" }) => {
  const temperature  = weather?.temperature ?? 28
  const humidity     = weather?.humidity ?? 65
  const windSpeed    = weather?.windSpeed ?? 12
  const weatherCode  = weather?.weatherCode ?? 0
  const precipitation = weather?.precipitation ?? 0

  const info = weatherCodes[weatherCode] ?? weatherCodes[0]
  const risk = riskMap[fireRisk]

  return (
    <View style={styles.card}>
      {/* Top row: temp + risk badge */}
      <View style={styles.topRow}>
        <View style={styles.tempBlock}>
          <View style={styles.iconBox}>
            <Ionicons name={info.icon as any} size={28} color={C.warning} />
          </View>
          <View style={styles.tempText}>
            <Text style={styles.temp}>{temperature}°C</Text>
            <Text style={styles.desc}>{info.description}</Text>
          </View>
        </View>

        <View style={[styles.riskBadge, { backgroundColor: risk.color }]}>
          <Text style={styles.riskText}>{risk.label}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="water" size={16} color={C.accent} />
          <Text style={styles.statLabel}>HUMIDITY</Text>
          <Text style={styles.statVal}>{humidity}%</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="speedometer" size={16} color={C.accent} />
          <Text style={styles.statLabel}>WIND</Text>
          <Text style={styles.statVal}>{windSpeed} km/h</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="umbrella" size={16} color={C.accent} />
          <Text style={styles.statLabel}>RAIN</Text>
          <Text style={styles.statVal}>{precipitation} mm</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.secondary,
    padding: 16,
    shadowColor: C.secondary,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  tempBlock: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 52,
    height: 52,
    backgroundColor: C.warningAlpha,
    borderWidth: 2,
    borderColor: C.secondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.secondary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  tempText: {},
  temp: { fontSize: 28, fontWeight: "900", color: C.secondary, lineHeight: 32 },
  desc: { fontSize: 12, color: C.tertiary, fontWeight: "600", marginTop: 2 },
  riskBadge: {
    borderWidth: 2,
    borderColor: C.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: C.secondary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  riskText: { color: "#fff", fontWeight: "800", fontSize: 10, letterSpacing: 1 },
  divider: { height: 2, backgroundColor: C.secondary, marginBottom: 14 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  stat: { alignItems: "center", gap: 4, flex: 1 },
  statLabel: { fontSize: 9, fontWeight: "800", color: C.tertiary, letterSpacing: 1 },
  statVal: { fontSize: 14, fontWeight: "800", color: C.secondary },
  statDivider: { width: 2, height: 36, backgroundColor: "#D4C4B5" },
})

export default WeatherCard
