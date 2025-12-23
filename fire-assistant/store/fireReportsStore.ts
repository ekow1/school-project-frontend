import { create } from 'zustand';
import { ENV } from '../config/env';
import { useAuthStore } from './authStore';

export interface FireReport {
  _id: string;
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
  status: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFireReportData {
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
  description?: string;
}

export interface UpdateFireReportData {
  incidentName?: string;
  status?: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  description?: string;
  assignedTo?: string;
  resolvedAt?: string;
}

export interface FireReportStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  cancelled: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  byType: {
    fire: number;
    accident: number;
    medical: number;
    flood: number;
    gas: number;
    other: number;
  };
}

export interface FireReportResponse {
  success: boolean;
  message: string;
  data?: FireReport | FireReport[] | FireReportStats;
  error?: string;
}

interface FireReportsState {
  // State
  reports: FireReport[];
  currentReport: FireReport | null;
  stats: FireReportStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Actions
  createFireReport: (reportData: CreateFireReportData) => Promise<FireReportResponse>;
  getAllFireReports: () => Promise<FireReportResponse>;
  getFireReportById: (id: string) => Promise<FireReportResponse>;
  getFireReportsByUser: (userId: string) => Promise<FireReportResponse>;
  getFireReportsByStation: (stationId: string) => Promise<FireReportResponse>;
  updateFireReport: (id: string, updateData: UpdateFireReportData) => Promise<FireReportResponse>;
  deleteFireReport: (id: string) => Promise<FireReportResponse>;
  getFireReportStats: () => Promise<FireReportResponse>;
  clearError: () => void;
  clearCurrentReport: () => void;
}

const API_BASE_URL = ENV.AUTH_API_URL;

