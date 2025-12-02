"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"
import axios from 'axios'
import { ENV } from "../config/env"

const GOOGLE_API_KEY = ENV.GOOGLE_API_KEY // Still used for fallback place details

interface Location {
  latitude: number
  longitude: number
  address: string
  name: string
}

interface SearchResult {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
  terms: Array<{ value: string }>
  // Serper API fields
  title?: string
  address?: string
  latitude?: number
  longitude?: number
  placeId?: string
}

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void
  visible: boolean
  onClose: () => void
}

// Helper function to check if a location matches the search query
const matchesSearchLocation = (description: string, query: string, terms: Array<{ value: string }>): boolean => {
  const queryLower = query.toLowerCase()
  const descriptionLower = description.toLowerCase()
  
  // Ghana regions and cities mapping
  const regionMappings: { [key: string]: string[] } = {
    'accra': ['accra', 'greater accra', 'greater accra region', 'east legon', 'west legon', 'oshie', 'labadi', 'tema', 'madina', 'adenta', 'dansoman', 'kantamanto', 'circle', 'kanda', 'airport', 'kotoka'],
    'greater accra': ['accra', 'greater accra', 'greater accra region', 'east legon', 'west legon', 'oshie', 'labadi', 'tema', 'madina', 'adenta', 'dansoman', 'kantamanto', 'circle', 'kanda', 'airport', 'kotoka'],
    'tema': ['tema', 'tema new town', 'tema community', 'tema port', 'tema industrial', 'ashaiman'],
    'kumasi': ['kumasi', 'ashanti', 'ashanti region', 'asanteman', 'suame', 'adum', 'kejetia', 'asokwa', 'kwadaso', 'bantama'],
    'ashanti': ['kumasi', 'ashanti', 'ashanti region', 'asanteman', 'suame', 'adum', 'kejetia', 'asokwa', 'kwadaso', 'bantama'],
    'suhum': ['suhum', 'eastern region', 'eastern', 'koforidua', 'akim', 'akwapim'],
    'eastern': ['suhum', 'eastern region', 'eastern', 'koforidua', 'akim', 'akwapim', 'akosombo', 'nsawam'],
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
  }

  // Check if any term matches the search query
  const termMatches = terms.some(term => {
    const termValue = term.value.toLowerCase()
    return regionMappings[queryLower]?.includes(termValue) || termValue.includes(queryLower)
  })

  // Check if description contains relevant keywords
  const descriptionMatches = regionMappings[queryLower]?.some(keyword => 
    descriptionLower.includes(keyword)
  ) || descriptionLower.includes(queryLower)

  return termMatches || descriptionMatches
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect, visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (!query.trim()) {
      setSearchResults([])
      setHasSearched(false)
      setError(null)
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(query)
    }, 300)
  }, [])

  const searchPlaces = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    setError(null)
    setHasSearched(true)

    console.log("Searching for:", query) // Debug log

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      // Build search queries for Serper API
      const searchQueries = [
        query,
        `${query} Ghana`,
        `${query} location Ghana`
      ];

      const allResults: (SearchResult & { priority: number })[] = []
      const seenPlaceIds = new Set<string>()

      // Search with each query
      for (let i = 0; i < searchQueries.length; i++) {
        const searchQuery = searchQueries[i];
        
        try {
          const data = JSON.stringify({
            q: searchQuery
          });

          const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://google.serper.dev/places',
            headers: { 
              'X-API-KEY': ENV.SERPER_API_KEY, 
              'Content-Type': 'application/json'
            },
            data: data,
            signal: abortControllerRef.current?.signal
          };

          const response = await axios.request(config);
          
          console.log(`Serper API Response for "${searchQuery}":`, JSON.stringify(response.data, null, 2));
          
          if (response.data && response.data.places) {
            response.data.places.forEach((place: any) => {
              // Check if it's in Ghana
              const address = (place.address || '').toLowerCase();
              const title = (place.title || '').toLowerCase();
              const searchText = `${title} ${address}`;
              
              const isGhana = searchText.includes('ghana') || 
                             address.includes('accra') ||
                             address.includes('kumasi') ||
                             address.includes('tema') ||
                             address.includes('cape coast') ||
                             address.includes('tamale');
              
              if (!isGhana) {
                return;
              }
              
              // Check for duplicates
              const placeId = place.placeId || place.place_id || `${place.latitude}_${place.longitude}`;
              if (seenPlaceIds.has(placeId)) {
                return;
              }
              seenPlaceIds.add(placeId);
              
              // Transform Serper result to SearchResult format
              const searchResult: SearchResult & { priority: number } = {
                place_id: placeId,
                description: place.address || place.title || '',
                structured_formatting: {
                  main_text: place.title || place.address || '',
                  secondary_text: place.address || ''
                },
                terms: [
                  { value: place.title || '' },
                  { value: place.address || '' }
                ],
                title: place.title,
                address: place.address,
                latitude: place.latitude,
                longitude: place.longitude,
                placeId: place.placeId || place.place_id,
                priority: i + 1 // Lower number = higher priority
              };
              
              allResults.push(searchResult);
            });
          }
          
          // Add delay between requests
          if (i < searchQueries.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (queryError: any) {
          // Ignore canceled requests (expected when user types quickly)
          if (queryError.name !== "AbortError" && 
              queryError.name !== "CanceledError" && 
              !queryError.message?.includes("canceled") &&
              !queryError.message?.includes("aborted")) {
            console.error(`Error searching Serper API with query "${searchQuery}":`, queryError);
          }
        }
      }

      console.log("Found results:", allResults.length) // Debug log

      if (allResults.length > 0) {
        // Sort by relevance and priority
        const sortedResults = allResults.sort((a, b) => {
          const aMain = (a.structured_formatting?.main_text || a.title || a.description || '').toLowerCase()
          const bMain = (b.structured_formatting?.main_text || b.title || b.description || '').toLowerCase()
          const queryLower = query.toLowerCase()

          // Exact match first
          if (aMain === queryLower && bMain !== queryLower) return -1
          if (bMain === queryLower && aMain !== queryLower) return 1

          // Starts with query
          if (aMain.startsWith(queryLower) && !bMain.startsWith(queryLower)) return -1
          if (bMain.startsWith(queryLower) && !aMain.startsWith(queryLower)) return 1

          // Contains query
          if (aMain.includes(queryLower) && !bMain.includes(queryLower)) return -1
          if (bMain.includes(queryLower) && !aMain.includes(queryLower)) return 1

          // Priority (lower number = higher priority)
          return a.priority - b.priority
        })

        const finalResults = sortedResults.slice(0, 8)
        console.log("Setting results:", finalResults.length) // Debug log
        setSearchResults(finalResults)
      } else {
        console.log("No results found") // Debug log
        setSearchResults([])
      }
    } catch (error: any) {
      // Ignore canceled requests (expected when user types quickly)
      if (error.name !== "AbortError" && 
          error.name !== "CanceledError" && 
          !error.message?.includes("canceled") &&
          !error.message?.includes("aborted")) {
        console.error("Search error:", error)
        setError("Failed to search locations. Please try again.")
        setSearchResults([])
      }
    } finally {
      setIsSearching(false)
    }
  }

  const getPlaceDetails = async (placeId: string, resultName: string) => {
    try {
      setIsSearching(true)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address,name&key=${GOOGLE_API_KEY}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "REQUEST_DENIED") {
        throw new Error("API key invalid or quota exceeded")
      }

      if (data.result) {
        const { geometry, formatted_address, name } = data.result
        const location: Location = {
          latitude: geometry.location.lat,
          longitude: geometry.location.lng,
          address: formatted_address,
          name: name || resultName || formatted_address,
        }

        onLocationSelect(location)
        handleClose()
      } else {
        throw new Error("Location details not found")
      }
    } catch (error: any) {
      console.error("Place details error:", error)
      Alert.alert("Error", "Failed to get location details. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleClose = useCallback(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Clear timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Reset state
    setSearchQuery("")
    setSearchResults([])
    setIsSearching(false)
    setHasSearched(false)
    setError(null)

    // Dismiss keyboard
    Keyboard.dismiss()

    onClose()
  }, [onClose])

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text)
    debouncedSearch(text)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setHasSearched(false)
    setError(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleLocationSelectFromResult = (item: SearchResult) => {
    // If we already have coordinates from Serper API, use them directly
    if (item.latitude != null && item.longitude != null) {
      const location: Location = {
        latitude: item.latitude,
        longitude: item.longitude,
        address: item.address || item.description || item.structured_formatting?.secondary_text || '',
        name: item.title || item.structured_formatting?.main_text || item.description || '',
      };
      onLocationSelect(location);
      handleClose();
    } else {
      // Fallback to getting place details (for backward compatibility)
      getPlaceDetails(item.place_id, item.structured_formatting.main_text);
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleLocationSelectFromResult(item)}
      activeOpacity={0.8}
    >
      <View style={styles.searchResultContent}>
        <View style={styles.locationIcon}>
          <Text style={styles.locationIconText}>📍</Text>
        </View>
        <View style={styles.searchResultTextContainer}>
          <Text style={styles.searchResultMain} numberOfLines={1}>
            {item.structured_formatting.main_text}
          </Text>
          <Text style={styles.searchResultSecondary} numberOfLines={2}>
            {item.structured_formatting.secondary_text}
          </Text>
        </View>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => {
    if (isSearching) return null

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>⚠️</Text>
          <Text style={styles.emptyStateTitle}>Search Error</Text>
          <Text style={styles.emptyStateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => debouncedSearch(searchQuery)}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (hasSearched && searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateTitle}>No Results Found</Text>
          <Text style={styles.emptyStateText}>
            No locations found in Ghana for "{searchQuery}". Try a different search term.
          </Text>
        </View>
      )
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🇬🇭</Text>
          <Text style={styles.emptyStateTitle}>Search Locations in Ghana</Text>
          <Text style={styles.emptyStateText}>Enter a city, address, or landmark to find locations across Ghana.</Text>
        </View>
      )
    }

    return null
  }

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={handleClose} transparent>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.5)" />
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Search Location</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a location in Ghana..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={handleSearchInputChange}
                autoCorrect={false}
                autoFocus={true}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
              {isSearching && <ActivityIndicator size="small" color="#d32f2f" style={styles.searchLoader} />}
            </View>
          </View>

          {/* Search Results */}
          <View style={styles.resultsContainer}>
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.place_id}
                style={styles.searchResultsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              renderEmptyState()
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    height: "70%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  closeButton: {
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: "#d32f2f",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  placeholder: {
    width: 36,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#d32f2f",
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: "#d32f2f",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  clearButton: {
    width: 18,
    height: 18,
    borderRadius: 100,
    backgroundColor: "#d32f2f",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
  },
  searchLoader: {
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  searchResultsList: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  searchResultItem: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 4,
 
  },
  searchResultContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  locationIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationIconText: {
    fontSize: 18,
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultMain: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 3,
  },
  searchResultSecondary: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },

  arrowText: {
    fontSize: 18,
    color: "#d32f2f",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 56,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#d32f2f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
})

export default LocationSearch
