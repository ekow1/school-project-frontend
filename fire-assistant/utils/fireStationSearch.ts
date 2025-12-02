// Enhanced Fire Station Search with TypeScript types
// Focuses on finding fire stations closest to user location
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
  ratingCount?: number;
  isServiceAreaStation?: boolean;
  serviceNote?: string;
  proximityScore?: number;
  proximityRank?: string;
  placeId?: string;
  photoReference?: string;
  searchStrategy?: string;
  uniqueKey?: string;
  website?: string;
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
  },
  {
    name: "Adenta Area",
    bounds: {
      minLat: 5.6800, maxLat: 5.7300,
      minLng: -0.1600, maxLng: -0.1300
    },
    servingStations: [
      {
        name: "Fire Service Adenta",
        latitude: 5.7051859,
        longitude: -0.14811829999999998,
        serviceNote: "Serves Adenta area",
        phone: "+233 29 934 0379"
      }
    ]
  }
];

/**
 * Fetch nearby fire stations, prioritizing those closest to the user's location
 * Uses route distance and travel time to determine proximity
 * 
 * @param lat - User's latitude
 * @param lng - User's longitude
 * @param radius - Initial search radius in meters (default: 20km)
 * @param limit - Maximum number of stations to return (default: 20)
 * @param regionName - Optional region name to filter results
 * @param maxDistance - Maximum distance in km to consider (default: 20km)
 * @returns Array of fire stations sorted by proximity (closest first)
 * 
 * Note: If user is in Accra, only shows stations in Accra and Tema
 * All stations must be in Ghana
 */
export const fetchNearbyFireStations = async (
  lat: number, 
  lng: number, 
  radius: number = 20000,
  limit: number = 20,
  regionName: string | null = null,
  maxDistance: number = 20
): Promise<FireStation[]> => {
  try {
    // Validate input coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates provided:', { lat, lng });
      return [];
    }
    
    // Limit radius to 20km
    const searchRadius = Math.min(radius, 20000);
    
    // Fetch stations from the service
    // Handle regionName type conversion for JavaScript service
    const serviceRegionName = regionName === null ? null : (regionName || undefined);
    const stations = await fetchStations(lat, lng, searchRadius, limit * 2, serviceRegionName as any) as FireStation[];
    
    // Ensure stations is an array
    if (!Array.isArray(stations)) {
      console.error('Invalid stations data received:', stations);
      return [];
    }
    
    if (stations.length === 0) {
      console.log('No fire stations found');
      return [];
    }
    
    // Filter stations by maximum distance (20km limit)
    const nearbyStations = stations.filter(station => {
      if (!station) return false; // Skip invalid stations
      const distance = station.routeDistance || station.straightLineDistance || Infinity;
      return distance <= maxDistance;
    });
    
    // Sort by proximity score (lower is closer/better)
    // If proximity score is not available, sort by route distance, then straight-line distance
    const sortedStations = nearbyStations.sort((a, b) => {
      // First priority: proximity score (if available)
      if (a.proximityScore !== undefined && b.proximityScore !== undefined) {
        return a.proximityScore - b.proximityScore;
      }
      
      // Second priority: route distance (driving distance)
      const aRouteDist = a.routeDistance || Infinity;
      const bRouteDist = b.routeDistance || Infinity;
      if (aRouteDist !== Infinity || bRouteDist !== Infinity) {
        return aRouteDist - bRouteDist;
      }
      
      // Third priority: straight-line distance
      const aStraightDist = a.straightLineDistance || Infinity;
      const bStraightDist = b.straightLineDistance || Infinity;
      return aStraightDist - bStraightDist;
    });
    
    // Return only the closest stations up to the limit
    const closestStations = sortedStations.slice(0, limit);
    
    console.log(`Found ${closestStations.length} closest fire stations within ${maxDistance}km`);
    if (closestStations.length > 0) {
      const closest = closestStations[0];
      const distance = closest.routeDistanceText || `${closest.straightLineDistance?.toFixed(1)} km`;
      console.log(`Closest station: ${closest.name} (${distance} away)`);
    }
    
    return closestStations;
  } catch (error: any) {
    console.error('Error fetching fire stations:', error);
    // Always return an empty array on error to prevent crashes
    return [];
  }
};

/**
 * Get the closest fire station to a given location
 * 
 * @param lat - User's latitude
 * @param lng - User's longitude
 * @param maxDistance - Maximum distance in km to consider (default: 20km)
 * @returns The closest fire station or null if none found
 */
export const getClosestFireStation = async (
  lat: number,
  lng: number,
  maxDistance: number = 20
): Promise<FireStation | null> => {
  try {
    const stations = await fetchNearbyFireStations(lat, lng, 20000, 1, null, maxDistance);
    return stations.length > 0 ? stations[0] : null;
  } catch (error) {
    console.error('Error getting closest fire station:', error);
    return null;
  }
};