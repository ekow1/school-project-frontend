import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { AnimatedScreen } from '../../components/AnimatedScreen';
import { useAuthStore } from '../../store/authStore';
import { FireReport, useFireReportsStore } from '../../store/fireReportsStore';

const statusColors = {
  pending: { bg: Colors.warningAlpha, border: Colors.warning, text: Colors.brown },
  'in-progress': { bg: Colors.accentAlpha, border: Colors.accent, text: Colors.accent },
  resolved: { bg: Colors.successAlpha, border: Colors.success, text: Colors.success },
  cancelled: { bg: Colors.primaryAlpha, border: Colors.primary, text: Colors.primary },
  canceled: { bg: Colors.primaryAlpha, border: Colors.primary, text: Colors.primary },
};

const priorityColors = {
  low: { bg: Colors.surfaceVariant, text: Colors.tertiary },
  medium: { bg: Colors.warningAlpha, text: Colors.brown },
  high: { bg: Colors.primaryAlpha, text: Colors.primary },
};

// Helper function to safely get status colors with fallback
const getStatusColors = (status: string) => {
  return statusColors[status as keyof typeof statusColors] || 
         statusColors.pending; // Default to pending if status not found
};

// Helper function to safely get priority colors with fallback
const getPriorityColors = (priority: string) => {
  return priorityColors[priority as keyof typeof priorityColors] || 
         priorityColors.medium; // Default to medium if priority not found
};

const incidentTypeIcons = {
  fire: 'flame',
  flood: 'water',
  'building-collapse': 'business',
  'gas-leak': 'warning',
  'fuel-leak': 'car',
  'natural-disaster': 'warning',
  hazmat: 'nuclear',
  other: 'alert-circle',
};

export default function IncidentsScreen() {
  const { user } = useAuthStore();
  const { 
    reports, 
    isLoading, 
    error, 
    getAllFireReports, 
    clearError 
  } = useFireReportsStore();
  
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all incidents on component mount
  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      console.log('📋 Fetching all incidents');
      await getAllFireReports();
    } catch (error) {
      console.error('❌ Error fetching incidents:', error);
      Alert.alert(
        'Error', 
        'Failed to load incidents. Please try again.',
        [{ text: 'OK', onPress: clearError }]
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchIncidents();
    setRefreshing(false);
  };

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
      `Status: ${report.status}\nPriority: ${report.priority}\nLocation: ${report.location?.locationName || 'Unknown location'}\nStation: ${report.station?.name || 'Unknown station'}\nReported: ${formatDate(report.reportedAt)}\n\n${report.description || 'No additional description provided.'}`,
      [
        { text: 'OK' },
        { 
          text: 'View Location', 
          onPress: () => {
            // You could implement opening the location URL here
            console.log('Location URL:', report.location.locationUrl);
          }
        }
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'checkmark-circle';
      case 'in-progress':
        return 'sync';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  const getIncidentIcon = (incidentType: string) => {
    return incidentTypeIcons[incidentType as keyof typeof incidentTypeIcons] || 'alert-circle';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <AnimatedScreen direction="up" delay={100}>
        <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>All Incidents</Text>
          <TouchableOpacity 
            style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]} 
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Ionicons 
              name={refreshing ? "hourglass" : "refresh"} 
              size={20} 
              color={refreshing ? "#A09080" : "#C41230"} 
            />
          </TouchableOpacity>
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C41230" />
            <Text style={styles.loadingText}>Loading incidents...</Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#A09080" />
            <Text style={styles.emptyTitle}>No Incidents Found</Text>
            <Text style={styles.emptyMessage}>
              No incidents reported at this time.
            </Text>
          </View>
        ) : (
          <>
            {reports.map((report) => (
              <TouchableOpacity
                key={report._id}
                style={styles.reportCard}
                onPress={() => handleReportPress(report)}
                activeOpacity={0.7}
              >
                <View style={styles.reportHeader}>
                  <View style={styles.reportIconContainer}>
                    <View style={styles.reportIcon}>
                      <Ionicons
                        name={getIncidentIcon(report.incidentType)}
                        size={20}
                        color="white"
                      />
                    </View>
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{report.incidentName}</Text>
                    <Text style={styles.reportType}>{report.incidentType.toUpperCase()}</Text>
                    <Text style={styles.reportDate}>{formatDate(report.reportedAt)}</Text>
                  </View>
                  <View style={styles.reportStatus}>
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
                        style={[
                          styles.statusText,
                          { color: getStatusColors(report.status).text },
                        ]}
                      >
                        {report.status.replace('-', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor: getPriorityColors(report.priority).bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          { color: getPriorityColors(report.priority).text },
                        ]}
                      >
                        {report.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reportDescription} numberOfLines={2}>
                  {report.description || 'No additional description provided.'}
                </Text>
                <View style={styles.reportLocation}>
                  <Ionicons name="location" size={14} color="#78716C" />
                  <Text style={styles.locationText}>{report.location?.locationName || 'Unknown location'}</Text>
                </View>
                <View style={styles.reportStation}>
                  <Ionicons name="business" size={14} color="#78716C" />
                  <Text style={styles.stationText}>{report.station?.name || 'Unknown Station'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
        </ScrollView>
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NB.bg },
  container: { flex: 1, backgroundColor: NB.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: NB.surface,
    borderBottomWidth: 3,
    borderBottomColor: NB.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: NB.border, textTransform: 'uppercase', letterSpacing: 0.5 },
  refreshButton: {
    width: 40, height: 40,
    backgroundColor: NB.primary,
    borderWidth: 2, borderColor: NB.border,
    justifyContent: 'center', alignItems: 'center',
    ...nbShadow,
  },
  refreshButtonDisabled: { backgroundColor: '#F5EDE3' },
  content: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 15, color: NB.muted, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: NB.border, marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  emptyMessage: { fontSize: 15, color: NB.muted, textAlign: 'center', lineHeight: 22 },
  reportCard: {
    backgroundColor: NB.surface,
    borderRadius: 0,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: NB.border,
    ...nbShadow,
  },
  reportHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  reportIconContainer: { marginRight: 12 },
  reportIcon: {
    width: 40, height: 40,
    backgroundColor: NB.primary,
    borderWidth: 2, borderColor: NB.border,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: NB.border, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 15, fontWeight: '800', color: NB.border, marginBottom: 3 },
  reportType: { fontSize: 11, color: NB.primary, fontWeight: '800', marginBottom: 2, letterSpacing: 1, textTransform: 'uppercase' },
  reportDate: { fontSize: 11, color: NB.muted, fontWeight: '600' },
  reportStatus: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { borderRadius: 0, paddingHorizontal: 7, paddingVertical: 4, borderWidth: 2 },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  priorityBadge: { borderRadius: 0, paddingHorizontal: 6, paddingVertical: 3, borderWidth: 2, borderColor: NB.border },
  priorityText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  reportDescription: { fontSize: 13, color: NB.muted, lineHeight: 19, marginBottom: 10 },
  reportLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: NB.muted, fontWeight: '500' },
  reportStation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  stationText: { fontSize: 12, color: NB.muted, fontWeight: '500' },
}); 