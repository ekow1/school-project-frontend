"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const STATIONS_ENDPOINT = `${API_BASE_URL}/fire/stations`;

export interface Station {
  _id: string;
  id: string;
  name?: string;
  call_sign?: string;
  location?: string;
  location_url?: string;
  lat?: number;
  lng?: number;
  region?: string;
  phone_number?: string;
  placeId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  departments?: any[];
  personnel?: any[];
  stationAdmins?: any[];
}

export interface StationsResponse {
  success: boolean;
  count: number;
  data: Station[];
}

interface StationsStore {
  stations: Station[];
  isLoading: boolean;
  error: string | null;
  count: number;
  fetchStations: () => Promise<void>;
  clearError: () => void;
}

// API function to fetch stations
const apiFetchStations = async (): Promise<StationsResponse> => {
  try {
    const { data } = await axios.get<StationsResponse>(
      STATIONS_ENDPOINT,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch stations"
      : "Failed to fetch stations";
    throw new Error(message);
  }
};

export const useStationsStore = create<StationsStore>()(
  persist(
    (set, get) => ({
      stations: [],
      isLoading: false,
      error: null,
      count: 0,

      fetchStations: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchStations();
          // Ensure each station has both _id and id for consistency
          const normalizedStations = (response.data || []).map(station => ({
            ...station,
            id: station.id || station._id,
            _id: station._id || station.id,
          }));
          set({
            stations: normalizedStations,
            count: response.count || 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch stations";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error; // Re-throw to allow error handling in components
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'gnfs-stations-storage',
      partialize: (state) => ({
        stations: state.stations,
        count: state.count,
      }),
    }
  )
);

// Selectors
export const selectStations = (state: StationsStore) => state.stations;
export const selectStationsIsLoading = (state: StationsStore) => state.isLoading;
export const selectStationsError = (state: StationsStore) => state.error;
export const selectStationsCount = (state: StationsStore) => state.count;

