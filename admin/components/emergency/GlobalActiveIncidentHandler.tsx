'use client';

import React, { useEffect, useState } from 'react';
import { useEmergencyAlertsStore } from '@/lib/stores/emergencyAlerts';
import ActiveIncidentNotification from './ActiveIncidentNotification';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const EMERGENCY_ALERTS_ENDPOINT = `${API_BASE_URL}/emergency/alerts`;

/**
 * Global component that listens to active_incident_exists WebSocket events
 * and displays the notification modal when a new alert is created for a station
 * that already has an active incident.
 */
const GlobalActiveIncidentHandler: React.FC = () => {
  const [notification, setNotification] = useState<any>(null);
  const updateAlert = useEmergencyAlertsStore((state) => state.updateAlert);
  const setActiveIncidentNotification = useEmergencyAlertsStore((state) => state.setActiveIncidentNotification);

  // Listen for active incident notifications from store
  useEffect(() => {
    const unsubscribe = useEmergencyAlertsStore.subscribe(
      (state) => state.activeIncidentNotification,
      (activeIncidentNotification) => {
        setNotification(activeIncidentNotification);
      }
    );

    // Also listen to custom events
    const handleActiveIncident = (event: CustomEvent) => {
      setNotification(event.detail);
    };

    window.addEventListener('activeIncidentExists', handleActiveIncident as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener('activeIncidentExists', handleActiveIncident as EventListener);
    };
  }, []);

  const handleClose = () => {
    setNotification(null);
    setActiveIncidentNotification(null);
  };

  const handleAccept = async (alertId: string) => {
    try {
      await updateAlert(alertId, { status: 'accepted' });
      toast.success('Alert accepted successfully');
      handleClose();
    } catch (error: any) {
      console.error('Error accepting alert:', error);
      toast.error(error.response?.data?.message || 'Failed to accept alert');
      throw error;
    }
  };

  const handleRefer = async (alertId: string) => {
    // The refer action is handled in the ActiveIncidentNotification component
    // with station selection dialog, so we just resolve here
    return Promise.resolve();
  };

  if (!notification) {
    return null;
  }

  return (
    <ActiveIncidentNotification
      notification={notification}
      onClose={handleClose}
      onAccept={handleAccept}
      onRefer={handleRefer}
    />
  );
};

export default GlobalActiveIncidentHandler;

