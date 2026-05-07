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
  primary: "#C41230",
  primaryLight: "#E85B4A",
  primaryDark: "#8B0D21",
  secondary: "#1A1A1A",
  tertiary: "#78716C",
  background: "#FFF8EF",
  surface: "#FFFFFF",
  surfaceVariant: "#F5EDE3",
  border: "#D4C4B5",
  success: "#10B981",
  warning: "#E8A020",
  danger: "#EF4444",
  accent: "#7C2D12",
  shadow: "rgba(0, 0, 0, 0.1)",
  primaryAlpha: "rgba(196, 18, 48, 0.1)",
  warningAlpha: "rgba(232, 160, 32, 0.1)",
  successAlpha: "rgba(16, 185, 129, 0.1)",
  activeTab: "#C41230",
  referredTab: "#7C2D12",
  closedTab: "#78716C",
};

type TabType = 'active' | 'referred' | 'closed';

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
  const { user, getProfile } = useAuthStore();
  const {
    reports,
    isLoading,
    getAllFireReports,
    clearError
  } = useFireReportsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('active');

  useEffect(() => {
    fetchIncidents();
    // Fetch officer profile if user is a fire officer
    if (user?.userType === 'fire_officer') {
      fetchOfficerProfile();
    }
  }, []);

  const fetchOfficerProfile = async () => {
    try {
      console.log('Fetching officer profile...');
      const profile = await getProfile();
      console.log('Officer profile fetched:', profile);
    } catch (error) {
      console.error('Error fetching officer profile:', error);
    }
  };

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

  // Filter incidents based on status categories
  const getActiveIncidents = () => {
    return reports.filter((report: any) => {
      const status = report.status?.toLowerCase();
      // Active: dispatched, on-scene, active
      return status === 'dispatched' || status === 'on-scene' || status === 'active';
    });
  };

  const getReferredIncidents = () => {
    return reports.filter((report: any) => {
      const status = report.status?.toLowerCase();
      return status === 'referred';
    });
  };

  const getClosedIncidents = () => {
    return reports.filter((report: any) => {
      const status = report.status?.toLowerCase();
      return status === 'closed' || status === 'resolved' || status === 'completed';
    });
  };

  const getFilteredIncidents = () => {
    switch (activeTab) {
      case 'active':
        return getActiveIncidents();
      case 'referred':
        return getReferredIncidents();
      case 'closed':
        return getClosedIncidents();
      default:
        return getActiveIncidents();
    }
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

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'dispatched':
      case 'on-scene':
      case 'active':
        return Colors.activeTab;
      case 'referred':
        return Colors.referredTab;
      case 'closed':
      case 'resolved':
      case 'completed':
        return Colors.closedTab;
      default:
        return Colors.tertiary;
    }
  };

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'dispatched':
        return 'Dispatched';
      case 'on-scene':
        return 'On Scene';
      case 'active':
        return 'Active';
      case 'referred':
        return 'Referred';
      case 'closed':
        return 'Closed';
      case 'resolved':
        return 'Resolved';
      case 'completed':
        return 'Completed';
      default:
        return status || 'Unknown';
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
    const statusColor = getStatusColor(report.status);
    const statusLabel = getStatusLabel(report.status);

    return (
      <View key={report._id} style={styles.slipCard}>
        {/* Status Indicator Bar */}
        <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

        {/* Card Header with Gradient Effect */}
        <View style={styles.cardHeader}>
          <View style={styles.headerTop}>
            <View style={[styles.incidentIconContainer, { backgroundColor: statusColor + '15' }]}>
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
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {statusLabel}
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
              {getFilteredIncidents().length} incident{getFilteredIncidents().length !== 1 ? 's' : ''} in {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab
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

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.8}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name={activeTab === 'active' ? "radio-button-on" : "radio-button-off"}
              size={18}
              color={activeTab === 'active' ? Colors.activeTab : Colors.tertiary}
            />
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Active
            </Text>
            <View style={[styles.tabBadge, { backgroundColor: Colors.activeTab }]}>
              <Text style={styles.tabBadgeText}>{getActiveIncidents().length}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'referred' && styles.activeTab]}
          onPress={() => setActiveTab('referred')}
          activeOpacity={0.8}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name={activeTab === 'referred' ? "share" : "share-outline"}
              size={18}
              color={activeTab === 'referred' ? Colors.referredTab : Colors.tertiary}
            />
            <Text style={[styles.tabText, activeTab === 'referred' && { color: Colors.referredTab }]}>
              Referred
            </Text>
            <View style={[styles.tabBadge, { backgroundColor: Colors.referredTab }]}>
              <Text style={styles.tabBadgeText}>{getReferredIncidents().length}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'closed' && styles.activeTab]}
          onPress={() => setActiveTab('closed')}
          activeOpacity={0.8}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name={activeTab === 'closed' ? "checkmark-circle" : "checkmark-circle-outline"}
              size={18}
              color={activeTab === 'closed' ? Colors.closedTab : Colors.tertiary}
            />
            <Text style={[styles.tabText, activeTab === 'closed' && { color: Colors.closedTab }]}>
              Closed
            </Text>
            <View style={[styles.tabBadge, { backgroundColor: Colors.closedTab }]}>
              <Text style={styles.tabBadgeText}>{getClosedIncidents().length}</Text>
            </View>
          </View>
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
        ) : getFilteredIncidents().length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name={activeTab === 'active' ? 'alert-circle' : activeTab === 'referred' ? 'share' : 'check-circle'}
              size={64}
              color={Colors.tertiary}
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'No Active Incidents' : activeTab === 'referred' ? 'No Referred Incidents' : 'No Closed Incidents'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'active'
                ? 'No active incidents at the moment'
                : activeTab === 'referred'
                  ? 'No incidents have been referred'
                  : 'No incidents have been closed'}
            </Text>
          </View>
        ) : (
          getFilteredIncidents().map(renderIncidentCard)
        )}
      </ScrollView>
    </View>
  );
}

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C', success: '#10B981' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NB.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: NB.surface,
    borderBottomWidth: 3, borderBottomColor: NB.border,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerIconContainer: {
    width: 44, height: 44, backgroundColor: NB.primary,
    borderWidth: 2, borderColor: NB.border, alignItems: 'center', justifyContent: 'center', marginRight: 14,
    shadowColor: NB.border, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: NB.border, textTransform: 'uppercase', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 12, color: NB.muted, fontWeight: '600', marginTop: 2 },
  refreshButton: {
    width: 44, height: 44, backgroundColor: NB.bg,
    borderWidth: 2, borderColor: NB.border, alignItems: 'center', justifyContent: 'center',
    shadowColor: NB.border, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  tabContainer: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: NB.surface, borderBottomWidth: 3, borderBottomColor: NB.border, gap: 8,
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9,
    borderWidth: 2, borderColor: NB.border, backgroundColor: NB.bg,
  },
  activeTab: {
    backgroundColor: NB.primary,
    shadowColor: NB.border, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabText: { fontSize: 11, fontWeight: '700', color: NB.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  activeTabText: { color: '#fff', fontWeight: '800' },
  tabBadge: {
    minWidth: 20, height: 20, borderWidth: 2, borderColor: NB.border,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tabBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  statusBar: { height: 5, width: '100%' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 2, borderColor: NB.border, gap: 5,
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: NB.border, marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  emptySubtitle: { fontSize: 14, color: NB.muted, textAlign: 'center', paddingHorizontal: 40 },
  slipCard: {
    backgroundColor: NB.surface,
    borderWidth: 2, borderColor: NB.border,
    marginBottom: 18, overflow: 'hidden',
    ...nbShadow,
  },
  cardHeader: {
    backgroundColor: Colors.warningAlpha, paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 2, borderBottomColor: NB.border,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  incidentIconContainer: {
    width: 52, height: 52, borderWidth: 2, borderColor: NB.border,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
    shadowColor: NB.border, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  headerTitleContainer: { flex: 1 },
  incidentTitle: { fontSize: 17, fontWeight: '800', color: NB.border, marginBottom: 7 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 2, borderColor: NB.border, gap: 5,
  },
  priorityDot: { width: 6, height: 6 },
  priorityText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  dateTimeContainer: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  dateText: { fontSize: 12, color: NB.muted, fontWeight: '600' },
  cardBody: { padding: 16 },
  infoSection: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 7 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: NB.border, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoCard: {
    backgroundColor: '#FFF8EF', borderWidth: 2, borderColor: NB.border, padding: 14,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoLabel: { fontSize: 12, color: NB.muted, fontWeight: '700', width: 90, textTransform: 'uppercase', letterSpacing: 0.3 },
  infoValue: { fontSize: 13, color: NB.border, fontWeight: '600', flex: 1, textAlign: 'right' },
  coordinateValue: {
    fontSize: 11, color: NB.border, fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', flex: 1, textAlign: 'right',
  },
  infoDivider: { height: 2, backgroundColor: NB.border, marginVertical: 10, opacity: 0.1 },
  mapLinkButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 9, paddingHorizontal: 12,
    borderWidth: 2, borderColor: NB.border, backgroundColor: Colors.warningAlpha, gap: 7,
  },
  mapLinkText: { flex: 1, fontSize: 13, color: NB.primary, fontWeight: '700' },
  actionButtonsContainer: {
    flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, paddingTop: 14,
    gap: 10, borderTopWidth: 2, borderTopColor: NB.border,
  },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderWidth: 2, borderColor: NB.border, gap: 7,
    shadowColor: NB.border, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  actionButtonDisabled: { backgroundColor: '#F5EDE3', shadowOpacity: 0, elevation: 0, borderColor: '#A09080' },
  callButton: { backgroundColor: NB.success },
  directionsButton: { backgroundColor: NB.primary },
  buttonIconContainer: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { fontSize: 13, fontWeight: '800', color: NB.surface, textTransform: 'uppercase', letterSpacing: 0.5 },
  actionButtonTextDisabled: { color: NB.muted },
});
