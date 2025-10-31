"use client"

import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useRef, useState } from "react"
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native"
import { useAuthStore } from "../store/authStore"

const { width, height } = Dimensions.get("window")

const Colors = {
  primary: "#D32F2F",
  primaryLight: "#FF6659",
  primaryDark: "#9A0007",
  danger: "#EF4444",
  accent: "#8B5CF6",
  success: "#10B981",
  warning: "#F59E0B",
  tertiary: "#757575",
  secondary: "#1A1A1A",
  surface: "#FFFFFF",
  surfaceVariant: "#F1F5F9",
  border: "#E2E8F0",
  shadow: "rgba(0, 0, 0, 0.1)",
}

interface IncidentType {
  id: string
  label: string
  icon: string
  iconFamily: "Ionicons" | "MaterialIcons" | "MaterialCommunityIcons"
  color: string
  bgColor: string
  description: string
}

const incidentTypes: IncidentType[] = [
  {
    id: "fire",
    label: "Fire Emergency",
    icon: "flame",
    iconFamily: "Ionicons",
    color: Colors.primary,
    bgColor: "#FEE2E2",
    description: "Building fire, wildfire, or smoke",
  },
  {
    id: "flood",
    label: "Flood Emergency",
    icon: "water",
    iconFamily: "Ionicons",
    color: Colors.primary,
    bgColor: "#FEE2E2",
    description: "Flooding or water emergency",
  },
  {
    id: "building-collapse",
    label: "Building Collapse",
    icon: "business",
    iconFamily: "Ionicons",
    color: Colors.primary,
    bgColor: "#FEE2E2",
    description: "Structural collapse or building damage",
  },
  {
    id: "gas-leak",
    label: "Gas Leak",
    icon: "warning",
    iconFamily: "Ionicons",
    color: Colors.primary,
    bgColor: "#FEE2E2",
    description: "Gas leak or chemical hazard",
  },
  {
    id: "fuel-leak",
    label: "Fuel Leak",
    icon: "car",
    iconFamily: "Ionicons",
    color: Colors.primary,
    bgColor: "#FEE2E2",
    description: "Fuel spill or petroleum leak",
  },
  {
    id: "natural-disaster",
    label: "Natural Disaster",
    icon: "warning",
    iconFamily: "Ionicons",
    color: Colors.primary,
    bgColor: "#FEE2E2",
    description: "Earthquake, storm, or other disaster",
  },
  {
    id: "hazmat",
    label: "Hazmat Report",
    icon: "nuclear",
    iconFamily: "Ionicons",
    color: Colors.primary,
    bgColor: "#FEE2E2",
    description: "Hazardous materials incident",
  },
]

// Icon Component that handles different icon families
const DynamicIcon = ({
  iconFamily,
  name,
  size,
  color,
}: {
  iconFamily: "Ionicons" | "MaterialIcons" | "MaterialCommunityIcons"
  name: string
  size: number
  color: string
}) => {
  switch (iconFamily) {
    case "Ionicons":
      return <Ionicons name={name as any} size={size} color={color} />
    case "MaterialIcons":
      return <MaterialIcons name={name as any} size={size} color={color} />
    case "MaterialCommunityIcons":
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />
    default:
      return <Ionicons name="help-circle" size={size} color={color} />
  }
}

