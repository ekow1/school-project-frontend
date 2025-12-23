"use client"

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"
import { useRouter } from "expo-router"
import { memo, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View
} from "react-native"
import MapView, { Callout, Marker, Polygon } from "react-native-maps"
import { useLocation } from "../context/LocationContext"
import { useAuthStore } from "../store/authStore"
import { FireReport, useFireReportsStore } from "../store/fireReportsStore"
import { fetchNearbyFireStations, SERVICE_AREAS } from "../utils/fireStationSearch"
import CustomAlert from "./CustomAlert"
import DailyTipCard from "./DailyTipCard"
import EmergencyReportAlert from "./EmergencyReportAlert"
import FireStationsCard from "./FireStationsCard"
import { Header } from "./Header"
import IncidentReportModal from "./IncidentReportModal"
import { LocationSearch } from "./LocationSearch"
import NewsCard from "./NewsCard"
import WeatherCard from "./WeatherCard"

// Add missing types
interface NewsItem {
  title: string
  summary: string
  image: string
  source: string
  timestamp: string
  url: string
  category: string
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

const { width, height } = Dimensions.get("window")

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
  successAlpha: "rgba(16, 185, 129, 0.1)",
  warningAlpha: "rgba(245, 158, 11, 0.1)",
  accentAlpha: "rgba(139, 92, 246, 0.1)",
}

const mockLocation = {
  city: "Accra",
  area: "Osu",
  lat: 5.556,
  lng: -0.1969,
}

const mockFireStations = [
  { name: "Osu Fire Station", distance: 1.2, phone: "+233 30 277 9111", responseTime: "3-5 min" },
  { name: "Ridge Fire Station", distance: 2.8, phone: "+233 30 222 2333", responseTime: "8-12 min" },
  { name: "Labadi Fire Station", distance: 4.5, phone: "+233 30 277 4555", responseTime: "15-20 min" },
]

const mockTips = [
  "Install smoke detectors on every floor and test them monthly.",
  "Keep fire extinguishers accessible and know how to use them.",
  "Plan and practice a fire escape route with your family.",
]

const mockNews = [
  {
    title: "Fire outbreak contained at Makola Market",
    summary: "A swift response from the fire service helped contain a blaze at Makola Market. No casualties reported.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    source: "Ghana News",
    timestamp: "2h ago",
    url: "https://news.example.com/fire-makola",
    category: "Emergency",
  },
  {
    title: "Fire safety week: Tips for every household",
    summary:
      "The National Fire Service shares essential tips to keep your home and family safe during fire safety week.",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    source: "Daily Graphic",
    timestamp: "5h ago",
    url: "https://news.example.com/fire-safety-week",
    category: "Safety",
  },
]

const mockReports = [
  { title: "Kitchen fire at home", date: "2024-06-10 14:32", status: "resolved", priority: "high" },
  { title: "Smoke detected in apartment", date: "2024-06-09 09:15", status: "pending", priority: "medium" },
]

const statusColors = {
  pending: { bg: Colors.warningAlpha, text: Colors.warning, border: Colors.warning + "30" },
  'in-progress': { bg: Colors.accentAlpha, text: Colors.accent, border: Colors.accent + "30" },
  handled: { bg: Colors.accentAlpha, text: Colors.accent, border: Colors.accent + "30" },
  resolved: { bg: Colors.successAlpha, text: Colors.success, border: Colors.success + "30" },
  cancelled: { bg: Colors.tertiary + "20", text: Colors.tertiary, border: Colors.tertiary + "30" },
}

// Helper function to get status colors with fallback
const getStatusColors = (status: string) => {
  return statusColors[status as keyof typeof statusColors] || {
    bg: Colors.tertiary + "20",
    text: Colors.tertiary,
    border: Colors.tertiary + "30"
  }
}

const getDailyTip = () => {
  const today = new Date()
  const idx = today.getDate() % mockTips.length
  return mockTips[idx]
}

const customMapStyleLight = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
]

const customMapStyleDark = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#181818" }] },
]

