'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useIncidentsStore } from '@/lib/stores/incidents';
import { useAuthStore } from '@/lib/stores/auth';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import ActiveIncidentNotification from './ActiveIncidentNotification';
import { Incident } from '@/lib/types/incident';

/**
 * Global component that monitors incident statuses and displays
 * the floating alert card for incidents in active states.
 * Shows alerts for incidents with status: pending, dispatched, active, on_scene
 */
const GlobalIncidentStatusMonitor: React.FC = () => {
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);

  // Get incidents from store
  const incidents = useIncidentsStore((state) => state.incidents);
  const fetchIncidents = useIncidentsStore((state) => state.fetchIncidents);
  const isLoading = useIncidentsStore((state) => state.isLoading);

  // Get user info for station filtering
  const regularUser = useAuthStore((state) => state.user);
  const stationAdminUser = useStationAdminAuthStore((state) => state.user);
  const user = stationAdminUser || regularUser;
  const userRole = user?.role;
  const currentStationId = user?.stationId;

  // Fetch incidents on mount and when user changes
  useEffect(() => {
    if (!isLoading) {
      fetchIncidents().catch((err) => {
        console.error('Failed to fetch incidents:', err);
      });
    }
  }, [fetchIncidents, isLoading, user]);

  // Find the most urgent incident that should trigger an alert
  const urgentIncident = useMemo(() => {
    if (!incidents.length) return null;

    // Filter incidents based on user role and station
    let relevantIncidents = incidents;

    if (userRole === 'Admin' && currentStationId) {
      // For Station Admin, only show incidents for their station
      relevantIncidents = incidents.filter(incident => {
        return incident.alertId?.station === currentStationId;
      });
    }
    // For Super Admin, show all incidents

    // Filter for incidents that should show alerts (active states)
    const activeIncidents = relevantIncidents.filter(incident =>
      ['pending', 'dispatched', 'active', 'on_scene'].includes(incident.status)
    );

    if (activeIncidents.length === 0) return null;

    // Sort by priority (critical > high > medium > low) then by status urgency
    const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    const statusOrder: Record<string, number> = {
      pending: 4,
      dispatched: 3,
      active: 5, // Active incidents get highest priority
      on_scene: 2
    };

    return activeIncidents.sort((a, b) => {
      const aPriority = a.alertId?.priority || 'low';
      const bPriority = b.alertId?.priority || 'low';
      const priorityDiff = (priorityOrder[bPriority] || 0) - (priorityOrder[aPriority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
    })[0];
  }, [incidents, userRole, currentStationId]);

  // Update current incident when urgent incident changes
  useEffect(() => {
    setCurrentIncident(urgentIncident);
  }, [urgentIncident]);

  const handleClose = () => {
    setCurrentIncident(null);
  };

  const handleAccept = async (alertId: string) => {
    // The accept action is handled by the ActiveIncidentNotification component
    // which calls the emergency alerts store
    console.log('Accepting incident alert:', alertId);
    handleClose();
  };

  const handleRefer = async (alertId: string) => {
    // The refer action is handled by the ActiveIncidentNotification component
    console.log('Referring incident alert:', alertId);
    return Promise.resolve();
  };

  // Transform incident to the format expected by ActiveIncidentNotification
  const transformIncidentToNotification = (incident: Incident) => {
    if (!incident.alertId) return null;

    return {
      alert: {
        _id: incident.alertId._id || incident.alertId.id || '',
        incidentType: incident.alertId.incidentType || 'unknown',
        incidentName: incident.alertId.incidentName || 'Unknown Incident',
        userName: undefined, // Not available in IncidentAlertId
        userContact: undefined, // Not available in IncidentAlertId
        locationName: incident.alertId.location?.locationName || 'Unknown Location',
        locationUrl: incident.alertId.location?.locationUrl,
        gpsCoordinates: incident.alertId.location?.coordinates ? {
          latitude: incident.alertId.location.coordinates.latitude,
          longitude: incident.alertId.location.coordinates.longitude
        } : undefined,
        stationInfo: {
          _id: incident.alertId.station,
          name: 'Station', // We don't have station name in IncidentAlertId
          location: undefined,
          phone: undefined
        },
        priority: incident.alertId.priority || 'medium',
        status: incident.alertId.status || 'active',
        timestamps: {
          createdAt: incident.createdAt,
          updatedAt: incident.updatedAt,
          reportedAt: incident.createdAt
        }
      },
      activeIncident: {
        _id: incident._id,
        status: incident.status,
        alertId: incident.alertId._id || incident.alertId.id || '',
        departmentOnDuty: incident.departmentOnDuty.name, // Convert to string as expected
        unitOnDuty: incident.unitOnDuty.name, // Convert to string as expected
        createdAt: incident.createdAt
      },
      stationId: incident.alertId.station,
      message: `Incident requires immediate attention - Status: ${incident.status.replace('_', ' ').toUpperCase()}`,
      requiresAction: true
    };
  };

  const notificationData = currentIncident ? transformIncidentToNotification(currentIncident) : null;

  if (!notificationData) {
    return null;
  }

  return (
    <ActiveIncidentNotification
      notification={notificationData}
      onClose={handleClose}
      onAccept={handleAccept}
      onRefer={handleRefer}
    />
  );
};

export default GlobalIncidentStatusMonitor;