// Enhanced Fire Station Search Service with Service Area Mapping
// This service provides comprehensive fire station discovery for Ghana

const GOOGLE_API_KEY = 'AIzaSyABM58KqCxdeVPL6LgGPXfAkHZxbfNE-pA';

// Helper function to check if a fire station is in the correct region
const isStationInRegion = (station, regionName) => {
  const name = station.name?.toLowerCase() || '';
  const address = station.formatted_address?.toLowerCase() || station.vicinity?.toLowerCase() || '';
  
  // Ghana regions and cities mapping
  const regionMappings = {
    'accra': ['accra', 'greater accra', 'greater accra region', 'east legon', 'west legon', 'oshie', 'labadi', 'tema', 'madina', 'adenta', 'dansoman', 'kantamanto', 'circle', 'kanda', 'airport', 'kotoka'],
    'tema': ['tema', 'tema new town', 'tema community', 'tema port', 'tema industrial', 'ashaiman'],
    'kumasi': ['kumasi', 'ashanti', 'ashanti region', 'asanteman', 'suame', 'adum', 'kejetia', 'asokwa', 'kwadaso', 'bantama'],
    'suhum': ['suhum', 'eastern region', 'eastern', 'koforidua', 'akim', 'akwapim'],
    'central': ['central region', 'central', 'cape coast', 'kasoa', 'winneba', 'saltpond', 'elmina'],
    'western': ['western region', 'western', 'takoradi', 'sekondi', 'tarkwa', 'prestea'],
    'volta': ['volta region', 'volta', 'ho', 'keta', 'akatsi', 'ketu'],
    'northern': ['northern region', 'northern', 'tamale', 'yendi', 'savelugu'],
    'upper east': ['upper east', 'upper east region', 'bolgatanga', 'navrongo', 'bawku'],
    'upper west': ['upper west', 'upper west region', 'wa', 'lawra', 'jirapa'],
    'bono': ['bono region', 'bono', 'sunyani', 'techiman', 'berekum'],
    'ahafo': ['ahafo region', 'ahafo', 'goaso', 'bechem'],
    'bono east': ['bono east region', 'bono east', 'techiman', 'kintampo'],
    'oti': ['oti region', 'oti', 'dambai', 'kete krachi'],
    'savannah': ['savannah region', 'savannah', 'damongo', 'bole'],
    'north east': ['north east region', 'north east', 'nalerigu', 'gambaga'],
    'western north': ['western north region', 'western north', 'sefwi', 'bibiani']
  };

  const regionKeywords = regionMappings[regionName.toLowerCase()];
  if (!regionKeywords) return true; // If region not found, allow the station

  const searchText = `${name} ${address}`;
  return regionKeywords.some(keyword => searchText.includes(keyword));
};

// Function to fetch phone number for a place using Google Places API
const fetchPhoneNumber = async (placeId) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,international_phone_number&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      return data.result.formatted_phone_number || data.result.international_phone_number || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching phone number:', error);
    return null;
  }
};

