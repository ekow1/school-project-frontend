'use client';

import React, { useEffect, useState } from 'react';
import { useReferralsStore } from '@/lib/stores/referrals';
import { useAuthStore } from '@/lib/stores/auth';
import { useStationAdminAuthStore } from '@/lib/stores/stationAdminAuth';
import ReferredAlertNotification from './ReferredAlertNotification';
import ReferredIncidentNotification from './ReferredIncidentNotification';

/**
 * Global component that listens to WebSocket events for referral notifications
 * and displays the appropriate notification modal regardless of the current page.
 */
const GlobalReferralNotificationHandler: React.FC = () => {
  const [referredAlert, setReferredAlert] = useState<any>(null);
  const [referredIncident, setReferredIncident] = useState<any>(null);
  
  // Get user info to determine if notification is relevant
  const regularUser = useAuthStore((state) => state.user);
  const stationAdminUser = useStationAdminAuthStore((state) => state.user);
  const user = stationAdminUser || regularUser;
  
  // Get station ID for Admin users
  const currentStationId = user?.stationId || 
    (stationAdminUser?.stationAdminData?.station?.id) ||
    (user as any)?.stationAdminData?.station?.id;

  // Get referral store methods
  const setReferredAlertNotification = useReferralsStore((state) => state.setReferredAlertNotification);
  const setReferredIncidentNotification = useReferralsStore((state) => state.setReferredIncidentNotification);
  const referredAlertNotification = useReferralsStore((state) => state.referredAlertNotification);
  const referredIncidentNotification = useReferralsStore((state) => state.referredIncidentNotification);

  // Listen for referral notification events
  useEffect(() => {
    const handleReferredAlert = (event: CustomEvent) => {
        const notification = event.detail;
        
        console.log('🔔 Referral notification received:', notification);
        console.log('📍 Current station ID:', currentStationId);
        console.log('👤 User role:', user?.role);
        
        // For Admin users, check if notification is for their station
        if (user?.role === 'Admin' && currentStationId) {
          // Check if the notification is for this station (to_station_id)
          const toStationId = notification.referral?.toStation?.id ||
                             notification.referral?.toStation?._id ||
                             notification.referral?.to_station_id ||
                             notification.toStationId;
          
          // Check if this station is the one that initiated the referral (from_station_id)
          // Also check the alert's station field as it might be the originating station
          const fromStationId = notification.referral?.fromStation?.id ||
                               notification.referral?.fromStation?._id ||
                               notification.referral?.from_station_id ||
                               notification.fromStationId ||
                               notification.stationInfo?.id ||
                               notification.stationInfo?._id;
          
          console.log('🎯 To Station ID:', toStationId);
          console.log('📤 From Station ID:', fromStationId);
          
          const isForThisStation = toStationId && (toStationId === currentStationId ||
                                  toStationId === String(currentStationId));
          
          const isFromThisStation = fromStationId && (fromStationId === currentStationId ||
                                   fromStationId === String(currentStationId));
          
          console.log('✅ Is for this station:', isForThisStation);
          console.log('❌ Is from this station:', isFromThisStation);
          console.log('🔔 Requires action:', notification.requiresAction);
          
          // Only show if it's for this station (not from this station) and requires action
          if (isForThisStation && !isFromThisStation && notification.requiresAction) {
            console.log('✅ Showing referral notification');
            setReferredAlert(notification);
          } else {
            console.log('❌ Not showing referral notification');
          }
        } else if (user?.role === 'SuperAdmin') {
          // SuperAdmin sees all referrals
          if (notification.requiresAction) {
            setReferredAlert(notification);
          }
        }
      };
  
      const handleReferredIncident = (event: CustomEvent) => {
        const notification = event.detail;
        
        console.log('🔔 Incident referral notification received:', notification);
        console.log('📍 Current station ID:', currentStationId);
        
        // For Admin users, check if notification is for their station
        if (user?.role === 'Admin' && currentStationId) {
          // Check if the notification is for this station (to_station_id)
          const toStationId = notification.referral?.toStation?.id ||
                             notification.referral?.toStation?._id ||
                             notification.referral?.to_station_id ||
                             notification.toStationId;
          
          // Check if this station is the one that initiated the referral (from_station_id)
          const fromStationId = notification.referral?.fromStation?.id ||
                               notification.referral?.fromStation?._id ||
                               notification.referral?.from_station_id ||
                               notification.fromStationId ||
                               notification.station?.id ||
                               notification.station?._id;
          
          console.log('🎯 To Station ID:', toStationId);
          console.log('📤 From Station ID:', fromStationId);
          
          const isForThisStation = toStationId && (toStationId === currentStationId ||
                                  toStationId === String(currentStationId));
          
          const isFromThisStation = fromStationId && (fromStationId === currentStationId ||
                                   fromStationId === String(currentStationId));
          
          console.log('✅ Is for this station:', isForThisStation);
          console.log('❌ Is from this station:', isFromThisStation);
          
          // Only show if it's for this station (not from this station) and requires action
          if (isForThisStation && !isFromThisStation && notification.requiresAction) {
            console.log('✅ Showing incident referral notification');
            setReferredIncident(notification);
          } else {
            console.log('❌ Not showing incident referral notification');
          }
        } else if (user?.role === 'SuperAdmin') {
          // SuperAdmin sees all referrals
          if (notification.requiresAction) {
            setReferredIncident(notification);
          }
        }
      };

    window.addEventListener('referredAlertReceived', handleReferredAlert as EventListener);
    window.addEventListener('referredIncidentReceived', handleReferredIncident as EventListener);

    return () => {
      window.removeEventListener('referredAlertReceived', handleReferredAlert as EventListener);
      window.removeEventListener('referredIncidentReceived', handleReferredIncident as EventListener);
    };
  }, [user?.role, currentStationId]);

  // Also listen to store state changes
  useEffect(() => {
    if (referredAlertNotification) {
      setReferredAlert(referredAlertNotification);
    }
  }, [referredAlertNotification]);

  useEffect(() => {
    if (referredIncidentNotification) {
      setReferredIncident(referredIncidentNotification);
    }
  }, [referredIncidentNotification]);

  const handleCloseAlert = () => {
    setReferredAlert(null);
    setReferredAlertNotification(null);
  };

  const handleCloseIncident = () => {
    setReferredIncident(null);
    setReferredIncidentNotification(null);
  };

  return (
    <>
      {referredAlert && (
        <ReferredAlertNotification
          notification={referredAlert}
          onClose={handleCloseAlert}
        />
      )}
      {referredIncident && (
        <ReferredIncidentNotification
          notification={referredIncident}
          onClose={handleCloseIncident}
        />
      )}
    </>
  );
};

export default GlobalReferralNotificationHandler;

