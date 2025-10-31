import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { useFireReportsStore } from '../store/fireReportsStore';

interface ReportData {
  userId: string;
  incidentType: string;
  incidentName: string;
  location: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    locationUrl: string;
    locationName: string;
  };
  station: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    placeId?: string;
    phone?: string;
  };
  reportedAt: string;
  status: string;
  priority: string;
}

interface EmergencyReportAlertProps {
  visible: boolean;
  reportData: ReportData | null;
  userInfo?: {
    name: string;
    phone: string;
    image?: string;
    ghanaPostAddress?: string;
  } | null;
  onConfirm: (success: boolean, message: string) => void;
  onCancel?: () => void;
}

const EmergencyReportAlert: React.FC<EmergencyReportAlertProps> = ({
  visible,
  reportData,
  userInfo,
  onConfirm,
  onCancel,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createFireReport, isCreating } = useFireReportsStore();

  useEffect(() => {
    if (visible) {
      // Vibrate on open
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Vibration.vibrate([0, 100, 50, 100]);
      }

      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Flash animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      pulseAnim.stopAnimation();
      flashAnim.stopAnimation();
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!reportData || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('🚨 Submitting fire report to backend:', reportData);
      
      const result = await createFireReport(reportData);
      
      if (result.success) {
        console.log('✅ Fire report submitted successfully:', result.message);
        onConfirm(true, result.message || 'Fire report submitted successfully!');
      } else {
        console.log('❌ Fire report submission failed:', result.message);
        onConfirm(false, result.message || 'Failed to submit fire report');
      }
    } catch (error) {
      console.error('❌ Error submitting fire report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit fire report';
      onConfirm(false, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reportData) return null;

  const getIncidentIcon = () => {
    switch (reportData.incidentType) {
      case 'fire':
        return 'flame';
      case 'accident':
        return 'car-outline';
      case 'flood':
        return 'water';
      case 'medical':
        return 'medical';
      case 'gas':
        return 'warning';
      default:
        return 'alert-circle';
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.alertContainer, { transform: [{ scale: scaleAnim }] }]}>
          {/* Emergency Header */}
          <LinearGradient
            colors={['#DC2626', '#B91C1C']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={[styles.flashIndicator, { opacity: flashAnim }]} />
            
            <View style={styles.headerTop}>
              <View style={styles.emergencyBadge}>
                <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
              </View>
              <Text style={styles.timestamp}>{new Date().toLocaleTimeString()}</Text>
            </View>

            <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name={getIncidentIcon()} size={56} color="#fff" />
            </Animated.View>

            <Text style={styles.incidentTitle}>{reportData.incidentName}</Text>
            <Text style={styles.incidentSubtitle}>Report Ready to Submit</Text>
          </LinearGradient>

          {/* Report Details */}
          <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
            {/* Location Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBg}>
                  <Ionicons name="location" size={20} color="#DC2626" />
                </View>
                <Text style={styles.sectionTitle}>INCIDENT LOCATION</Text>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>{reportData.location.locationName}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Coordinates:</Text>
                  <Text style={styles.infoValue}>
                    {reportData.location.coordinates.latitude.toFixed(6)}, {reportData.location.coordinates.longitude.toFixed(6)}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Map Link:</Text>
                  <Text style={[styles.infoValue, styles.linkText]} numberOfLines={1}>
                    Google Maps URL
                  </Text>
                </View>
              </View>
            </View>

            {/* Reporter Section */}
            {userInfo && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBg}>
                    <Ionicons name="person" size={20} color="#DC2626" />
                  </View>
                  <Text style={styles.sectionTitle}>REPORTED BY</Text>
                </View>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.infoValue}>{userInfo.name}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text style={styles.infoValue}>{userInfo.phone}</Text>
                  </View>
                  {userInfo.ghanaPostAddress && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ghana Post:</Text>
                        <Text style={styles.infoValue}>{userInfo.ghanaPostAddress}</Text>
                      </View>
                    </>
                  )}
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>User ID:</Text>
                    <Text style={[styles.infoValue, styles.idText]} numberOfLines={1}>
                      {reportData?.userId}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Fire Station Section */}
            {reportData.station && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBg}>
                    <Ionicons name="business" size={20} color="#DC2626" />
                  </View>
                  <Text style={styles.sectionTitle}>NEAREST STATION</Text>
                </View>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Station:</Text>
                    <Text style={styles.infoValue}>{reportData.station.name}</Text>
                  </View>
                  {reportData.station.phone && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Contact:</Text>
                        <Text style={styles.infoValue}>{reportData.station.phone}</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Warning Message */}
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                This report will be sent to emergency services. Please ensure all information is accurate.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {onCancel && (
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.8}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]} 
              onPress={handleConfirm} 
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <LinearGradient colors={['#DC2626', '#B91C1C']} style={styles.confirmGradient}>
                {isSubmitting ? (
                  <>
                    <Ionicons name="hourglass" size={20} color="#fff" />
                    <Text style={styles.confirmButtonText}>Submitting...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.confirmButtonText}>Confirm Report</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 450,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  headerGradient: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  flashIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#FEF3C7',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  emergencyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emergencyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  timestamp: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  incidentTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  incidentSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '600',
  },
  detailsContainer: {
    maxHeight: 400,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: 1.2,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    minWidth: 90,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  linkText: {
    color: '#2563EB',
  },
  idText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export default EmergencyReportAlert;