// Enhanced Loading Component
const EnhancedLoadingScreen = ({
  message = "Detecting location…",
  subMessage = "Please wait while we find your location",
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    // Gentle pulse animation for location pin
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Smooth fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Gentle slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <View style={styles.elegantLoadingContainer}>
      <LinearGradient 
        colors={['#F8FAFC', '#F1F5F9']} 
        style={styles.elegantLoadingGradient}
      >
        <Animated.View 
          style={[
            styles.elegantLoadingContent, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Single Location Pin with Elegant Animation */}
          <Animated.View 
            style={[
              styles.elegantLocationPin,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <LinearGradient 
              colors={[Colors.primary, Colors.primaryLight]} 
              style={styles.elegantPinGradient}
            >
              <Ionicons name="location" size={32} color="#fff" />
            </LinearGradient>
          </Animated.View>

          {/* Clean Text Content */}
          <View style={styles.elegantTextContainer}>
            <Text style={styles.elegantLoadingTitle}>{message}</Text>
            <Text style={styles.elegantLoadingSubtitle}>{subMessage}</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  )
}

// Enhanced Incident Modal
const EnhancedIncidentModal = ({ visible, onClose, station }: { 
  visible: boolean; 
  onClose: () => void; 
  station: any; 
}) => {
  const [selectedIncidentType, setSelectedIncidentType] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const incidentTypes = [
    {
      id: "fire",
      label: "Fire Emergency",
      icon: "fire" as const,
      color: Colors.danger,
      bgColor: "#FEE2E2",
      description: "Building fire, wildfire, or smoke",
    },
    {
      id: "accident",
      label: "Vehicle Accident",
      icon: "car" as const,
      color: Colors.accent,
      bgColor: "#DBEAFE",
      description: "Car crash or road accident",
    },
    {
      id: "medical",
      label: "Medical Emergency",
      icon: "medical-bag" as const,
      color: Colors.success,
      bgColor: "#D1FAE5",
      description: "Heart attack, injury, or illness",
    },
    {
      id: "flood",
      label: "Flood/Water",
      icon: "water" as const,
      color: "#0EA5E9",
      bgColor: "#E0F2FE",
      description: "Flooding or water emergency",
    },
    {
      id: "gas",
      label: "Gas Leak",
      icon: "alert" as const,
      color: Colors.warning,
      bgColor: "#FEF3C7",
      description: "Gas leak or chemical hazard",
    },
    {
      id: "other",
      label: "Other Emergency",
      icon: "alert-circle" as const,
      color: Colors.tertiary,
      bgColor: "#F3F4F6",
      description: "Other type of emergency",
    },
  ]

  const handleSubmit = async () => {
    if (!selectedIncidentType) {
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Missing Information',
        message: 'Please select an incident type to continue.',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setAlertConfig({
        visible: true,
        type: 'success',
        title: 'Report Submitted',
        message: 'Your emergency report has been submitted successfully. Emergency services have been notified.',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }))
          onClose()
        },
      })
      setSelectedIncidentType(null)
      setDescription("")
    }, 2000)
  }

  const handleCallStation = () => {
    if (station?.phone) {
      Linking.openURL(`tel:${station.phone}`)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.incidentModalContainer}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <LinearGradient colors={[Colors.danger, Colors.primaryLight]} style={styles.modalIconContainer}>
                  <MaterialCommunityIcons name="fire-truck" size={24} color={Colors.surface} />
                </LinearGradient>
                <View style={styles.modalTitleText}>
                  <Text style={styles.modalTitle}>Report Emergency</Text>
                  <Text style={styles.modalSubtitle}>{station ? `At ${station.name}` : "Emergency Report"}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.tertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
              {/* Emergency Call Button */}
              <TouchableOpacity style={styles.emergencyCallButton} onPress={handleCallStation} activeOpacity={0.8}>
                <LinearGradient colors={[Colors.danger, Colors.primaryDark]} style={styles.emergencyCallGradient}>
                  <Ionicons name="call" size={24} color={Colors.surface} />
                  <View style={styles.emergencyCallText}>
                    <Text style={styles.emergencyCallTitle}>Emergency Call</Text>
                    <Text style={styles.emergencyCallSubtitle}>{station?.phone || "Call Fire Station"}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Incident Type Selection */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Select Emergency Type</Text>
                <View style={styles.incidentTypesGrid}>
                  {incidentTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.incidentTypeCard,
                        { backgroundColor: type.bgColor },
                        selectedIncidentType === type.id && styles.selectedIncidentType,
                      ]}
                      onPress={() => setSelectedIncidentType(type.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.incidentTypeIcon, { backgroundColor: type.color + "20" }]}>
                        <MaterialCommunityIcons name={type.icon} size={24} color={type.color} />
                      </View>
                      <Text style={[styles.incidentTypeLabel, { color: type.color }]}>{type.label}</Text>
                      <Text style={styles.incidentTypeDescription}>{type.description}</Text>
                      {selectedIncidentType === type.id && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons name="checkmark-circle" size={20} color={type.color} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Description Input */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Additional Details (Optional)</Text>
                <TextInput
                  style={styles.descriptionInput}
                  placeholder="Describe the emergency situation..."
                  placeholderTextColor={Colors.tertiary}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
              </View>

              {/* Location Info */}
              {station && (
                <View style={styles.locationInfoContainer}>
                  <Ionicons name="location" size={16} color={Colors.accent} />
                  <Text style={styles.locationInfoText}>Report will be sent to {station.name}</Text>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, (!selectedIncidentType || isSubmitting) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!selectedIncidentType || isSubmitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    !selectedIncidentType || isSubmitting
                      ? [Colors.tertiary, Colors.tertiary]
                      : [Colors.primary, Colors.primaryDark]
                  }
                  style={styles.submitButtonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={Colors.surface} />
                  ) : (
                    <Ionicons name="send" size={20} color={Colors.surface} />
                  )}
                  <Text style={styles.submitButtonText}>{isSubmitting ? "Submitting..." : "Submit Report"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

function PulsingMarker({ coordinate }: { coordinate: { latitude: number; longitude: number } }) {
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ).start()
  }, [])

  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} accessibilityLabel="Your current location">
      <Animated.View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#10B98155",
          justifyContent: "center",
          alignItems: "center",
          transform: [{ scale }],
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#10B981",
            borderWidth: 2,
            borderColor: "#fff",
          }}
        />
      </Animated.View>
    </Marker>
  )
}

