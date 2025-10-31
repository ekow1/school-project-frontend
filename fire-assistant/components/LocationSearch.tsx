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

const GOOGLE_API_KEY = "AIzaSyABM58KqCxdeVPL6LgGPXfAkHZxbfNE-pA"

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
      const searchStrategies = [
        {
          url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query,
          )}&key=${GOOGLE_API_KEY}&components=country:gh&language=en&types=geocode|establishment`,
          priority: 1,
        },
        {
          url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query + " Ghana",
          )}&key=${GOOGLE_API_KEY}&language=en&types=geocode|establishment`,
          priority: 2,
        },
        {
          url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query,
          )}&key=${GOOGLE_API_KEY}&types=establishment&components=country:gh&language=en`,
          priority: 3,
        },
      ]

      const results = await Promise.allSettled(
        searchStrategies.map(async (strategy) => {
          const response = await fetch(strategy.url, {
            signal: abortControllerRef.current?.signal,
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()

          if (data.status === "REQUEST_DENIED") {
            throw new Error("API key invalid or quota exceeded")
          }

          return {
            predictions: data.predictions || [],
            priority: strategy.priority,
          }
        }),
      )

      let allResults: (SearchResult & { priority: number })[] = []

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.predictions) {
          const ghanaResults = result.value.predictions
            .filter((prediction: SearchResult) => {
              const description = prediction.description.toLowerCase()
              const queryLower = query.toLowerCase()
              
              // Check if it's in Ghana
              const isGhana =
                description.includes("ghana") ||
                prediction.terms.some((term: { value: string }) => term.value.toLowerCase() === "ghana") ||
                result.value.priority === 1

              // Check if it matches the searched region/city
              const matchesSearch = matchesSearchLocation(description, queryLower, prediction.terms)

              const isDuplicate = allResults.some((existing) => existing.place_id === prediction.place_id)

              return isGhana && matchesSearch && !isDuplicate
            })
            .map((prediction: SearchResult) => ({
              ...prediction,
              priority: result.value.priority,
            }))

          allResults = [...allResults, ...ghanaResults]
        }
      })

      console.log("Found results:", allResults.length) // Debug log

      if (allResults.length > 0) {
        // Sort by relevance and priority
        const sortedResults = allResults.sort((a, b) => {
          const aMain = a.structured_formatting?.main_text?.toLowerCase() || a.description.toLowerCase()
          const bMain = b.structured_formatting?.main_text?.toLowerCase() || b.description.toLowerCase()
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
      if (error.name !== "AbortError") {
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

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => getPlaceDetails(item.place_id, item.structured_formatting.main_text)}
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
            {/* Debug info */}
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>
                Results: {searchResults.length} | Searching: {isSearching ? "Yes" : "No"} | HasSearched: {hasSearched ? "Yes" : "No"}
              </Text>
            </View>
            
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
  debugInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  debugText: {
    fontSize: 11,
    color: "#dc2626",
    fontWeight: "600",
  },
})

export default LocationSearch
