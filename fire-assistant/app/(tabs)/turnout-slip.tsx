import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { FireReport, useFireReportsStore } from '../../store/fireReportsStore';

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
};

interface IncidentUser {
  name?: string;
  phone?: string;
}

const incidentTypeIcons: { [key: string]: string } = {
  fire: 'flame',
  flood: 'water',
  'building-collapse': 'business',
  'gas-leak': 'warning',
  'fuel-leak': 'car',
  'natural-disaster': 'warning',
  hazmat: 'nuclear',
  'medical-emergency': 'medical',
  rescue: 'people',
  other: 'alert-circle',
};

export default function TurnoutSlipScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { 
    reports, 
    isLoading, 
    getAllFireReports, 
    clearError 
  } = useFireReportsStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      await getAllFireReports();
    } catch (error) {
      console.error('Error fetching incidents:', error);
      Alert.alert(
        'Error',
        'Failed to load incidents. Please try again.',
        [{ text: 'OK', onPress: clearError }]
      );
    }
  };

  // Filter incidents to show only dispatched and onwards (not pending or accepted)
  const getDispatchedIncidents = () => {
    return reports.filter((report: any) => {
      const status = report.status?.toLowerCase();
      // Only show dispatched, on-scene, completed, resolved, etc.
      // Exclude pending and accepted
      return status !== 'pending' && status !== 'accepted';
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchIncidents();
    setRefreshing(false);
  };

  const handleCall = (phone: string) => {
    if (phone) {
      const phoneNumber = phone.startsWith('+') ? phone : `+${phone}`;
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('No Phone Number', 'Phone number not available for this reporter.');
    }
  };

  const handleDirections = (report: FireReport) => {
    const { latitude, longitude } = report.location?.coordinates || {};
    if (latitude && longitude) {
      const url = `https://maps.google.com/maps?daddr=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('No Location', 'Location coordinates not available for this incident.');
    }
  };

  const getIncidentIcon = (type: string) => {
    return incidentTypeIcons[type] || 'alert-circle';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Extract user info from report - check for reporterName and reporterPhone in the incident data
  const getReporterInfo = (report: FireReport): IncidentUser => {
    const incidentData = report as any;
    
    // Check for reporterName and reporterPhone (from incidents API)
    if (incidentData.reporterName || incidentData.reporterPhone) {
      return {
        name: incidentData.reporterName || 'Unknown',
        phone: incidentData.reporterPhone || '',
      };
    }
    
    // Fallback: Check if the report has populated user data
    const userData = incidentData.user || incidentData.reporter;
    if (userData) {
      return {
        name: userData.name || 'Unknown',
        phone: userData.phone || '',
      };
    }
    
    // If no populated user data, we only have userId
    return {
      name: 'User ID: ' + (report.userId?.substring(0, 8) || 'Unknown'),
      phone: '',
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return Colors.danger;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.success;
      default:
        return Colors.tertiary;
    }
  };

  const renderIncidentCard = (report: FireReport) => {
    const reporterInfo = getReporterInfo(report);
    const coordinates = report.location?.coordinates;
    const locationUrl = report.location?.locationUrl || 
      (coordinates 
        ? `https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`
        : '');
    const priorityColor = getPriorityColor(report.priority);

    return (
      <View key={report._id} style={styles.slipCard}>
        {/* Card Header with Gradient Effect */}
        <View style={styles.cardHeader}>
          <View style={styles.headerTop}>
            <View style={[styles.incidentIconContainer, { backgroundColor: Colors.primary + '15' }]}>
              <Ionicons 
                name={getIncidentIcon(report.incidentType) as any} 
                size={28} 
                color={Colors.primary} 
              />
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.incidentTitle} numberOfLines={1}>
                {report.incidentName || report.incidentType}
              </Text>
              <View style={styles.metaRow}>
                <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                  <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                  <Text style={[styles.priorityText, { color: priorityColor }]}>
                    {report.priority?.toUpperCase() || 'MEDIUM'}
                  </Text>
                </View>
              </View>
              <View style={styles.dateTimeContainer}>
                <Ionicons name="calendar-outline" size={14} color={Colors.tertiary} />
                <Text style={styles.dateText}>{formatDate(report.reportedAt)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Sections */}
        <View style={styles.cardBody}>
          {/* Reporter Information Card */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle-outline" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Reporter Information</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{reporterInfo.name}</Text>
              </View>
              {reporterInfo.phone && (
                <View style={styles.infoDivider} />
              )}
              {reporterInfo.phone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{reporterInfo.phone}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Location Information Card */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Location Details</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {report.location?.locationName || 'Unknown location'}
                </Text>
              </View>
              {coordinates && (
                <>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Coordinates</Text>
                    <Text style={styles.coordinateValue}>
                      {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                    </Text>
                  </View>
                </>
              )}
              {locationUrl && (
                <>
                  <View style={styles.infoDivider} />
                  <TouchableOpacity 
                    onPress={() => Linking.openURL(locationUrl)}
                    style={styles.mapLinkButton}
                  >
                    <Ionicons name="map-outline" size={16} color={Colors.primary} />
                    <Text style={styles.mapLinkText}>View on Map</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons - Side by Side */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.callButton,
              !reporterInfo.phone && styles.actionButtonDisabled
            ]}
            onPress={() => reporterInfo.phone && handleCall(reporterInfo.phone)}
            disabled={!reporterInfo.phone}
            activeOpacity={0.8}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons 
                name="call" 
                size={20} 
                color={reporterInfo.phone ? Colors.surface : Colors.tertiary} 
              />
            </View>
            <Text style={[
              styles.actionButtonText,
              !reporterInfo.phone && styles.actionButtonTextDisabled
            ]}>
              Call Reporter
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.directionsButton,
              !coordinates && styles.actionButtonDisabled
            ]}
            onPress={() => coordinates && handleDirections(report)}
            disabled={!coordinates}
            activeOpacity={0.8}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons 
                name="navigate" 
                size={20} 
                color={coordinates ? Colors.surface : Colors.tertiary} 
              />
            </View>
            <Text style={[
              styles.actionButtonText,
              !coordinates && styles.actionButtonTextDisabled
            ]}>
              Get Directions
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={28} color={Colors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Turnout Slips</Text>
            <Text style={styles.headerSubtitle}>
              {getDispatchedIncidents().length} dispatched incident{getDispatchedIncidents().length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isLoading || refreshing}
        >
          <Ionicons 
            name={refreshing ? "hourglass" : "refresh"} 
            size={24} 
            color={Colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Incidents List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading && !refreshing ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.emptyTitle}>Loading Incidents...</Text>
          </View>
        ) : getDispatchedIncidents().length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={Colors.tertiary} />
            <Text style={styles.emptyTitle}>No Dispatched Incidents</Text>
            <Text style={styles.emptySubtitle}>
              No incidents have been dispatched yet
            </Text>
          </View>
        ) : (
          getDispatchedIncidents().map(renderIncidentCard)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryAlpha,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.secondary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.tertiary,
    marginTop: 2,
  },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryAlpha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.tertiary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  slipCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incidentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dateText: {
    fontSize: 13,
    color: Colors.tertiary,
    fontWeight: '500',
  },
  cardBody: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.secondary,
  },
  infoCard: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.tertiary,
    fontWeight: '600',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  coordinateValue: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  mapLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primaryAlpha,
    borderRadius: 8,
    gap: 8,
  },
  mapLinkText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonDisabled: {
    backgroundColor: Colors.surfaceVariant,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  callButton: {
    backgroundColor: Colors.success,
  },
  directionsButton: {
    backgroundColor: Colors.primary,
  },
  buttonIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.surface,
    letterSpacing: 0.3,
  },
  actionButtonTextDisabled: {
    color: Colors.tertiary,
  },
});
