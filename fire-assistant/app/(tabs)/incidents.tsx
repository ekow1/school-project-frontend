import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { AnimatedScreen } from '../../components/AnimatedScreen';
import UpdateIncidentModal from '../../components/UpdateIncidentModal';
import { useAuthStore } from '../../store/authStore';
import { FireReport, useFireReportsStore } from '../../store/fireReportsStore';

const statusColors = {
  pending: { bg: '#FEF3C7', border: '#F59E0B', text: '#D97706' },
  'in-progress': { bg: '#DBEAFE', border: '#3B82F6', text: '#1D4ED8' },
  resolved: { bg: '#D1FAE5', border: '#10B981', text: '#059669' },
  cancelled: { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626' },
  canceled: { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626' }, // Alternative spelling
};

const priorityColors = {
  low: { bg: '#F3F4F6', text: '#6B7280' },
  medium: { bg: '#FEF3C7', text: '#D97706' },
  high: { bg: '#FEE2E2', text: '#DC2626' },
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
  const [selectedIncident, setSelectedIncident] = useState<FireReport | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const isFireOfficer = user?.userType === 'fire_officer';

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
        ...(isFireOfficer ? [{
          text: 'Update',
          onPress: () => {
            setSelectedIncident(report);
            setShowUpdateModal(true);
          }
        }] : []),
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

  const handleUpdateSuccess = () => {
    fetchIncidents();
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
              color={refreshing ? "#9CA3AF" : "#D32F2F"} 
            />
          </TouchableOpacity>
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D32F2F" />
            <Text style={styles.loadingText}>Loading incidents...</Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
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
                    <LinearGradient
                      colors={['#D32F2F', '#FF6659']}
                      style={styles.reportIcon}
                    >
                      <Ionicons
                        name={getIncidentIcon(report.incidentType)}
                        size={20}
                        color="white"
                      />
                    </LinearGradient>
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
                  <Ionicons name="location" size={14} color="#6B7280" />
                  <Text style={styles.locationText}>{report.location?.locationName || 'Unknown location'}</Text>
                </View>
                <View style={styles.reportStation}>
                  <Ionicons name="business" size={14} color="#6B7280" />
                  <Text style={styles.stationText}>{report.station?.name || 'Unknown Station'}</Text>
                </View>
                {isFireOfficer && (
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedIncident(report);
                      setShowUpdateModal(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.updateButtonText}>Update</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
        </ScrollView>
        </View>
      </AnimatedScreen>
      
      <UpdateIncidentModal
        visible={showUpdateModal}
        incident={selectedIncident}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedIncident(null);
        }}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportIconContainer: {
    marginRight: 12,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  reportType: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '600',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  reportStatus: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priorityBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  reportDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  reportStation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  stationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 