// Pulsing Call Button Component
const PulsingCallButton = ({ onPress, station }: { onPress: () => void; station: any }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    )
    pulse.start()
    return () => pulse.stop()
  }, [])

  return (
    <Animated.View style={[styles.emergencyCallContainer, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity style={styles.emergencyCallButton} onPress={onPress} activeOpacity={0.8}>
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.emergencyCallGradient}>
          <View style={styles.callIconContainer}>
            <Ionicons name="call" size={24} color={Colors.surface} />
          </View>
          <View style={styles.emergencyCallText}>
            <Text style={styles.emergencyCallTitle}>Emergency Call</Text>
            <Text style={styles.emergencyCallSubtitle}>{station?.phone || station?.name || "Fire Station"}</Text>
          </View>
          <View style={styles.emergencyCallPulse}>
            <View style={styles.emergencyCallPulseInner} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Enhanced Incident Type Card
const IncidentTypeCard = ({
  type,
  onPress,
  isSelected,
}: {
  type: IncidentType
  onPress: () => void
  isSelected: boolean
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const handlePress = () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      Vibration.vibrate(10)
    }
    onPress()
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.incidentTypeCard, { backgroundColor: type.bgColor }, isSelected && styles.selectedIncidentType]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={[styles.incidentTypeIcon, { backgroundColor: type.color + "20" }]}>
          <DynamicIcon iconFamily={type.iconFamily} name={type.icon} size={22} color={type.color} />
        </View>
        <Text style={[styles.incidentTypeLabel, { color: type.color }]}>{type.label}</Text>
        <Text style={styles.incidentTypeDescription} numberOfLines={2}>
          {type.description}
        </Text>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={type.color} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

interface ReportData {
  userId: string
  incidentType: string
  incidentName: string
  location: {
    coordinates: {
      latitude: number
      longitude: number
    }
    locationUrl: string
    locationName: string
  }
  station: {
    name: string
    address: string
    latitude: number
    longitude: number
    placeId?: string
    phone?: string
  }
  reportedAt: string
  status: string
  priority: string
}

export default function IncidentReportModal({
  visible,
  station,
  onClose,
  onTypeSelect,
  onCall,
  userLocation,
  userProfile,
}: {
  visible: boolean
  station: any
  onClose: () => void
  onTypeSelect: (type: string, reportData: ReportData) => void
  onCall: () => void
  userLocation?: {
    latitude: number
    longitude: number
    address: string
  } | null
  userProfile?: {
    userId?: string
    name: string
    phone: string
    image?: string
    ghanaPostAddress?: string
  } | null
}) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [showOthersForm, setShowOthersForm] = useState(false)
  const [othersIncidentName, setOthersIncidentName] = useState("")
  const [othersDescription, setOthersDescription] = useState("")
  const slideAnim = useRef(new Animated.Value(height)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const { user } = useAuthStore()

  useEffect(() => {
    if (visible) {
      // Reset selection when modal opens
      setSelectedType(null)
      setShowOthersForm(false)
      setOthersIncidentName("")
      setOthersDescription("")

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    
    // Find the incident type details
    const selectedIncident = incidentTypes.find(type => type.id === typeId)
    
    // Determine priority based on incident type
    const getPriority = (incidentType: string): string => {
      switch (incidentType) {
        case 'fire':
        case 'gas-leak':
        case 'building-collapse':
        case 'hazmat':
          return 'high'
        case 'flood':
        case 'fuel-leak':
        case 'natural-disaster':
          return 'medium'
        default:
          return 'low'
      }
    }
    
    // Get userId from userProfile or auth store, throw error if not available
    const userId = userProfile?.userId || user?.id
    if (!userId) {
      throw new Error('User ID is required to submit a fire report. Please log in and try again.')
    }

    // Prepare report data with new structure
    const reportData: ReportData = {
      userId: userId,
      incidentType: typeId,
      incidentName: selectedIncident?.label || typeId,
      location: {
        coordinates: {
          latitude: userLocation?.latitude || 0,
          longitude: userLocation?.longitude || 0,
        },
        locationUrl: userLocation 
          ? `https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`
          : '',
        locationName: userLocation?.address || 'Unknown location',
      },
      station: {
        name: station?.name || 'Unknown Station',
        address: station?.address || 'Unknown Address',
        latitude: station?.latitude || 0,
        longitude: station?.longitude || 0,
        placeId: station?.placeId,
        phone: station?.phone,
      },
      reportedAt: new Date().toISOString(),
      status: 'pending',
      priority: getPriority(typeId),
    }
    
    // Add slight delay for visual feedback
    setTimeout(() => {
      onTypeSelect(typeId, reportData)
    }, 150)
  }

  const handleCall = () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      Vibration.vibrate(50)
    }
    onCall()
  }

  const handleOthersPress = () => {
    setShowOthersForm(true)
  }

  const handleOthersSubmit = () => {
    if (!othersIncidentName.trim()) {
      return
    }

    const userId = userProfile?.userId || user?.id
    if (!userId) {
      return
    }

    const reportData: ReportData = {
      userId: userId,
      incidentType: "other",
      incidentName: othersIncidentName.trim(),
      location: {
        coordinates: {
          latitude: userLocation?.latitude || 0,
          longitude: userLocation?.longitude || 0,
        },
        locationUrl: userLocation 
          ? `https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`
          : '',
        locationName: userLocation?.address || 'Unknown location',
      },
      station: {
        name: station?.name || 'Unknown Station',
        address: station?.address || 'Unknown Address',
        latitude: station?.latitude || 0,
        longitude: station?.longitude || 0,
        placeId: station?.placeId,
        phone: station?.phone,
      },
      reportedAt: new Date().toISOString(),
      status: 'pending',
      priority: 'low',
      description: othersDescription.trim() || undefined,
    }

    onTypeSelect("other", reportData)
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
          {/* Modal Handle */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <Animated.View style={[styles.modalHeader, { opacity: fadeAnim }]}>
            <View style={styles.headerIconContainer}>
              <LinearGradient colors={[Colors.danger, Colors.primary]} style={styles.headerIcon}>
                <MaterialIcons name="local-fire-department" size={28} color={Colors.surface} />
              </LinearGradient>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.modalTitle}>Report Emergency</Text>
              <Text style={styles.modalSubtitle}>
                {station ? `At ${station.name}` : "Select incident type to report"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.tertiary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Emergency Call Button */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <PulsingCallButton onPress={handleCall} station={station} />
          </Animated.View>

          {/* Incident Types Grid */}
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Select Emergency Type</Text>
            <View style={styles.incidentTypesGrid}>
              {incidentTypes.map((type) => (
                <IncidentTypeCard
                  key={type.id}
                  type={type}
                  onPress={() => handleTypeSelect(type.id)}
                  isSelected={selectedType === type.id}
                />
              ))}
              {/* Others Card - inline with other emergency types, beside Hazmat */}
              <TouchableOpacity
              style={[styles.incidentTypeCard, styles.othersCard]}
              onPress={handleOthersPress}
              activeOpacity={0.9}
            >
              <View style={[styles.incidentTypeIcon, { backgroundColor: Colors.primary + "20" }]}>
                <Ionicons name="add-circle" size={22} color={Colors.primary} />
              </View>
              <Text style={[styles.incidentTypeLabel, { color: Colors.primary }]}>Others</Text>
              <Text style={styles.incidentTypeDescription} numberOfLines={2}>
                Other emergency type
              </Text>
            </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Others Form Modal Overlay */}
          {showOthersForm && (
            <View style={styles.othersFormOverlay}>
              <TouchableOpacity 
                style={styles.othersFormBackdrop}
                activeOpacity={1}
                onPress={() => setShowOthersForm(false)}
              />
              <View style={styles.othersFormContainer}>
              <ScrollView 
                style={styles.othersFormScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.othersFormHeader}>
                  <Text style={styles.othersFormTitle}>Report Other Emergency</Text>
                  <TouchableOpacity onPress={() => setShowOthersForm(false)}>
                    <Ionicons name="close" size={24} color={Colors.tertiary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.othersFormField}>
                  <Text style={styles.othersFormLabel}>Incident Type Name *</Text>
                  <TextInput
                    style={styles.othersFormInput}
                    placeholder="e.g., Power outage, Structural damage"
                    placeholderTextColor={Colors.tertiary}
                    value={othersIncidentName}
                    onChangeText={setOthersIncidentName}
                  />
                </View>

                <View style={styles.othersFormField}>
                  <Text style={styles.othersFormLabel}>Description</Text>
                  <TextInput
                    style={[styles.othersFormInput, styles.othersFormTextArea]}
                    placeholder="Provide additional details about the emergency"
                    placeholderTextColor={Colors.tertiary}
                    value={othersDescription}
                    onChangeText={setOthersDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.othersStationInfo}>
                  <Ionicons name="business" size={16} color={Colors.primary} />
                  <Text style={styles.othersStationText}>
                    Will be sent to: {station?.name || 'Nearest Fire Station'}
                  </Text>
                </View>

                <View style={styles.othersLocationInfo}>
                  <Ionicons name="location" size={16} color={Colors.primary} />
                  <Text style={styles.othersLocationText}>
                    Location: {userLocation?.address || 'Current location'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.othersSubmitButton, !othersIncidentName.trim() && styles.othersSubmitButtonDisabled]}
                  onPress={handleOthersSubmit}
                  disabled={!othersIncidentName.trim()}
                  activeOpacity={0.8}
                >
                    <Text style={styles.othersSubmitButtonText}>Submit Report</Text>
                </TouchableOpacity>
              </ScrollView>
              </View>
            </View>
          )}

          {/* Location Info */}
          {station && (
            <Animated.View style={[styles.locationInfo, { opacity: fadeAnim }]}>
              <Ionicons name="location" size={16} color={Colors.accent} />
              <Text style={styles.locationText}>Report will be sent to {station.name}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.85,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 24,
  },
  modalHandle: {
    width: 48,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerIconContainer: {
    marginRight: 16,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.secondary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.tertiary,
    fontWeight: "500",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyCallContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  emergencyCallButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  emergencyCallGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  callIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  emergencyCallText: {
    flex: 1,
  },
  emergencyCallTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.surface,
    marginBottom: 4,
  },
  emergencyCallSubtitle: {
    fontSize: 16,
    color: Colors.surface,
    opacity: 0.9,
    fontWeight: "500",
  },
  emergencyCallPulse: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    opacity: 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyCallPulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
  },
  contentContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 20,
  },
  incidentTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  incidentTypeCard: {
    width: (width - 80) / 3,
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedIncidentType: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  incidentTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    alignSelf: "center",
  },
  incidentTypeLabel: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  incidentTypeDescription: {
    fontSize: 11,
    color: Colors.tertiary,
    textAlign: "center",
    lineHeight: 14,
    fontWeight: "500",
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  locationText: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: "600",
    flex: 1,
  },
  actionButtons: {
    paddingHorizontal: 24,
  },
  cancelButton: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.tertiary,
  },
  othersCard: {
    backgroundColor: "#FEE2E2",
  },
  othersFormOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  othersFormBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  othersFormContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginHorizontal: 24,
    maxHeight: height * 0.6,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    width: width - 48,
  },
  othersFormScroll: {
    padding: 20,
  },
  othersFormHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  othersFormTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.secondary,
  },
  othersFormField: {
    marginBottom: 16,
  },
  othersFormLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 8,
  },
  othersFormInput: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  othersFormTextArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  othersStationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  othersStationText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: "500",
    flex: 1,
  },
  othersLocationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  othersLocationText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: "500",
    flex: 1,
  },
  othersSubmitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  othersSubmitButtonDisabled: {
    backgroundColor: Colors.tertiary,
    opacity: 0.5,
  },
  othersSubmitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.surface,
  },
}) 