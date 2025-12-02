import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  primaryAlpha: "rgba(211, 47, 47, 0.1)",
  accentAlpha: "rgba(139, 92, 246, 0.1)",
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
}

interface FireStationsCardProps {
  fireStations: FireStation[]
  loadingStations: boolean
  closestStationId?: string
  onStationPress?: (station: FireStation) => void
  onReportIncident?: (station: FireStation) => void
}

export const FireStationsCard: React.FC<FireStationsCardProps> = ({
  fireStations,
  loadingStations,
  closestStationId,
  onStationPress,
  onReportIncident,
}) => {
  const router = useRouter();
  const handleCallStation = (station: FireStation) => {
    if (station.phone) {
      Linking.openURL(`tel:${station.phone}`)
    }
  }

  const handleDirections = (station: FireStation) => {
    const url = `https://maps.google.com/maps?daddr=${station.latitude},${station.longitude}`
    Linking.openURL(url)
  }

  const handleViewAllStations = () => {
    router.push('/(tabs)/fire-stations');
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIconContainer}>
            <MaterialCommunityIcons name="fire-truck" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>Nearby Fire Stations</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton} onPress={handleViewAllStations}>
          <Text style={styles.seeAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stationsContainer}>
        {loadingStations ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ margin: 16 }} />
        ) : fireStations.length > 0 ? (
          fireStations.map((station: FireStation, idx) => (
            <View
              style={[styles.stationCard, station.id === closestStationId && styles.closestStationCard]}
              key={station.id || station.name}
            >
              {/* Closest badge at top-right */}
              {station.id === closestStationId && (
                <View style={styles.closestBadge}>
                  <Ionicons name="star" size={10} color="#fff" />
                  <Text style={styles.closestBadgeText}>Closest</Text>
                </View>
              )}

              <View style={styles.stationHeader}>
                <View style={styles.stationIconContainer}>
                  <MaterialCommunityIcons name="fire-truck" size={28} color={Colors.primary} />
                </View>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>
                    {station.routeDistanceText || `${station.straightLineDistance?.toFixed(1) || station.distance}km`}
                  </Text>
                </View>
              </View>

              <Text style={styles.stationName}>{station.name}</Text>
              <Text style={styles.stationMetaText}>{station.address}</Text>

              <View style={styles.stationMeta}>
                <View style={styles.stationMetaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.tertiary} />
                  <Text style={styles.stationMetaText}>{station.travelTimeText || station.responseTime || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.stationButtonsContainer}>
                <TouchableOpacity
                  style={styles.reportIncidentButton}
                  activeOpacity={0.8}
                  onPress={() => onReportIncident?.(station)}
                >
                  <Ionicons name="warning-outline" size={16} color={Colors.danger} />
                  <Text style={styles.reportIncidentButtonText}>Report Incident</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => handleDirections(station)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate-outline" size={16} color={Colors.accent} />
                  <Text style={styles.directionsButtonText}>Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.callButton, !station.phone && styles.callButtonDisabled]}
                  onPress={() => handleCallStation(station)}
                  activeOpacity={0.8}
                  disabled={!station.phone}
                >
                  <Ionicons name="call" size={16} color={station.phone ? Colors.surface : Colors.tertiary} />
                  <Text style={[styles.callButtonText, !station.phone && styles.callButtonTextDisabled]}>
                    {station.phone ? "Call" : "No Phone"}
                  </Text>
                  {station.phone && <Text style={styles.callButtonNumber}>{station.phone}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: Colors.tertiary, margin: 16 }}>No fire stations found nearby.</Text>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryAlpha,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.secondary,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  stationsContainer: {
    paddingHorizontal: 20,
  },
  stationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    width: 280,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  closestStationCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  closestBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  closestBadgeText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: "700",
  },
  stationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  stationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryAlpha,
    alignItems: "center",
    justifyContent: "center",
  },
  distanceBadge: {
    backgroundColor: Colors.accentAlpha,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.accent,
  },
  stationName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 8,
  },
  stationMetaText: {
    fontSize: 14,
    color: Colors.tertiary,
    
  },
  stationMeta: {
    marginBottom: 16,
    marginTop: 5,
    
   
  },
  stationMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stationButtonsContainer: {
    gap: 8,
  },
  reportIncidentButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    borderWidth: 2,
    borderColor: Colors.danger,
  },
  reportIncidentButtonText: {
    color: Colors.danger,
    fontWeight: "600",
    fontSize: 14,
  },
  directionsButton: {
    backgroundColor: Colors.accentAlpha,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.accent + "30",
  },
  directionsButtonText: {
    color: Colors.accent,
    fontWeight: "600",
    fontSize: 14,
  },
  callButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  callButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  callButtonText: {
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  callButtonTextDisabled: {
    color: Colors.tertiary,
  },
  callButtonNumber: {
    color: Colors.surface,
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 8,
  },
})

export default FireStationsCard 