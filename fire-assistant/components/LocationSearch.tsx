"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
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

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C', danger: '#EF4444', accent: '#7C2D12' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

interface Location {
  latitude: number
  longitude: number
  address: string
  name: string
}

interface SearchResult {
  place_id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void
  visible: boolean
  onClose: () => void
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect, visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (abortControllerRef.current) abortControllerRef.current.abort()

    if (!query.trim()) {
      setSearchResults([])
      setHasSearched(false)
      setError(null)
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(query)
    }, 400)
  }, [])

  const searchPlaces = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    setError(null)
    setHasSearched(true)

    abortControllerRef.current = new AbortController()

    try {
      // Nominatim (OpenStreetMap) — free, no API key, great Ghana coverage
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(query)}` +
        `&countrycodes=gh` +
        `&format=json` +
        `&addressdetails=1` +
        `&limit=8`

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'FireAssistantApp/1.0',
        },
      })
      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        const results: SearchResult[] = data.map((p: any) => ({
          place_id: String(p.place_id),
          name: p.name || p.display_name.split(',')[0].trim(),
          address: p.display_name,
          latitude: parseFloat(p.lat),
          longitude: parseFloat(p.lon),
        }))
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    } catch (err: any) {
      if (
        err.name !== 'AbortError' &&
        err.name !== 'CanceledError' &&
        !err.message?.includes('canceled') &&
        !err.message?.includes('aborted')
      ) {
        console.error('Search error:', err)
        setError('Failed to search locations. Please try again.')
        setSearchResults([])
      }
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
    onLocationSelect({
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address,
      name: item.name,
    })
    handleClose()
  }

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
            {item.name}
          </Text>
          <Text style={styles.searchResultSecondary} numberOfLines={2}>
            {item.address}
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
    backgroundColor: NB.bg,
    borderWidth: 3,
    borderColor: NB.border,
    overflow: "hidden",
    ...nbShadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 3,
    borderBottomColor: NB.border,
    backgroundColor: NB.surface,
  },
  closeButton: {
    width: 24,
    height: 24,
    backgroundColor: NB.primary,
    borderWidth: 2,
    borderColor: NB.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: NB.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  closeButtonText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "800",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NB.border,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 36,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: NB.bg,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NB.surface,
    borderWidth: 2,
    borderColor: NB.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: NB.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: NB.border,
    fontWeight: "600",
  },
  clearButton: {
    width: 20,
    height: 20,
    backgroundColor: NB.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "800",
  },
  searchLoader: {
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: NB.bg,
  },
  searchResultsList: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  searchResultItem: {
    backgroundColor: NB.surface,
    borderWidth: 2,
    borderColor: NB.border,
    marginVertical: 6,
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  searchResultContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  locationIcon: {
    width: 34,
    height: 34,
    backgroundColor: NB.primary + '20',
    borderWidth: 2,
    borderColor: NB.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationIconText: {
    fontSize: 16,
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultMain: {
    fontSize: 15,
    fontWeight: "800",
    color: NB.border,
    marginBottom: 4,
  },
  searchResultSecondary: {
    fontSize: 13,
    color: NB.muted,
    lineHeight: 18,
    fontWeight: '600',
  },

  arrowText: {
    fontSize: 18,
    color: NB.primary,
    fontWeight: "800",
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
    fontWeight: "800",
    color: NB.border,
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyStateText: {
    fontSize: 14,
    color: NB.muted,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: NB.primary,
    borderWidth: 2,
    borderColor: NB.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
})

export default LocationSearch
