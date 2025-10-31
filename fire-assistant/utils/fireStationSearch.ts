// Re-export from the existing service with TypeScript types
import { fetchNearbyFireStations as fetchStations } from './fireStationService.js';

export interface FireStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  distance?: number;
  responseTime?: string;
  routeDistanceText?: string;
  travelTimeText?: string;
  straightLineDistance?: number;
  routeDistance?: number;
  travelTime?: number;
  isOpen?: boolean;
  rating?: number;
  isServiceAreaStation?: boolean;
  serviceNote?: string;
  proximityScore?: number;
  proximityRank?: string;
  placeId?: string;
  photoReference?: string;
  searchStrategy?: string;
  uniqueKey?: string;
}

export interface ServiceArea {
  name: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  servingStations: Array<{
    name: string;
    latitude: number;
    longitude: number;
    serviceNote: string;
    phone?: string;
  }>;
}

// Service areas for polygon display
export const SERVICE_AREAS: ServiceArea[] = [
  {
    name: "East Legon Area",
    bounds: {
      minLat: 5.6200, maxLat: 5.6600,
      minLng: -0.1800, maxLng: -0.1400
    },
    servingStations: [
      {
        name: "University of Ghana Fire Station",
        latitude: 5.6499, longitude: -0.1870,
        serviceNote: "Serves East Legon area",
        phone: "+233 30 277 9111"
      }
    ]
  },
  {
    name: "Dome-Kwabenya Area",
    bounds: {
      minLat: 5.6500, maxLat: 5.7000,
      minLng: -0.2400, maxLng: -0.2000
    },
    servingStations: [
      {
        name: "Madina Fire Station",
        latitude: 5.6680, longitude: -0.1680,
        serviceNote: "Serves Dome area",
        phone: "+233 30 222 2333"
      }
    ]
  },
  {
    name: "Botwe Area",
    bounds: {
      minLat: 5.7000, maxLat: 5.7500,
      minLng: -0.1600, maxLng: -0.1200
    },
    servingStations: [
      {
        name: "Madina Fire Station",
        latitude: 5.6680, longitude: -0.1680,
        serviceNote: "Serves Botwe area",
        phone: "+233 30 222 2333"
      }
    ]
  },
  {
    name: "Tema Area",
    bounds: {
      minLat: 5.6000, maxLat: 5.7000,
      minLng: -0.0500, maxLng: 0.0500
    },
    servingStations: [
      {
        name: "Tema Fire Station",
        latitude: 5.6667, longitude: 0.0167,
        serviceNote: "Serves Tema industrial area",
        phone: "+233 30 277 4555"
      }
    ]
  },
  {
    name: "Kasoa Area",
    bounds: {
      minLat: 5.5000, maxLat: 5.5500,
      minLng: -0.4500, maxLng: -0.4000
    },
    servingStations: [
      {
        name: "Kasoa Fire Station",
        latitude: 5.5333, longitude: -0.4167,
        serviceNote: "Serves Kasoa and surrounding areas",
        phone: "+233 30 277 6777"
      }
    ]
  },
  {
    name: "Achimota Area",
    bounds: {
      minLat: 5.6000, maxLat: 5.6400,
      minLng: -0.2400, maxLng: -0.2000
    },
    servingStations: [
      {
        name: "Achimota Fire Station",
        latitude: 5.6167, longitude: -0.2167,
        serviceNote: "Serves Achimota and Lapaz areas",
        phone: "+233 30 277 8888"
      }
    ]
  }
];

export const fetchNearbyFireStations = async (
  lat: number, 
  lng: number, 
  radius: number = 25000,
  limit: number = 20,
  regionName: string | null = null
): Promise<FireStation[]> => {
  try {
    const stations = await fetchStations(lat, lng, radius, limit, regionName);
    return stations as FireStation[];
  } catch (error) {
    console.error('Error fetching fire stations:', error);
    return [];
  }
};