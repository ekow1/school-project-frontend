import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { FireStation } from '../utils/fireStationSearch';

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
};

interface FireStationDetailCardProps {
  station: FireStation;
  index?: number;
  onPress?: (station: FireStation) => void;
  onStationClick?: (stationData: {
    name: string;
    location: string;
    location_url: string;
    latitude: number;
    longitude: number;
    phone_number: string | null;
    placeId?: string;
  }) => void;
  onSendToBackend?: (stationData: {
    name: string;
    location: string;
    location_url: string;
    latitude: number;
    longitude: number;
    phone_number: string | null;
    placeId?: string;
  }) => void;
  showRanking?: boolean;
}

export const FireStationDetailCard: React.FC<FireStationDetailCardProps> = ({
  station,
  index = 0,
  onPress,
  onStationClick,
  onSendToBackend,
  showRanking = true,
}) => {
  const handleCallStation = () => {
    if (station.phone) {
      Linking.openURL(`tel:${station.phone}`);
    } else {
      Alert.alert('No Phone Number', 'Phone number not available for this station.');
    }
  };

  const handleDirections = () => {
    const url = `https://maps.google.com/maps?daddr=${station.latitude},${station.longitude}`;
    Linking.openURL(url);
  };


  const handleShareLocation = () => {
    const url = `https://maps.google.com/maps?q=${station.latitude},${station.longitude}`;
    Alert.alert(
      'Share Location',
      `Share the location of ${station.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => Linking.openURL(url) },
      ]
    );
  };

  const handleStationClick = () => {
    const stationData = {
      name: station.name,
      location: station.address,
      location_url: `https://maps.google.com/maps?q=${station.latitude},${station.longitude}`,
      latitude: station.latitude,
      longitude: station.longitude,
      phone_number: station.phone || null,
      placeId: station.placeId
    };
    
    onStationClick?.(stationData);
  };

  const handleSendToBackend = () => {
    const stationData = {
      name: station.name,
      location: station.address,
      location_url: `https://maps.google.com/maps?q=${station.latitude},${station.longitude}`,
      latitude: station.latitude,
      longitude: station.longitude,
      phone_number: station.phone || null,
      placeId: station.placeId
    };
    
    onSendToBackend?.(stationData);
  };

  const getRankingColor = (rank?: string) => {
    switch (rank) {
      case 'Excellent': return Colors.success;
      case 'Very Good': return Colors.accent;
      case 'Good': return Colors.warning;
      case 'Fair': return Colors.primary;
      default: return Colors.tertiary;
    }
  };

  const getRankingIcon = (rank?: string) => {
    switch (rank) {
      case 'Excellent': return 'star';
      case 'Very Good': return 'star-half';
      case 'Good': return 'star-outline';
      case 'Fair': return 'star-outline';
      default: return 'location-outline';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        onPress?.(station);
        handleStationClick();
      }}
      activeOpacity={0.8}
    >
      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="fire-truck" size={24} color={Colors.primary} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.stationName} numberOfLines={2}>
              {station.name}
            </Text>
            <Text style={styles.stationAddress} numberOfLines={2}>
              {station.address}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          {showRanking && station.proximityRank && (
            <View style={[styles.rankingBadge, { backgroundColor: getRankingColor(station.proximityRank) + '20' }]}>
              <Ionicons 
                name={getRankingIcon(station.proximityRank) as any} 
                size={12} 
                color={getRankingColor(station.proximityRank)} 
              />
              <Text style={[styles.rankingText, { color: getRankingColor(station.proximityRank) }]}>
                {station.proximityRank}
              </Text>
            </View>
          )}
          
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              {station.routeDistanceText || `${station.straightLineDistance?.toFixed(1) || 'N/A'}km`}
            </Text>
          </View>
        </View>
      </View>

      {/* Station Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={Colors.tertiary} />
          <Text style={styles.detailLabel}>Coordinates:</Text>
          <Text style={styles.detailValue}>
            {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
          </Text>
        </View>
        
        {station.phone && (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color={Colors.tertiary} />
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{station.phone}</Text>
          </View>
        )}
        
        {station.travelTimeText && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={Colors.tertiary} />
            <Text style={styles.detailLabel}>Travel Time:</Text>
            <Text style={styles.detailValue}>{station.travelTimeText}</Text>
          </View>
        )}

        {station.isServiceAreaStation && station.serviceNote && (
          <View style={styles.detailRow}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.accent} />
            <Text style={styles.detailLabel}>Service Area:</Text>
            <Text style={[styles.detailValue, { color: Colors.accent }]}>{station.serviceNote}</Text>
          </View>
        )}

        {station.rating && (
          <View style={styles.detailRow}>
            <Ionicons name="star-outline" size={16} color={Colors.warning} />
            <Text style={styles.detailLabel}>Rating:</Text>
            <Text style={styles.detailValue}>{station.rating.toFixed(1)}/5.0</Text>
          </View>
        )}

        {station.isOpen !== undefined && (
          <View style={styles.detailRow}>
            <Ionicons 
              name={station.isOpen ? "checkmark-circle-outline" : "close-circle-outline"} 
              size={16} 
              color={station.isOpen ? Colors.success : Colors.danger} 
            />
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, { color: station.isOpen ? Colors.success : Colors.danger }]}>
              {station.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDirections}
        >
          <Ionicons name="navigate-outline" size={18} color={Colors.accent} />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[styles.actionButton, !station.phone && styles.actionButtonDisabled]}
          onPress={handleCallStation}
          disabled={!station.phone}
        >
          <Ionicons name="call-outline" size={18} color={station.phone ? Colors.success : Colors.tertiary} />
          <Text style={[styles.actionButtonText, !station.phone && styles.actionButtonTextDisabled]}>
            {station.phone ? 'Call' : 'No Phone'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShareLocation}
        >
          <Ionicons name="share-outline" size={18} color={Colors.warning} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.sendToBackendButton]}
          onPress={handleSendToBackend}
        >
          <Ionicons name="cloud-upload-outline" size={18} color={Colors.surface} />
          <Text style={[styles.actionButtonText, styles.sendToBackendText]}>Send</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryAlpha,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: Colors.tertiary,
    lineHeight: 20,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  rankingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rankingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  distanceBadge: {
    backgroundColor: Colors.accentAlpha,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.tertiary,
    marginLeft: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.secondary,
    flex: 1,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginLeft: 4,
  },
  actionButtonTextDisabled: {
    color: Colors.tertiary,
  },
  sendToBackendButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sendToBackendText: {
    color: Colors.surface,
    fontWeight: '700',
  },
});

export default FireStationDetailCard;
