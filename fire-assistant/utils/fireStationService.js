// Enhanced Fire Station Search Service with Service Area Mapping
// This service provides comprehensive fire station discovery for Ghana

import axios from 'axios';
import { ENV } from '../config/env';

const GOOGLE_API_KEY = ENV.GOOGLE_API_KEY;

// Helper function to check if user location is in Accra
const isUserInAccra = (lat, lng) => {
  // Accra bounds (Greater Accra Region)
  // Approximate bounds for Accra metropolitan area
  const accraBounds = {
    minLat: 5.45,
    maxLat: 5.75,
    minLng: -0.35,
    maxLng: 0.10
  };
  
  return lat >= accraBounds.minLat && 
         lat <= accraBounds.maxLat && 
         lng >= accraBounds.minLng && 
         lng <= accraBounds.maxLng;
};

// Helper function to check if a station is in Accra or Tema
const isStationInAccraOrTema = (station) => {
  const name = station.name?.toLowerCase() || '';
  const address = station.address?.toLowerCase() || 
                  station.formatted_address?.toLowerCase() || 
                  station.vicinity?.toLowerCase() || '';
  
  const accraKeywords = [
    'accra', 'greater accra', 'east legon', 'west legon', 'oshie', 'labadi', 
    'madina', 'adenta', 'dansoman', 'kantamanto', 'circle', 'kanda', 
    'airport', 'kotoka', 'achimota', 'legon', 'dome', 'kwabenya', 'botwe'
  ];
  
  const temaKeywords = [
    'tema', 'tema new town', 'tema community', 'tema port', 
    'tema industrial', 'ashaiman'
  ];
  
  const searchText = `${name} ${address}`;
  
  const inAccra = accraKeywords.some(keyword => searchText.includes(keyword));
  const inTema = temaKeywords.some(keyword => searchText.includes(keyword));
  
  return inAccra || inTema;
};

// Helper function to check if a station is in Ghana
const isStationInGhana = (station) => {
  const name = station.name?.toLowerCase() || '';
  const address = station.address?.toLowerCase() || 
                  station.formatted_address?.toLowerCase() || 
                  station.vicinity?.toLowerCase() || '';
  
  const searchText = `${name} ${address}`;
  
  // Check if address contains Ghana or Ghanaian location indicators
  return searchText.includes('ghana') || 
         searchText.includes('accra') ||
         searchText.includes('kumasi') ||
         searchText.includes('tema') ||
         searchText.includes('cape coast') ||
         searchText.includes('tamale') ||
         searchText.includes('takoradi') ||
         searchText.includes('sunyani') ||
         searchText.includes('ho') ||
         searchText.includes('koforidua') ||
         searchText.includes('bolgatanga') ||
         searchText.includes('wa');
};