// Memoized Marker for performance
const FireStationMarker = memo(({ station, onPress, onCalloutPress }: any) => (
  <Marker
    coordinate={{ latitude: station.latitude, longitude: station.longitude }}
    pinColor={station.isServiceAreaStation ? "#8B5CF6" : station.isOpen === false ? "#F59E0B" : "#D32F2F"}
    onPress={onPress}
    accessibilityLabel={`Fire station: ${station.name}`}
    anchor={{ x: 0.5, y: 0.5 }}
  >
    <Ionicons
      name="flame"
      size={28}
      color={station.isServiceAreaStation ? "#8B5CF6" : station.isOpen === false ? "#F59E0B" : "#D32F2F"}
    />
    <Callout onPress={onCalloutPress} tooltip>
      <View
        style={{
          maxWidth: 240,
          backgroundColor: "#fff",
          borderRadius: 14,
          padding: 14,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          alignItems: "flex-start",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 2 }}>{station.name}</Text>
        <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 2 }}>{station.address}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Text
            style={{
              backgroundColor: station.isOpen === false ? "#F59E0B" : "#10B981",
              color: "#fff",
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 2,
              fontSize: 12,
              marginRight: 8,
            }}
          >
            {station.isOpen === false ? "Closed" : "Open Now"}
          </Text>
          <Text style={{ color: "#2563eb", fontSize: 12 }}>
            {station.routeDistanceText ? station.routeDistanceText : ""}
          </Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 8, gap: 12 }}>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${station.phone || ""}`)}
            accessibilityLabel={`Call ${station.name}`}
            accessibilityHint="Call this fire station"
          >
            <Ionicons name="call" size={18} color="#D32F2F" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCalloutPress}
            accessibilityLabel={`Get directions to ${station.name}`}
            accessibilityHint="Open directions in Google Maps"
          >
            <Ionicons name="navigate" size={18} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel={`Report incident at ${station.name}`}
            accessibilityHint="Report an incident at this station"
          >
            <Ionicons name="warning" size={18} color="#F59E0B" />
          </TouchableOpacity>
        </View>
        <Text style={{ color: "#2563eb", fontSize: 13, marginTop: 4, textAlign: "right" }}>Tap for directions</Text>
      </View>
    </Callout>
  </Marker>
))

const MemoPolygon = memo(Polygon)

export default function HomeGeneralTab() {
  const router = useRouter()
  const dailyTip = getDailyTip()
  const { location, setLocation, refreshLocation, loading } = useLocation()
  const { user } = useAuthStore()
  const { 
    reports: fireReports, 
    isLoading: reportsLoading, 
    getAllFireReports 
  } = useFireReportsStore()
  const [manualLocation, setManualLocation] = useState("")
  const [useManual, setUseManual] = useState(false)
  const [fireStations, setFireStations] = useState<any[]>([])
  const [loadingStations, setLoadingStations] = useState(false)
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light")
  const [selectedStation, setSelectedStation] = useState<any | null>(null)
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const mapRef = useRef<MapView>(null)
  const [locationModalVisible, setLocationModalVisible] = useState(false)
  const [initialAutoLocation, setInitialAutoLocation] = useState<{
    latitude: number
    longitude: number
    address: string
  } | null>(null)
  const lastFetchedLocation = useRef<{ latitude: number; longitude: number } | null>(null)
  const [incidentModalVisible, setIncidentModalVisible] = useState(false)
  const [incidentStation, setIncidentStation] = useState<any | null>(null)
  const [emergencyReportData, setEmergencyReportData] = useState<any | null>(null)
  const [showEmergencyReport, setShowEmergencyReport] = useState(false)
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  })

  // Prompt for location permission on mount - only if user is authenticated
  // Note: This is a fallback - LocationContext should handle location detection
  // This effect only runs if LocationContext hasn't set a location yet
  useEffect(() => {
    // Only request location if user is logged in and we don't have a location yet
    if (!user || location) {
      return;
    }

    // Add delay to let LocationContext try first
    const timer = setTimeout(() => {
      // Only try if LocationContext hasn't set location after 3 seconds
      if (!location) {
        ;(async () => {
          try {
            // Check if location services are enabled
            const isEnabled = await Location.hasServicesEnabledAsync();
            if (!isEnabled) {
              return; // Let LocationContext handle the error
            }

            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
              return; // Let LocationContext handle the permission request
            }
            
            // Add timeout for location request (20 seconds)
            const locationPromise = Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              timeout: 20000,
              maximumAge: 300000, // Accept cached location up to 5 minutes old
            });
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Location request timeout')), 20000)
            );
            
            const loc = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;
            
            if (!loc || !loc.coords) {
              throw new Error('Invalid location data received');
            }
            
            let address = "Current Location"
            try {
              const geocode = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              })
              if (geocode && geocode.length > 0) {
                const g = geocode[0]
                address = [g.name, g.street, g.city, g.region, g.country].filter(Boolean).join(", ")
              }
            } catch (e) {
              console.warn('Failed to reverse geocode:', e);
            }
            
            const detected = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              address,
            }
            setLocation(detected)
            setInitialAutoLocation(detected)
          } catch (error: any) {
            console.error('Error getting location in HomeGeneralTab:', error);
            // Don't show alert here - let LocationContext handle it
            // This is just a fallback attempt
          }
        })()
      }
    }, 3000); // Wait 3 seconds for LocationContext to try first

    return () => clearTimeout(timer);
  }, [user, location])

  // Fetch stations when location changes
  useEffect(() => {
    // Add safety checks to prevent crashes
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return;
    }

    // Check if location is valid (not NaN)
    if (isNaN(location.latitude) || isNaN(location.longitude)) {
      console.warn('Invalid location coordinates:', location);
      return;
    }

    if (
      lastFetchedLocation.current &&
      lastFetchedLocation.current.latitude === location.latitude &&
      lastFetchedLocation.current.longitude === location.longitude
    ) {
      return // Don't refetch if location hasn't changed
    }
    
    lastFetchedLocation.current = { latitude: location.latitude, longitude: location.longitude }
    setLoadingStations(true)
    fetchNearbyFireStations(location.latitude, location.longitude)
      .then((stations) => {
        // Ensure we always set an array, even if empty
        setFireStations(Array.isArray(stations) ? stations : []);
      })
      .catch((error) => {
        console.error('Error fetching fire stations:', error);
        setFireStations([]); // Set empty array on error
        // Only show alert if component is still mounted
        try {
          setAlertConfig({
            visible: true,
            type: 'error',
            title: 'Unable to Load Fire Stations',
            message: 'Failed to fetch nearby fire stations. Please check your internet connection and try again.',
            onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
          });
        } catch (e) {
          // Silently fail if component is unmounting
          console.warn('Could not set alert config:', e);
        }
      })
      .finally(() => {
        try {
          setLoadingStations(false);
        } catch (e) {
          // Silently fail if component is unmounting
          console.warn('Could not set loading state:', e);
        }
      })
  }, [location])

  // Fetch all incidents on mount
  useEffect(() => {
    fetchAllIncidents()
  }, [])

  const fetchAllIncidents = async () => {
    try {
      console.log('📋 Fetching all incidents for home screen')
      await getAllFireReports()
    } catch (error) {
      console.error('❌ Error fetching incidents for home:', error)
    }
  }

  // Helper functions for fire reports
  const getRecentReports = () => {
    return fireReports.slice(0, 3) // Show only 3 most recent reports
  }

  const getIncidentIcon = (incidentType: string) => {
    const iconMap = {
      fire: 'flame',
      flood: 'water',
      'building-collapse': 'business',
      'gas-leak': 'warning',
      'fuel-leak': 'car',
      'natural-disaster': 'warning',
      hazmat: 'nuclear',
      other: 'alert-circle',
    }
    return iconMap[incidentType as keyof typeof iconMap] || 'alert-circle'
  }

  const formatReportDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleReportPress = (report: FireReport) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    Alert.alert(
      report.incidentName,
      `Status: ${report.status}\nPriority: ${report.priority}\nLocation: ${report.location.locationName}\nStation: ${report.station.name}\nReported: ${formatDate(report.reportedAt)}\n\n${report.description || 'No additional description provided.'}`,
      [
        { text: 'OK' },
        { 
          text: 'View All Reports', 
          onPress: () => router.push('/(tabs)/incidents')
        }
      ]
    );
  }

  // Animate map to selected station
  useEffect(() => {
    if (selectedStation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: selectedStation.latitude,
          longitude: selectedStation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800,
      )
    }
  }, [selectedStation])

  // Add to search history
  const handleLocationSelect = (loc: any) => {
    setManualLocation(loc.address)
    setLocation({
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.address,
    })
    setUseManual(false)
    setSearchHistory((prev) =>
      [
        { address: loc.address, latitude: loc.latitude, longitude: loc.longitude },
        ...prev.filter((h) => h.address !== loc.address),
      ].slice(0, 5),
    )
  }

  // Add this function to clear search history and return to default location
  const handleClearHistoryAndReset = () => {
    setSearchHistory([])
    if (initialAutoLocation) {
      setLocation(initialAutoLocation)
      setManualLocation(initialAutoLocation.address)
    }
  }

  // Map theme toggle
  const toggleMapTheme = () => setMapTheme((t) => (t === "light" ? "dark" : "light"))

  // Accessibility/haptics
  const handleCalloutPress = (station: any) => {
    if (Platform.OS === "ios" || Platform.OS === "android") Vibration.vibrate(10)
    const url = `https://maps.google.com/maps?daddr=${encodeURIComponent(station.address)}`
    Linking.openURL(url)
  }

  // Add recenter button
  const recenterMap = () => {
    if (!location) return
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      600,
    )
    Vibration.vibrate(8)
  }

  const currentLocationString = `${mockLocation.city}, ${mockLocation.area}`
  const closestStationId = fireStations.length > 0 ? fireStations[0].id : null

  // Removed location detection preloader - app will show content even without location

  return (
    <View style={styles.container}>
      {/* Sticky Header Component */}
      <Header onEmergencyCall={() => console.log("Emergency call initiated")} />

    <ScrollView
        style={styles.scrollView}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Location Card */}
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="location" size={24} color={Colors.primary} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Current Location</Text>
            <Text style={styles.locationText}>{manualLocation || location?.address || 'Location not available'}</Text>
          </View>
          <TouchableOpacity
            style={[styles.locationButton, !location && { opacity: 0.5 }]}
            onPress={() => setLocationModalVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="Search or edit current location"
            disabled={!location}
          >
            <Ionicons name="search" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Clear search history button */}
        {searchHistory.length > 0 && (
          <TouchableOpacity
            style={{
              alignSelf: "flex-end",
              marginTop: 4,
              marginRight: 8,
              backgroundColor: "#F1F5F9",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={handleClearHistoryAndReset}
            accessibilityLabel="Clear searched locations"
          >
            <Text style={{ color: Colors.primary, fontWeight: "bold", fontSize: 14 }}>Clear Searched Locations</Text>
          </TouchableOpacity>
        )}

        {/* Location Search Modal */}
              <LocationSearch
          visible={locationModalVisible}
          onClose={() => setLocationModalVisible(false)}
                onLocationSelect={(loc: any) => {
                  if (loc) {
                    handleLocationSelect(loc)
                    setLocationModalVisible(false)
                  }
                }}
              />
      </View>

      {/* Only render the map and location-dependent UI if location is set */}
      {location && (
        <View style={styles.mapContainer}>
          {/* Map Theme Toggle */}
          <TouchableOpacity
            onPress={toggleMapTheme}
            style={{ alignSelf: "flex-end", margin: 8, padding: 6, borderRadius: 8, backgroundColor: "#F1F5F9" }}
            accessibilityLabel="Toggle map theme"
            accessibilityHint="Switch between light and dark map styles"
          >
            <Ionicons name={mapTheme === "light" ? "moon" : "sunny"} size={20} color="#D32F2F" />
          </TouchableOpacity>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8, marginLeft: 8 }}>
              {searchHistory.map((h, idx) => (
                <TouchableOpacity
                  key={h.address + idx}
                  style={{
                    backgroundColor: "#F1F5F9",
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    marginRight: 8,
                  }}
                  onPress={() => setLocation({ latitude: h.latitude, longitude: h.longitude, address: h.address })}
                  accessibilityLabel={`Jump to ${h.address}`}
                  accessibilityHint="Jump to this previously searched location"
                >
                  <Text style={{ color: "#1A1A1A", fontSize: 13 }}>
                    {h.address.length > 28 ? h.address.slice(0, 28) + "…" : h.address}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Recenter Button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 24,
              right: 24,
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 12,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 8,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              zIndex: 10,
            }}
            onPress={recenterMap}
            accessibilityLabel="Recenter map"
            accessibilityHint="Move the map to your current location"
          >
            <Ionicons name="locate" size={22} color="#D32F2F" />
          </TouchableOpacity>

          {/* Map with all super features */}
          <MapView
            ref={mapRef}
            style={styles.map}
            region={{
              latitude: location?.latitude || mockLocation.lat,
              longitude: location?.longitude || mockLocation.lng,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
            showsUserLocation={false}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={true}
            rotateEnabled={true}
            pointerEvents="auto"
            customMapStyle={mapTheme === "light" ? customMapStyleLight : customMapStyleDark}
            accessibilityLabel="Map showing your location and nearby fire stations"
            minZoomLevel={8}
            maxZoomLevel={18}
          >
            {/* Animated user marker */}
            <PulsingMarker
              coordinate={{
                latitude: location?.latitude || mockLocation.lat,
                longitude: location?.longitude || mockLocation.lng,
              }}
            />

            {/* Service area polygons */}
            {SERVICE_AREAS.map((area, idx) => (
              <MemoPolygon
                key={area.name}
                coordinates={[
                  { latitude: area.bounds.minLat, longitude: area.bounds.minLng },
                  { latitude: area.bounds.minLat, longitude: area.bounds.maxLng },
                  { latitude: area.bounds.maxLat, longitude: area.bounds.maxLng },
                  { latitude: area.bounds.maxLat, longitude: area.bounds.minLng },
                ]}
                fillColor={
                  area.servingStations[0]?.name === "Madina Fire Station"
                    ? "rgba(139,92,246,0.08)"
                    : "rgba(211,47,47,0.08)"
                }
                strokeColor={area.servingStations[0]?.name === "Madina Fire Station" ? "#8B5CF6" : "#D32F2F"}
                strokeWidth={2}
              />
            ))}

            {/* Fire station markers with custom callouts */}
            {fireStations.map((station, idx) => (
              <FireStationMarker
                key={station.id || idx}
                station={station}
                onPress={() => {
                  setSelectedStation(station)
                  if (Platform.OS === "ios" || Platform.OS === "android") Vibration.vibrate(8)
                }}
                onCalloutPress={() => handleCalloutPress(station)}
              />
            ))}
          </MapView>
        </View>
      )}

      {/* Fire Stations Card */}
      <FireStationsCard 
        fireStations={fireStations}
        loadingStations={loadingStations}
        closestStationId={closestStationId}
        onStationPress={(station: FireStation) => console.log("Station pressed:", station)}
        onReportIncident={(station: FireStation) => {
                    setIncidentStation(station)
                    setIncidentModalVisible(true)
                  }}
      />

      {/* Daily Tip Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIconContainer}>
            <Ionicons name="bulb" size={24} color={Colors.accent} />
          </View>
          <Text style={styles.sectionTitle}>Safety Tip of the Day</Text>
        </View>
      </View>

      {/* Daily Tip Card */}
      <DailyTipCard 
        tip={dailyTip}
        onPress={() => console.log("Learn more about fire safety")}
      />

      {/* Weather Card */}
      <WeatherCard 
        temperature={32}
        description="High Fire Risk"
        riskLevel="High"
        humidity={18}
        windSpeed={10}
      />

      {/* Reports Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIconContainer}>
            <Ionicons name="document-text" size={24} color={Colors.accent} />
          </View>
          <Text style={styles.sectionTitle}>Recent Emergency Reports</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push("/(tabs)/incidents")}>
          <Text style={styles.seeAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {reportsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : getRecentReports().length === 0 ? (
        <View style={styles.emptyReportsContainer}>
          <Ionicons name="document-outline" size={48} color={Colors.tertiary} />
          <Text style={styles.emptyReportsTitle}>No Recent Emergencies</Text>
          <Text style={styles.emptyReportsMessage}>
            No emergency incidents reported at this time.
          </Text>
        </View>
      ) : (
        getRecentReports().map((report) => (
          <TouchableOpacity
            key={report._id}
            style={styles.reportCard}
            onPress={() => handleReportPress(report)}
            activeOpacity={0.7}
          >
            <View style={styles.reportIconContainer}>
              <LinearGradient
                colors={[
                  getStatusColors(report.status).text + "20",
                  getStatusColors(report.status).text + "10",
                ]}
                style={styles.reportIcon}
              >
                <Ionicons
                  name={getIncidentIcon(report.incidentType)}
                  size={24}
                  color={getStatusColors(report.status).text}
                />
              </LinearGradient>
            </View>
            <View style={styles.reportContent}>
              <Text style={styles.reportTitle}>{report.incidentName}</Text>
              <Text style={styles.reportDate}>{formatReportDate(report.reportedAt)}</Text>
              <Text style={styles.reportLocation}>{report.location.locationName}</Text>
              <View style={styles.reportMeta}>
                <View
                  style={[
                    styles.priorityBadge,
                    { 
                      backgroundColor: report.priority === "high" 
                        ? Colors.danger + "20" 
                        : report.priority === "medium"
                        ? Colors.warning + "20"
                        : Colors.tertiary + "20"
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText, 
                      { 
                        color: report.priority === "high" 
                          ? Colors.danger 
                          : report.priority === "medium"
                          ? Colors.warning
                          : Colors.tertiary
                      }
                    ]}
                  >
                    {report.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.reportActions}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusColors(report.status).bg,
                    borderColor: getStatusColors(report.status).border,
                  },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: getStatusColors(report.status).text }]}
                >
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* News Card */}
      <NewsCard 
        news={mockNews}
        onNewsPress={(news: NewsItem) => Linking.openURL(news.url)}
      />

      {/* Enhanced Incident Modal */}
        <IncidentReportModal
        visible={incidentModalVisible}
        onClose={() => setIncidentModalVisible(false)}
        station={incidentStation}
          userLocation={location}
          userProfile={user ? {
            userId: user.id,
            name: user.name,
            phone: user.phone,
            image: user.image,
            ghanaPostAddress: user.ghanaPost,
          } : null}
          onTypeSelect={(type, reportData) => {
            console.log("Selected incident type:", type)
            console.log("📋 Report Data to be sent to backend:", JSON.stringify(reportData, null, 2))
            
            // Store report data and show emergency alert
            setEmergencyReportData(reportData)
            setIncidentModalVisible(false)
            setShowEmergencyReport(true)
          }}
          onCall={() => {
            if (incidentStation?.phone) {
              Linking.openURL(`tel:${incidentStation.phone}`)
            } else {
              setAlertConfig({
                visible: true,
                type: 'warning',
                title: 'Phone Number Unavailable',
                message: 'Phone number for this fire station is not available. Please call the emergency number 192 or 112.',
                onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
              })
            }
          }}
      />
      
      {/* Emergency Report Alert */}
      <EmergencyReportAlert
        visible={showEmergencyReport}
        reportData={emergencyReportData}
        userInfo={user ? {
          name: user.name,
          phone: user.phone,
          image: user.image,
          ghanaPostAddress: user.ghanaPost,
        } : null}
        onConfirm={(success, message) => {
          console.log("✅ Report confirmed! Success:", success, "Message:", message)
          setShowEmergencyReport(false)
          setEmergencyReportData(null)
          
          // Show success or error confirmation
          setAlertConfig({
            visible: true,
            type: success ? 'success' : 'error',
            title: success ? 'Report Submitted!' : 'Submission Failed',
            message: message,
            onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
          })
        }}
        onCancel={() => {
          setShowEmergencyReport(false)
          setEmergencyReportData(null)
        }}
      />
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
      />
    </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  // Enhanced Loading Styles
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingIconContainer: {
    marginBottom: 32,
  },
  loadingIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingDotsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 16,
    color: Colors.tertiary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  loadingTipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accentAlpha,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  loadingTip: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: "500",
    flex: 1,
  },

  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBackdrop: {
    flex: 1,
  },
  incidentModalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitleText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.tertiary,
    fontWeight: "500",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emergencyCallButton: {
    marginVertical: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyCallGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  emergencyCallText: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyCallTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.surface,
    marginBottom: 2,
  },
  emergencyCallSubtitle: {
    fontSize: 14,
    color: Colors.surface,
    opacity: 0.9,
  },
  emergencyCallPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    opacity: 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyCallPulseInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surface,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 16,
  },
  incidentTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  incidentTypeCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  selectedIncidentType: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  incidentTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  incidentTypeLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  incidentTypeDescription: {
    fontSize: 12,
    color: Colors.tertiary,
    lineHeight: 16,
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.secondary,
    minHeight: 100,
    textAlignVertical: "top",
  },
  locationInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accentAlpha,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  locationInfoText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.tertiary,
  },
  submitButton: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.surface,
  },


  weatherCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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
    backgroundColor: Colors.warning,
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
  locationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryAlpha,
    alignItems: "center",
    justifyContent: "center",
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 14,
    color: Colors.tertiary,
    fontWeight: "500",
    marginBottom: 2,
  },
  locationText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.secondary,
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryAlpha,
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: "#fff",
  },
  map: {
    width: "100%",
    height: 320,
    borderRadius: 28,
    overflow: "hidden",
  },
  mapPlaceholder: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.secondary,
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 12,
    color: Colors.tertiary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  stationsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  stationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    width: width * 0.8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  firstStationCard: {
    borderWidth: 2,
    borderColor: Colors.primary + "20",
  },
  stationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryAlpha,
    alignItems: "center",
    justifyContent: "center",
  },
  distanceBadge: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: {
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 12,
  },
  stationName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 8,
  },
  stationMeta: {
    marginBottom: 16,
  },
  stationMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stationMetaText: {
    fontSize: 14,
    color: Colors.tertiary,
    fontWeight: "500",
  },
  stationButtonsContainer: {
    gap: 8,
  },
  callButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
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
    fontSize: 16,
  },
  callButtonTextDisabled: {
    color: Colors.tertiary,
  },
  callButtonNumber: {
    color: Colors.surface,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
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
  dailyTipCard: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
  },
  tipBadgeText: {
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  dailyTipText: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: "500",
    lineHeight: 24,
    marginBottom: 16,
  },
  tipActionButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
  },
  tipActionText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  newsImageContainer: {
    position: "relative",
    height: 160,
  },
  newsImage: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.surfaceVariant,
  },
  newsImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  newsContent: {
    padding: 20,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 8,
    lineHeight: 24,
  },
  newsSummary: {
    fontSize: 14,
    color: Colors.tertiary,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsSource: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  newsSourceText: {
    fontSize: 12,
    color: Colors.tertiary,
    fontWeight: "500",
  },
  newsTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  newsTimeText: {
    fontSize: 12,
    color: Colors.tertiary,
    fontWeight: "500",
  },
  reportCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  reportIconContainer: {
    marginRight: 16,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: Colors.tertiary,
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  reportActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  statusText: {
    fontWeight: "700",
    fontSize: 12,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryAlpha,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  detailsButtonText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.tertiary,
  },
  emptyReportsContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyReportsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.secondary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyReportsMessage: {
    fontSize: 14,
    color: Colors.tertiary,
    textAlign: "center",
    lineHeight: 20,
  },
  reportLocation: {
    fontSize: 12,
    color: Colors.tertiary,
    marginTop: 2,
  },
  // Elegant Loading Screen Styles
  elegantLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  elegantLoadingGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  elegantLoadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  elegantLocationPin: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 40,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  elegantPinGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  elegantTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  elegantLoadingTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  elegantLoadingSubtitle: {
    fontSize: 16,
    color: Colors.tertiary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  newsHorizontalContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  newsCardHorizontal: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
    width: width * 0.75,
    marginRight: 16,
  },
  locationInput: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingVertical: 2,
    minWidth: 120,
  },
  closestBadge: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 8,
    right: 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    zIndex: 2,
  },
  closestBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
    marginLeft: 2,
    letterSpacing: 0.2,
  },
  closestStationCard: {
    borderWidth: 2,
    borderColor: Colors.primary + "20",
  },
  incidentTypeButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    margin: 6,
    minWidth: 80,
    minHeight: 70,
  },
  incidentTypeText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
  },
})
