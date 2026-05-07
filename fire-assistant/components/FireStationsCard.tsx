import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React from "react"
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const Colors = {
  primary: "#C41230",
  secondary: "#1A1A1A",
  tertiary: "#78716C",
  surface: "#FFFFFF",
  surfaceVariant: "#F5EDE3",
  border: "#1A1A1A",
  success: "#10B981",
  danger: "#EF4444",
  accent: "#E8A020",
  primaryAlpha: "rgba(196, 18, 48, 0.08)",
  accentAlpha: "rgba(232, 160, 32, 0.08)",
}

interface FireStation {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  phone?: string
  distance?: number
  responseTime?: string
  routeDistanceText?: string
  travelTimeText?: string
  straightLineDistance?: number
  routeDistance?: number
  travelTime?: number
  isOpen?: boolean
  rating?: number
  isServiceAreaStation?: boolean
  serviceNote?: string
  proximityScore?: number
  proximityRank?: string
  isDefaultStation?: boolean
}

interface FireStationsCardProps {
  fireStations: FireStation[]
  loadingStations: boolean
  closestStationId?: string
  onStationPress?: (station: FireStation) => void
  onReportIncident?: (station: FireStation) => void
}

const getDisplayTime = (station: FireStation): string => {
  if (
    station.travelTimeText &&
    station.travelTimeText !== "Route unavailable" &&
    station.travelTimeText !== "N/A"
  ) {
    return station.travelTimeText
  }
  const dist = station.routeDistance || station.straightLineDistance || station.distance
  if (!dist) return "Est. unknown"
  const mins = Math.round((dist / 40) * 60)
  if (mins < 60) return `~${mins} min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `~${hrs}h ${rem}m` : `~${hrs}h`
}

const getDisplayDistance = (station: FireStation): string => {
  if (station.routeDistanceText) return station.routeDistanceText
  const dist = station.straightLineDistance || station.distance
  return dist ? `${dist.toFixed(1)} km` : "—"
}

export const FireStationsCard: React.FC<FireStationsCardProps> = ({
  fireStations,
  loadingStations,
  closestStationId,
  onReportIncident,
}) => {
  const router = useRouter()

  const handleCall = (station: FireStation) => {
    if (station.phone) Linking.openURL(`tel:${station.phone}`)
  }

  const handleDirections = (station: FireStation) => {
    Linking.openURL(`https://maps.google.com/maps?daddr=${station.latitude},${station.longitude}`)
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIconContainer}>
            <MaterialCommunityIcons name="fire-truck" size={20} color="#fff" />
          </View>
          <Text style={styles.sectionTitle}>Nearby Fire Stations</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push("/(tabs)/fire-stations")}>
          <Text style={styles.seeAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loadingStations ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Finding stations...</Text>
          </View>
        ) : fireStations.length > 0 ? (
          fireStations.map((station) => (
            <View
              key={station.id || station.name}
              style={[
                styles.card,
                station.id === closestStationId && styles.closestCard,
              ]}
            >
              {/* Badge */}
              {station.id === closestStationId && (
                <View style={styles.badge}>
                  <Ionicons name="star" size={10} color="#fff" />
                  <Text style={styles.badgeText}>Closest</Text>
                </View>
              )}

              {/* Top row: icon + distance */}
              <View style={styles.cardTop}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="fire-truck" size={26} color={Colors.primary} />
                </View>
                <View style={styles.distancePill}>
                  <Ionicons name="navigate" size={11} color={Colors.accent} />
                  <Text style={styles.distanceText}>{getDisplayDistance(station)}</Text>
                </View>
              </View>

              {/* Station info */}
              <View style={styles.infoBlock}>
                <Text style={styles.stationName} numberOfLines={2}>
                  {station.name}
                </Text>
                <Text style={styles.stationAddress} numberOfLines={1}>
                  {station.address}
                </Text>
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={13} color={Colors.tertiary} />
                  <Text style={styles.timeText}>{getDisplayTime(station)}</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.btnReport}
                  onPress={() => onReportIncident?.(station)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="warning-outline" size={14} color={Colors.danger} />
                  <Text style={styles.btnReportText}>Report</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnDirections}
                  onPress={() => handleDirections(station)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate-outline" size={14} color={Colors.accent} />
                  <Text style={styles.btnDirectionsText}>Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnCall, !station.phone && styles.btnCallDisabled]}
                  onPress={() => handleCall(station)}
                  activeOpacity={0.8}
                  disabled={!station.phone}
                >
                  <Ionicons name="call" size={14} color={station.phone ? "#fff" : Colors.tertiary} />
                  <Text style={[styles.btnCallText, !station.phone && styles.btnCallTextDisabled]}>
                    {station.phone ? "Call" : "No Phone"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="fire-truck" size={32} color={Colors.tertiary} />
            <Text style={styles.emptyText}>No fire stations found nearby.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const CARD_WIDTH = 260
const CARD_HEIGHT = 310

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: Colors.secondary,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.secondary,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  // ── Card ────────────────────────────────────────────────
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.surface,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: Colors.secondary,
    padding: 16,
    marginRight: 14,
    justifyContent: "space-between",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  closestCard: {
    borderColor: Colors.primary,
    borderWidth: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 0,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    zIndex: 1,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  // ── Top row ──────────────────────────────────────────────
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: Colors.secondary,
    backgroundColor: Colors.primaryAlpha,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  distancePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
  },
  // ── Info block ────────────────────────────────────────────
  infoBlock: {
    flex: 1,
    justifyContent: "flex-start",
  },
  stationName: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.secondary,
    marginBottom: 4,
    lineHeight: 19,
  },
  stationAddress: {
    fontSize: 11,
    color: Colors.tertiary,
    marginBottom: 6,
    fontWeight: "500",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: Colors.tertiary,
    fontWeight: "700",
  },
  // ── Action buttons ────────────────────────────────────────
  actions: {
    gap: 5,
    marginTop: 8,
  },
  btnReport: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 0,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
  },
  btnReportText: {
    color: Colors.danger,
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  btnDirections: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 0,
    paddingVertical: 7,
  },
  btnDirectionsText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  btnCall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 0,
    paddingVertical: 7,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  btnCallDisabled: {
    backgroundColor: "#F5EDE3",
    shadowOpacity: 0,
    elevation: 0,
    borderColor: Colors.tertiary,
  },
  btnCallText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  btnCallTextDisabled: {
    color: Colors.tertiary,
  },
  // ── Empty / loading ───────────────────────────────────────
  loadingContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.tertiary,
  },
  emptyContainer: {
    width: CARD_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.tertiary,
    textAlign: "center",
  },
})

export default FireStationsCard