// Function to fetch phone numbers for multiple stations
const fetchPhoneNumbersForStations = async (stations) => {
  const stationsWithPhones = [];
  
  for (const station of stations) {
    let phoneNumber = null;
    
    // Try to get phone number if we have a place_id
    if (station.placeId) {
      phoneNumber = await fetchPhoneNumber(station.placeId);
    }
    
    // If no phone number found, try searching for the station name
    if (!phoneNumber && station.name) {
      try {
        const searchResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(station.name + ' Ghana')}&key=${GOOGLE_API_KEY}`
        );
        const searchData = await searchResponse.json();
        
        if (searchData.status === 'OK' && searchData.results.length > 0) {
          const firstResult = searchData.results[0];
          phoneNumber = await fetchPhoneNumber(firstResult.place_id);
        }
      } catch (error) {
        console.error('Error searching for phone number:', error);
      }
    }
    
    stationsWithPhones.push({
      ...station,
      phone: phoneNumber
    });
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return stationsWithPhones;
};

// Service area mapping for remote locations in Ghana
const SERVICE_AREAS = [
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

// Enhanced fire station search with service area mapping
export const fetchNearbyFireStations = async (lat, lng, radius = 25000, limit = 20, regionName = null) => {
  try {
    let allStations = await searchFireStations(lat, lng, radius, regionName);
    if (allStations.length < 5) {
      allStations = await searchFireStations(lat, lng, 50000, regionName); // 50km radius
    }
    if (allStations.length < 10) {
      allStations = await searchFireStations(lat, lng, 100000, regionName); // 100km radius
    }
    const serviceAreaStations = getServiceAreaStations(lat, lng, allStations);
    if (serviceAreaStations.length > 0) {
      allStations = [...allStations, ...serviceAreaStations];
    }
    const uniqueStations = removeDuplicateStations(allStations);
    const stationsWithRouteDistance = await calculateRouteDistances(lat, lng, uniqueStations);
    const stationsWithProximityScores = calculateProximityScores(stationsWithRouteDistance, lat, lng);
    
    // Fetch phone numbers for all stations
    const stationsWithPhones = await fetchPhoneNumbersForStations(stationsWithProximityScores);
    
    const sortedStations = stationsWithPhones.sort((a, b) => a.proximityScore - b.proximityScore);
    return sortedStations.slice(0, limit); // Show up to limit stations
  } catch (err) {
    console.error('Error in fetchNearbyFireStations:', err);
    return [];
  }
};

const getServiceAreaStations = (lat, lng, existingStations) => {
  // Words to exclude from fire station names
  const excludeWords = ['tv', 'bands', 'department', 'bura', 'camp', 'studio', 'media', 'broadcast', 'channel', 'radio', 'television', 'news', 'entertainment', 'music', 'band', 'orchestra', 'theater', 'cinema', 'movie', 'film', 'production', 'advertising', 'marketing', 'consulting', 'agency', 'company', 'corporation', 'limited', 'ltd', 'inc', 'llc'];
  
  const serviceAreaStations = [];
  for (const area of SERVICE_AREAS) {
    if (lat >= area.bounds.minLat && lat <= area.bounds.maxLat &&
        lng >= area.bounds.minLng && lng <= area.bounds.maxLng) {
      for (const station of area.servingStations) {
        const isDuplicate = existingStations.some(
          existing => existing.name === station.name
        );
        
        // Check for excluded words in station name
        const hasExcludedWords = excludeWords.some(word => 
          station.name.toLowerCase().includes(word)
        );
        
        if (!isDuplicate && !hasExcludedWords) {
          serviceAreaStations.push({
            id: `service_${station.name.replace(/\s+/g, '_')}`,
            name: station.name,
            address: `${station.serviceNote}`,
            latitude: station.latitude,
            longitude: station.longitude,
            phone: station.phone,
            straightLineDistance: calculateDistance(lat, lng, station.latitude, station.longitude),
            isServiceAreaStation: true,
            serviceNote: station.serviceNote
          });
        }
      }
    }
  }
  return serviceAreaStations;
};

const searchFireStations = async (lat, lng, radius, regionName = null) => {
  const searchStrategies = [
    {
      url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=fire_station&key=${GOOGLE_API_KEY}`,
      name: 'Standard fire station search'
    },
    {
      url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Ghana National Fire Service near ${lat},${lng}&radius=${radius}&key=${GOOGLE_API_KEY}`,
      name: 'Ghana National Fire Service search'
    },
    {
      url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=GNFS fire station near ${lat},${lng}&radius=${radius}&key=${GOOGLE_API_KEY}`,
      name: 'GNFS search'
    },
    {
      url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=fire service Ghana near ${lat},${lng}&radius=${radius}&key=${GOOGLE_API_KEY}`,
      name: 'Fire service search'
    }
  ];

  // Add region-specific searches if region name is provided
  if (regionName) {
    const regionSearches = [
      {
        url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=fire station ${regionName} Ghana&key=${GOOGLE_API_KEY}`,
        name: `Region-specific search: ${regionName}`
      },
      {
        url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=GNFS ${regionName}&key=${GOOGLE_API_KEY}`,
        name: `GNFS ${regionName} search`
      }
    ];
    searchStrategies.unshift(...regionSearches); // Add at the beginning for higher priority
  }
  
  // Words to exclude from fire station names
  const excludeWords = ['tv', 'bands', 'department', 'bura', 'camp', 'studio', 'media', 'broadcast', 'channel', 'radio', 'television', 'news', 'entertainment', 'music', 'band', 'orchestra', 'theater', 'cinema', 'movie', 'film', 'production', 'advertising', 'marketing', 'consulting', 'agency', 'company', 'corporation', 'limited', 'ltd', 'inc', 'llc'];
  
  let allStations = [];
  for (const strategy of searchStrategies) {
    try {
      const response = await fetch(strategy.url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const stationsFromStrategy = data.results
          .filter(station => {
            const name = station.name?.toLowerCase() || '';
            const address = station.formatted_address?.toLowerCase() || station.vicinity?.toLowerCase() || '';
            const types = station.types || [];
            
            // Check if it's a fire station
            const isFireStation = types.includes('fire_station') ||
                                name.includes('fire') ||
                                name.includes('gnfs') ||
                                name.includes('ghana national fire service') ||
                                name.includes('fire service') ||
                                name.includes('national fire service');
            
            // Check for excluded words
            const hasExcludedWords = excludeWords.some(word => 
              name.includes(word) || address.includes(word)
            );
            
            // Check for duplicates
            const isDuplicate = allStations.some(existing => existing.place_id === station.place_id);
            
            // Check if station is in the correct region (if regionName is provided)
            const isInCorrectRegion = !regionName || isStationInRegion(station, regionName);
            
            // Only include if it's a fire station, doesn't have excluded words, isn't a duplicate, and is in correct region
            return isFireStation && !hasExcludedWords && !isDuplicate && isInCorrectRegion;
          })
          .map((station, index) => ({
            id: station.place_id || `station_${index}`,
            name: station.name,
            address: station.formatted_address || station.vicinity,
            latitude: station.geometry.location.lat,
            longitude: station.geometry.location.lng,
            placeId: station.place_id,
            rating: station.rating || null,
            isOpen: station.opening_hours?.open_now,
            straightLineDistance: calculateDistance(lat, lng, station.geometry.location.lat, station.geometry.location.lng),
            photoReference: station.photos?.[0]?.photo_reference || null,
            searchStrategy: strategy.name
          }));
        allStations = [...allStations, ...stationsFromStrategy];
      }
    } catch (strategyError) {}
  }
  return allStations;
};

const removeDuplicateStations = (stations) => {
  const uniqueStations = [];
  const seenIds = new Set();
  const seenNames = new Set();
  stations.forEach((station, index) => {
    let uniqueId = station.placeId || station.id;
    if (!uniqueId) {
      uniqueId = `${station.name}_${station.latitude}_${station.longitude}`.replace(/\s+/g, '_');
    }
    const locationKey = `${station.name}_${station.latitude.toFixed(4)}_${station.longitude.toFixed(4)}`;
    if (!seenIds.has(uniqueId) && !seenNames.has(locationKey)) {
      seenIds.add(uniqueId);
      seenNames.add(locationKey);
      uniqueStations.push({
        ...station,
        id: uniqueId,
        uniqueKey: `station_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }
  });
  return uniqueStations;
};