// Helper function to check if a fire station is in the correct region
const isStationInRegion = (station, regionName) => {
  const name = station.name?.toLowerCase() || '';
  const address = station.formatted_address?.toLowerCase() || station.vicinity?.toLowerCase() || station.address?.toLowerCase() || '';
  
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
    // Preserve existing phone number if already available (e.g., from Serper API)
    let phoneNumber = station.phone || null;
    
    // Only try to fetch phone number if we don't already have one
    if (!phoneNumber) {
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
    }
    
    stationsWithPhones.push({
      ...station,
      phone: phoneNumber
    });
    
    // Log if phone number was preserved from Serper API
    if (station.phone && station.searchStrategy === 'Serper API search') {
      console.log(`Preserved phone number from Serper API for ${station.name}: ${phoneNumber}`);
    }
    
    // Add delay to avoid rate limiting (only if we made an API call)
    if (!station.phone) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
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

// Enhanced fire station search with service area mapping
export const fetchNearbyFireStations = async (lat, lng, radius = 20000, limit = 20, regionName = null) => {
  try {
    // Limit search radius to 20km (20000 meters)
    const maxRadius = 20000;
    const searchRadius = Math.min(radius, maxRadius);
    
    // Check if user is in Accra
    const userInAccra = isUserInAccra(lat, lng);
    console.log(`User location: ${lat}, ${lng} - In Accra: ${userInAccra}`);
    
    let allStations = await searchFireStations(lat, lng, searchRadius, regionName);
    
    // Filter: Only show stations in Ghana
    allStations = allStations.filter(station => {
      const inGhana = isStationInGhana(station);
      if (!inGhana) {
        console.log(`Filtering out non-Ghana station: ${station.name}`);
      }
      return inGhana;
    });
    
    // If user is in Accra, only show Accra and Tema stations
    if (userInAccra) {
      console.log('User is in Accra - filtering to show only Accra and Tema stations');
      allStations = allStations.filter(station => {
        const inAccraOrTema = isStationInAccraOrTema(station);
        if (!inAccraOrTema) {
          console.log(`Filtering out non-Accra/Tema station: ${station.name} (${station.address})`);
        }
        return inAccraOrTema;
      });
    }
    
    const serviceAreaStations = getServiceAreaStations(lat, lng, allStations);
    if (serviceAreaStations.length > 0) {
      allStations = [...allStations, ...serviceAreaStations];
    }
    const uniqueStations = removeDuplicateStations(allStations);
    
    // Calculate route distances using Mapbox Matrix API
    const stationsWithRouteDistance = await calculateRouteDistances(lat, lng, uniqueStations);
    
    // Filter by 20km distance limit (using route distance if available)
    const stationsWithin20km = stationsWithRouteDistance.filter(station => {
      const distance = station.routeDistance || station.straightLineDistance || Infinity;
      return distance <= 20; // 20km limit
    });
    
    const stationsWithProximityScores = calculateProximityScores(stationsWithin20km, lat, lng);
    
    // Fetch phone numbers for all stations
    const stationsWithPhones = await fetchPhoneNumbersForStations(stationsWithProximityScores);
    
    // Log summary of phone numbers and routes
    const stationsWithPhone = stationsWithPhones.filter(s => s.phone).length;
    const stationsWithRoute = stationsWithPhones.filter(s => s.routeDistanceText && s.routeDistanceText !== 'Route unavailable').length;
    console.log(`Summary: ${stationsWithPhones.length} total stations within 20km, ${stationsWithPhone} with phone numbers, ${stationsWithRoute} with route data`);
    
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

// Function to search fire stations using Serper API
const searchFireStationsWithSerper = async (lat, lng, regionName = null) => {
  try {
    // Build multiple search queries for better coverage
    const searchQueries = [];
    
    // Base queries
    searchQueries.push('fire station Ghana');
    searchQueries.push('Ghana National Fire Service');
    searchQueries.push('GNFS Ghana');
    
    // Location-based queries
    searchQueries.push(`fire station near ${lat},${lng}`);
    
    // Region-specific queries if region name is provided
    if (regionName) {
      searchQueries.push(`fire station in ${regionName}`);
      searchQueries.push(`fire station ${regionName} Ghana`);
      searchQueries.push(`GNFS ${regionName}`);
      searchQueries.push(`Ghana National Fire Service ${regionName}`);
    }
    
    const allStations = [];
    const seenPlaceIds = new Set();
    
    // Search with each query
    for (const searchQuery of searchQueries) {
      try {
        const data = JSON.stringify({
          q: searchQuery
        });

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://google.serper.dev/maps',
          headers: { 
            'X-API-KEY': ENV.SERPER_API_KEY, 
            'Content-Type': 'application/json'
          },
          data: data
        };

        const response = await axios.request(config);
        
        // Console.log the response for debugging
        console.log(`Serper API Response for query "${searchQuery}":`, JSON.stringify(response.data, null, 2));
        
        // Transform Serper response to match our station format
        if (response.data && response.data.places) {
          response.data.places.forEach((place, index) => {
            // Extract coordinates - they are direct properties in Serper response
            const latitude = place.latitude;
            const longitude = place.longitude;
            
            // Skip if no coordinates or already seen
            if (latitude == null || longitude == null) {
              return;
            }
            
            // Check for duplicates by placeId
            if (place.placeId && seenPlaceIds.has(place.placeId)) {
              return;
            }
            
            // Check if it's a fire station by type or name
            const placeType = place.type?.toLowerCase() || '';
            const placeTypes = (place.types || []).map(t => t.toLowerCase());
            const placeName = (place.title || '').toLowerCase();
            const placeAddress = (place.address || '').toLowerCase();
            
            const isFireStationType = 
              placeType === 'fire station' ||
              placeTypes.includes('fire station') ||
              placeName.includes('fire') ||
              placeName.includes('gnfs') ||
              placeAddress.includes('fire station') ||
              placeAddress.includes('fire service');
            
            // Skip if it's clearly not a fire station
            if (!isFireStationType) {
              console.log(`Skipping non-fire-station place: ${place.title} (type: ${placeType})`);
              return;
            }
            
            // Mark as seen
            if (place.placeId) {
              seenPlaceIds.add(place.placeId);
            }
            
            // Determine if station is open now based on openingHours
            let isOpen = null;
            if (place.openingHours) {
              const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
              const todayHours = place.openingHours[today];
              if (todayHours) {
                isOpen = todayHours.toLowerCase().includes('open 24 hours') || 
                         todayHours.toLowerCase().includes('open');
              }
            }
            
            allStations.push({
              id: place.placeId || `serper_${Date.now()}_${index}`,
              name: place.title || 'Fire Station',
              address: place.address || '',
              latitude: latitude,
              longitude: longitude,
              placeId: place.placeId || null,
              rating: place.rating || null,
              ratingCount: place.ratingCount || null,
              isOpen: isOpen,
              phone: place.phoneNumber || null,
              website: place.website || null,
              straightLineDistance: calculateDistance(lat, lng, latitude, longitude),
              photoReference: place.thumbnailUrl || null,
              searchStrategy: 'Serper API search'
            });
          });
        }
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (queryError) {
        console.error(`Error searching Serper API with query "${searchQuery}":`, queryError);
      }
    }
    
    console.log(`Serper API: Found ${allStations.length} unique fire stations after all queries`);
    console.log('Serper API Stations:', JSON.stringify(allStations, null, 2));
    
    return allStations;
  } catch (error) {
    console.error('Error searching fire stations with Serper API:', error);
    if (error.response) {
      console.error('Serper API Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
};

const searchFireStations = async (lat, lng, radius, regionName = null) => {
  // Add Serper API search as the first strategy
  const serperStations = await searchFireStationsWithSerper(lat, lng, regionName);
  
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
  
  // Filter Serper API results
  const filteredSerperStations = serperStations.filter(station => {
    const name = station.name?.toLowerCase() || '';
    const address = station.address?.toLowerCase() || '';
    
    // Check if it's a fire station (more lenient check since Serper already filtered by type)
    const isFireStation = name.includes('fire') ||
                        name.includes('gnfs') ||
                        name.includes('ghana national fire service') ||
                        name.includes('fire service') ||
                        name.includes('national fire service') ||
                        address.includes('fire station') ||
                        address.includes('fire service');
    
    // Check for excluded words
    const hasExcludedWords = excludeWords.some(word => 
      name.includes(word) || address.includes(word)
    );
    
    // Check if station is in the correct region (if regionName is provided)
    // For region-specific searches, be more lenient - check if address contains region name
    let isInCorrectRegion = true;
    if (regionName) {
      const regionLower = regionName.toLowerCase();
      isInCorrectRegion = isStationInRegion(station, regionName) || 
                         address.includes(regionLower) ||
                         name.includes(regionLower);
    }
    
    // Always include stations that are very close (within 5km) regardless of region filter
    const isVeryClose = station.straightLineDistance && station.straightLineDistance <= 5;
    
    const shouldInclude = isFireStation && !hasExcludedWords && (isInCorrectRegion || isVeryClose);
    
    if (!shouldInclude) {
      console.log(`Serper station filtered out: ${station.name}`, {
        isFireStation,
        hasExcludedWords,
        isInCorrectRegion,
        name,
        address
      });
    } else {
      console.log(`Serper station included: ${station.name} (${station.straightLineDistance?.toFixed(2)}km away)`);
    }
    
    return shouldInclude;
  });
  
  console.log(`Serper API: ${serperStations.length} total stations, ${filteredSerperStations.length} after filtering`);
  
  // Start with filtered Serper API results
  let allStations = [...filteredSerperStations];
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
            
            // Check for duplicates (handle both placeId and place_id formats)
            const isDuplicate = allStations.some(existing => {
              const existingPlaceId = existing.placeId || existing.place_id;
              const stationPlaceId = station.place_id;
              // Also check by coordinates if placeId matches
              if (existingPlaceId && stationPlaceId && existingPlaceId === stationPlaceId) {
                return true;
              }
              // Check by name and location if placeIds don't match
              if (existing.name === station.name && 
                  Math.abs(existing.latitude - station.geometry.location.lat) < 0.0001 &&
                  Math.abs(existing.longitude - station.geometry.location.lng) < 0.0001) {
                return true;
              }
              return false;
            });
            
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

// Helper function to format duration in seconds to human-readable text
const formatDuration = (seconds) => {
  if (!seconds) return 'Unknown';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};

// Helper function to format distance in meters to human-readable text
const formatDistance = (meters) => {
  if (!meters) return '0 km';
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

const calculateRouteDistances = async (originLat, originLng, stations) => {
  try {
    const mapboxToken = ENV.MAPBOX_ACCESS_TOKEN;
    
    if (!mapboxToken) {
      console.warn('Mapbox access token not configured. Using straight-line distances.');
      return stations.map(station => ({
        ...station,
        routeDistance: station.straightLineDistance,
        travelTime: null,
        routeDistanceText: `${station.straightLineDistance.toFixed(1)} km`,
        travelTimeText: 'N/A',
      }));
    }
    
    console.log(`Calculating routes using Mapbox Matrix API for ${stations.length} stations from origin: ${originLat}, ${originLng}`);
    
    // Mapbox Matrix API supports up to 25 coordinates per request
    const batchSize = 24; // 1 origin + 24 destinations = 25 total
    const stationBatches = [];
    for (let i = 0; i < stations.length; i += batchSize) {
      stationBatches.push(stations.slice(i, i + batchSize));
    }
    
    const stationsWithRouteData = [];
    
    for (const batch of stationBatches) {
      try {
        // Mapbox uses longitude,latitude format (longitude first!)
        // First coordinate is the origin, followed by destinations
        const coordinates = [
          `${originLng},${originLat}`, // Origin
          ...batch.map(station => `${station.longitude},${station.latitude}`) // Destinations
        ].join(';');
        
        const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordinates}?access_token=${mapboxToken}&annotations=distance,duration`;
        
        const response = await fetch(url);
        const matrixData = await response.json();
        
        if (matrixData.code === 'Ok' && matrixData.distances && matrixData.durations) {
          // Matrix API returns distances in meters and durations in seconds
          // distances[0] contains distances from origin (index 0) to all destinations
          // durations[0] contains durations from origin (index 0) to all destinations
          const distances = matrixData.distances[0];
          const durations = matrixData.durations[0];
          
          batch.forEach((station, index) => {
            // Index + 1 because index 0 is the origin itself
            const distanceMeters = distances[index + 1];
            const durationSeconds = durations[index + 1];
            
            if (distanceMeters != null && durationSeconds != null) {
              const distanceKm = distanceMeters / 1000;
              const durationMinutes = durationSeconds / 60;
              
              stationsWithRouteData.push({
                ...station,
                routeDistance: distanceKm,
                travelTime: durationMinutes,
                routeDistanceText: formatDistance(distanceMeters),
                travelTimeText: formatDuration(durationSeconds),
              });
            } else {
              console.log(`Route calculation failed for station ${station.name}: No data from Mapbox`);
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
          console.warn(`Mapbox Matrix API error: ${matrixData.code || 'Unknown'}`, matrixData.message);
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
        console.error('Error calculating route distances with Mapbox:', batchError);
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
      
      // Add delay between batches to avoid rate limiting
      if (stationBatches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`Mapbox route calculation complete: ${stationsWithRouteData.length} stations processed`);
    return stationsWithRouteData;
  } catch (error) {
    console.error('Error in calculateRouteDistances:', error);
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
  // Use route distance if available, otherwise fall back to straight-line distance
  const TIME_WEIGHT = 0.4;
  const DISTANCE_WEIGHT = 0.6;
  const maxTime = 60; // minutes
  const maxDistance = 50; // km
  
  const distance = station.routeDistance || station.straightLineDistance || 0;
  const distanceScore = Math.min(distance / maxDistance * 100, 100);
  
  let timeScore = 0;
  if (station.travelTime) {
    timeScore = Math.min(station.travelTime / maxTime * 100, 100);
  } else {
    // Estimate time based on distance (assuming average speed of 40 km/h)
    const estimatedTime = distance / 40 * 60; // minutes
    timeScore = Math.min(estimatedTime / maxTime * 100, 100);
  }
  
  const proximityScore = (
    timeScore * TIME_WEIGHT +
    distanceScore * DISTANCE_WEIGHT
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