export const useFireReportsStore = create<FireReportsState>((set, get) => ({
  // Initial state
  reports: [],
  currentReport: null,
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear current report
  clearCurrentReport: () => {
    set({ currentReport: null });
  },

  // Create fire report
  createFireReport: async (reportData: CreateFireReportData): Promise<FireReportResponse> => {
    set({ isCreating: true, error: null });
    
    try {
      // Validate userId
      if (!reportData.userId || reportData.userId === 'unknown') {
        const user = useAuthStore.getState().user;
        if (user?.id) {
          reportData.userId = user.id;
        } else {
          throw new Error('Invalid user ID format. Please log in and try again.');
        }
      }
      
      console.log('Creating fire report:', reportData);
      
      const token = useAuthStore.getState().token;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch(`${API_BASE_URL}/emergency/alerts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Fire report created successfully:', result);
      
      // Add the new report to the reports array
      if (result.success && result.data) {
        set(state => ({
          reports: [result.data, ...state.reports],
          currentReport: result.data,
          isCreating: false,
          error: null
        }));
      } else {
        set({ isCreating: false, error: null });
      }
      
      return result;
      
    } catch (error) {
      console.error('Error creating fire report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create fire report';
      set({ isCreating: false, error: errorMessage });
      throw error;
    }
  },

  // Get all fire reports (incidents)
  getAllFireReports: async (): Promise<FireReportResponse> => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching all incidents');
      
      const token = useAuthStore.getState().token;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch(`${API_BASE_URL}/incidents`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Incidents fetched successfully:', result);
      
      if (result.success && result.data) {
        // Transform API response to match FireReport interface
        const transformedReports: FireReport[] = result.data.map((incident: any) => {
          const alert = incident.alertId || {};
          return {
            _id: incident._id || alert._id,
            userId: alert.userId || '',
            incidentType: alert.incidentType || '',
            incidentName: alert.incidentName || '',
            location: {
              coordinates: {
                latitude: alert.location?.coordinates?.latitude || 0,
                longitude: alert.location?.coordinates?.longitude || 0,
              },
              locationUrl: alert.location?.locationUrl || '',
              locationName: alert.location?.locationName || '',
            },
            station: {
              name: incident.station?.name || '',
              address: incident.station?.address || '',
              latitude: incident.station?.latitude || 0,
              longitude: incident.station?.longitude || 0,
              phone: incident.station?.phone,
            },
            reportedAt: alert.reportedAt || incident.createdAt,
            status: incident.status as any || alert.status || 'pending',
            priority: alert.priority || 'medium',
            createdAt: incident.createdAt,
            updatedAt: incident.updatedAt,
            // Store additional data for access
            reporterName: alert.reporterName,
            reporterPhone: alert.reporterPhone,
          } as FireReport & { reporterName?: string; reporterPhone?: string };
        });
        
        set({ reports: transformedReports, isLoading: false, error: null });
      } else {
        set({ isLoading: false, error: null });
      }
      
      return result;
      
    } catch (error) {
      console.error('Error fetching incidents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch incidents';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  // Get fire report by ID
  getFireReportById: async (id: string): Promise<FireReportResponse> => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching fire report by ID:', id);
      
      const token = useAuthStore.getState().token;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch(`${API_BASE_URL}/emergency/alerts/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Fire report fetched successfully:', result);
      
      if (result.success && result.data) {
        set({ currentReport: result.data, isLoading: false, error: null });
      } else {
        set({ isLoading: false, error: null });
      }
      
      return result;
      
    } catch (error) {
      console.error('Error fetching fire report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch fire report';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  // Get fire reports by user
  getFireReportsByUser: async (userId: string): Promise<FireReportResponse> => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching fire reports by user:', userId);
      
      const token = useAuthStore.getState().token;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch(`${API_BASE_URL}/emergency/alerts/user/${userId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('User fire reports fetched successfully:', result);
      
      if (result.success && result.data) {
        set({ reports: result.data, isLoading: false, error: null });
      } else {
        set({ isLoading: false, error: null });
      }
      
      return result;
      
    } catch (error) {
      console.error('Error fetching user fire reports:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user fire reports';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  // Get fire reports by station
  getFireReportsByStation: async (stationId: string): Promise<FireReportResponse> => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching fire reports by station:', stationId);
      
      const token = useAuthStore.getState().token;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch(`${API_BASE_URL}/emergency/alerts/station/${stationId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Station fire reports fetched successfully:', result);
      
      if (result.success && result.data) {
        set({ reports: result.data, isLoading: false, error: null });
      } else {
        set({ isLoading: false, error: null });
      }
      
      return result;
      
    } catch (error) {
      console.error('Error fetching station fire reports:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch station fire reports';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  // Update fire report
  updateFireReport: async (id: string, updateData: UpdateFireReportData): Promise<FireReportResponse> => {
    set({ isUpdating: true, error: null });
    
    try {
      console.log('Updating fire report:', id, updateData);
      
      const token = useAuthStore.getState().token;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Fire report updated successfully:', result);
      
      if (result.success && result.data) {
        // Update the report in the reports array
        set(state => ({
          reports: state.reports.map(report => 
            report._id === id ? result.data : report
          ),
          currentReport: state.currentReport?._id === id ? result.data : state.currentReport,
          isUpdating: false,
          error: null
        }));
      } else {
        set({ isUpdating: false, error: null });
      }
      
      return result;
      
    } catch (error) {
      console.error('Error updating fire report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update fire report';
      set({ isUpdating: false, error: errorMessage });
      throw error;
    }
  },

  // Delete fire report
  deleteFireReport: async (id: string): Promise<FireReportResponse> => {
    set({ isDeleting: true, error: null });
    
    try {
      console.log('Deleting fire report:', id);
      
      const token = useAuthStore.getState().token;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch(`${API_BASE_URL}/emergency/alerts/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Fire report deleted successfully:', result);
      
      if (result.success) {
        // Remove the report from the reports array
        set(state => ({
          reports: state.reports.filter(report => report._id !== id),
          currentReport: state.currentReport?._id === id ? null : state.currentReport,
          isDeleting: false,
          error: null
        }));
      } else {
        set({ isDeleting: false, error: null });
      }
      
      return result;
      
    } catch (error) {
      console.error('Error deleting fire report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete fire report';
      set({ isDeleting: false, error: errorMessage });
      throw error;
    }
  },

  // Get fire report statistics
  getFireReportStats: async (): Promise<FireReportResponse> => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching fire report statistics');
      
      const token = useAuthStore.getState().token;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      const response = await fetch(`${API_BASE_URL}/emergency/alerts/stats`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Fire report statistics fetched successfully:', result);
      
      if (result.success && result.data) {
        set({ stats: result.data, isLoading: false, error: null });
      } else {
        set({ isLoading: false, error: null });
      }
      
      return result;
      
    } catch (error) {
      console.error('Error fetching fire report statistics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch fire report statistics';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },
}));


