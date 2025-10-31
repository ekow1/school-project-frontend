import { create } from 'zustand';
import { ENV } from '../config/env';
import { useAuthStore } from './authStore';

export interface FireStationClickData {
  name: string;
  location: string;
  location_url: string;
  latitude: number;
  longitude: number;
  phone_number: string | null;
  placeId?: string;
}

export interface FireStationClickResponse {
  success: boolean;
  message: string;
  data?: any;
  alreadyExists?: boolean;
}

interface FireStationState {
  // State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  sendFireStationClick: (stationData: FireStationClickData) => Promise<FireStationClickResponse>;
  sendFireStationsBulk: (stationsData: FireStationClickData[]) => Promise<FireStationClickResponse>;
  clearError: () => void;
}

const API_BASE_URL = ENV.AUTH_API_URL;

export const useFireStationStore = create<FireStationState>((set, get) => ({
  // Initial state
  isLoading: false,
  isSaving: false,
  error: null,

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Send individual fire station click data
  sendFireStationClick: async (stationData: FireStationClickData): Promise<FireStationClickResponse> => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Sending fire station click data:', stationData);
      
      const token = useAuthStore.getState().token;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch(`${API_BASE_URL}/fire/stations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: stationData.name,
          location: stationData.location,
          location_url: stationData.location_url,
          latitude: stationData.latitude,
          longitude: stationData.longitude,
          phone_number: stationData.phone_number,
          placeId: stationData.placeId,
          clickedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Fire station click data sent successfully:', result);
      
      set({ isLoading: false, error: null });
      return result;
      
    } catch (error) {
      console.error('Error sending fire station click data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send fire station data';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  // Send multiple fire stations in bulk
  sendFireStationsBulk: async (stationsData: FireStationClickData[]): Promise<FireStationClickResponse> => {
    set({ isSaving: true, error: null });
    
    try {
      console.log('Sending fire stations bulk data:', stationsData.length, 'stations');
      
      const token = useAuthStore.getState().token;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const bulkData = {
        stations: stationsData.map(station => ({
          name: station.name,
          location: station.location,
          location_url: station.location_url,
          latitude: station.latitude,
          longitude: station.longitude,
          phone_number: station.phone_number,
          placeId: station.placeId,
        })),
        sentAt: new Date().toISOString(),
      };
      
      const response = await fetch(`${API_BASE_URL}/fire/stations/bulk`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bulkData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Fire stations bulk data sent successfully:', result);
      
      set({ isSaving: false, error: null });
      return result;
      
    } catch (error) {
      console.error('Error sending fire stations bulk data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send fire stations';
      set({ isSaving: false, error: errorMessage });
      throw error;
    }
  },
}));
