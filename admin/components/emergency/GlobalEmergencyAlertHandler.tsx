'use client';

import React, { useEffect, useState } from 'react';
import { EmergencyAlert } from '@/lib/types/emergencyAlert';
import { useEmergencyAlertsStore } from '@/lib/stores/emergencyAlerts';
import { useAuthStore } from '@/lib/stores/auth';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import EmergencyAlertPopup from './EmergencyAlertPopup';

/**
 * Global component that listens to WebSocket events for emergency alerts
 * and displays the alert popup regardless of the current page.
 * This ensures users are notified of new alerts no matter where they are in the app.
 */
const GlobalEmergencyAlertHandler: React.FC = () => {
  const [currentAlert, setCurrentAlert] = useState<EmergencyAlert | null>(null);
  
  // Get user info to determine if alert is relevant
  const regularUser = useAuthStore((state) => state.user);
  const stationAdminUser = useStationAdminAuthStore((state) => state.user);
  const user = stationAdminUser || regularUser;
  const userRole = user?.role;
  
  // Get station ID for Admin users
  const currentStationId = user?.stationId || 
    (stationAdminUser?.stationAdminData?.station?.id) ||
    (user as any)?.stationAdminData?.station?.id;

  // Get alert actions from store
  const updateAlert = useEmergencyAlertsStore((state) => state.updateAlert);

  // Listen for new alerts from WebSocket
  useEffect(() => {
    const handleNewAlert = (event: CustomEvent) => {
      const newAlert: EmergencyAlert = event.detail;
      
      if (!newAlert) {
        return;
      }
      
      // Only show if status is 'active' or 'pending'
      const shouldShowByStatus = newAlert.status === 'active' || newAlert.status === 'pending';
      
      if (!shouldShowByStatus) {
        return;
      }
      
      // For Admin users, check if alert is relevant to their station
      if (userRole === 'Admin' && currentStationId) {
        const isRelevant = 
          newAlert.station?.id === currentStationId || 
          newAlert.station?._id === currentStationId ||
          newAlert.stationId === currentStationId;
        
        if (!isRelevant) {
          return;
        }
      }
      
      // For SuperAdmin, show all active/pending alerts
      // For Admin, we've already filtered by station above
      // For other roles, show all active/pending alerts
      setCurrentAlert(newAlert);
    };

    window.addEventListener('newEmergencyAlert', handleNewAlert as EventListener);

    return () => {
      window.removeEventListener('newEmergencyAlert', handleNewAlert as EventListener);
    };
  }, [userRole, currentStationId]);

  // Handle alert actions
  const handleAcknowledge = async (alertId: string) => {
    try {
      await updateAlert(alertId, { status: 'accepted' });
      setCurrentAlert(null);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleReject = async (alertId: string, reason: string) => {
    try {
      // Update alert status to 'rejected'
      // Note: The decline reason can be stored in description if needed
      await updateAlert(alertId, { 
        status: 'rejected',
        description: reason 
      });
      setCurrentAlert(null);
    } catch (error) {
      console.error('Error rejecting alert:', error);
      throw error;
    }
  };

  const handleRefer = async (alertId: string, stationId: string, reason: string) => {
    try {
      // Update alert status to 'referred'
      // Note: The actual referral is created via the referrals API in EmergencyAlertPopup
      await updateAlert(alertId, { 
        status: 'referred'
      });
      setCurrentAlert(null);
    } catch (error) {
      console.error('Error referring alert:', error);
      throw error;
    }
  };

  const handleClose = () => {
    setCurrentAlert(null);
  };

  // Only render popup if there's an alert
  if (!currentAlert) {
    return null;
  }

  return (
    <EmergencyAlertPopup
      alert={currentAlert}
      onClose={handleClose}
      onAcknowledge={handleAcknowledge}
      onReject={handleReject}
      onRefer={handleRefer}
    />
  );
};

export default GlobalEmergencyAlertHandler;