const calculateRouteDistances = async (originLat, originLng, stations) => {
  try {
    const batchSize = 10;
    const stationBatches = [];
    for (let i = 0; i < stations.length; i += batchSize) {
      stationBatches.push(stations.slice(i, i + batchSize));
    }
    const stationsWithRouteData = [];
    for (const batch of stationBatches) {
      const destinations = batch.map(station => `${station.latitude},${station.longitude}`).join('|');
      const origin = `${originLat},${originLng}`;
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&mode=driving&units=metric&key=${GOOGLE_API_KEY}`
        );
        const distanceData = await response.json();
        if (distanceData.status === 'OK' && distanceData.rows[0]) {
          const elements = distanceData.rows[0].elements;
          batch.forEach((station, index) => {
            const element = elements[index];
            if (element && element.status === 'OK') {
              stationsWithRouteData.push({
                ...station,
                routeDistance: element.distance ? element.distance.value / 1000 : station.straightLineDistance,
                travelTime: element.duration ? element.duration.value / 60 : null,
                routeDistanceText: element.distance ? element.distance.text : `${station.straightLineDistance.toFixed(1)} km`,
                travelTimeText: element.duration ? element.duration.text : 'Unknown',
              });
            } else {
              stationsWithRouteData.push({
                ...station,
                routeDistance: station.straightLineDistance,
                travelTime: null,
                routeDistanceText: `${station.straightLineDistance.toFixed(1)} km`,
                travelTimeText: 'Route unavailable',
              });
            }
          });
        } else {
          batch.forEach(station => {
            stationsWithRouteData.push({
              ...station,
              routeDistance: station.straightLineDistance,
              travelTime: null,
              routeDistanceText: `${station.straightLineDistance.toFixed(1)} km`,
              travelTimeText: 'Route unavailable',
            });
          });
        }
      } catch (batchError) {
        batch.forEach(station => {
          stationsWithRouteData.push({
            ...station,
            routeDistance: station.straightLineDistance,
            travelTime: null,
            routeDistanceText: `${station.straightLineDistance.toFixed(1)} km`,
            travelTimeText: 'Route unavailable',
          });
        });
      }
      if (stationBatches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    return stationsWithRouteData;
  } catch (error) {
    return stations.map(station => ({
      ...station,
      routeDistance: station.straightLineDistance,
      travelTime: null,
      routeDistanceText: `${station.straightLineDistance.toFixed(1)} km`,
      travelTimeText: 'Route unavailable',
    }));
  }
};

const calculateProximityScores = (stations, originLat, originLng) => {
  return stations.map(station => {
    const proximityScore = calculateProximityScore(station, originLat, originLng);
    return {
      ...station,
      proximityScore,
      proximityRank: getProximityRank(proximityScore)
    };
  });
};

const calculateProximityScore = (station, originLat, originLng) => {
  const TIME_WEIGHT = 0.5;
  const DISTANCE_WEIGHT = 0.3;
  const ROUTE_WEIGHT = 0.2;
  const maxTime = 60;
  const maxDistance = 50;
  const maxRouteRatio = 3;
  let timeScore = 0;
  if (station.travelTime) {
    timeScore = Math.min(station.travelTime / maxTime * 100, 100);
  } else {
    const estimatedTime = (station.routeDistance || station.straightLineDistance) / 40 * 60;
    timeScore = Math.min(estimatedTime / maxTime * 100, 100);
  }
  const distance = station.routeDistance || station.straightLineDistance;
  const distanceScore = Math.min(distance / maxDistance * 100, 100);
  const routeRatio = distance / station.straightLineDistance;
  const routeScore = Math.min(routeRatio / maxRouteRatio * 100, 100);
  const proximityScore = (
    timeScore * TIME_WEIGHT +
    distanceScore * DISTANCE_WEIGHT +
    routeScore * ROUTE_WEIGHT
  );
  return proximityScore;
};

const getProximityRank = (score) => {
  if (score <= 20) return 'Excellent';
  if (score <= 40) return 'Very Good';
  if (score <= 60) return 'Good';
  if (score <= 80) return 'Fair';
  return 'Distant';
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}; 