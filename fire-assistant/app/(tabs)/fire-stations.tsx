import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlert from '../../components/CustomAlert';
import { FireStationDetailCard } from '../../components/FireStationDetailCard';
import { LocationSearch } from '../../components/LocationSearch';
import { useAuthStore } from '../../store/authStore';
import { FireStationClickData, useFireStationStore } from '../../store/fireStationStore';
import { fetchNearbyFireStations, FireStation } from '../../utils/fireStationSearch';

const NB = { border: '#1A1A1A', primary: '#C41230', bg: '#FFF8EF', surface: '#FFFFFF', muted: '#78716C', danger: '#EF4444', accent: '#7C2D12', success: '#10B981', warning: '#E8A020' };
const nbShadow = { shadowColor: NB.border, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 };

const Colors = {
  primary: "#C41230",
  primaryLight: "#E85B4A",
  primaryDark: "#8B0D21",
  secondary: "#1A1A1A",
  tertiary: "#78716C",
  background: "#FFF8EF",
  surface: "#FFFFFF",
  surfaceVariant: "#F5EDE3",
  border: "#D4C4B5",
  success: "#10B981",
  warning: "#E8A020",
  danger: "#EF4444",
  accent: "#7C2D12",
  shadow: "rgba(0, 0, 0, 0.1)",
  primaryAlpha: "rgba(196, 18, 48, 0.1)",
  accentAlpha: "rgba(124, 45, 18, 0.1)",
};

export default function FireStationsScreen() {
  const insets = useSafeAreaInsets();
  const { user, token } = useAuthStore();
  const { sendFireStationClick, sendFireStationsBulk, isSaving, isLoading: storeLoading, error, clearError } = useFireStationStore();
  const [fireStations, setFireStations] = useState<FireStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number, longitude: number, address: string, name: string } | null>(null);
  const [stationLimit] = useState(20);

  // Custom alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    // Only request location permission if user is authenticated
    if (user && token) {
      requestLocationPermission();
    } else {
      setLocationPermission(false);
    }
  }, [user, token]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        await getCurrentLocation();
      } else {
        setLocationPermission(false);
        setAlertConfig({
          title: 'Location Permission Required',
          message: 'Please enable location access to find nearby fire stations.',
          type: 'warning',
        });
        setAlertVisible(true);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission(false);
      setAlertConfig({
        title: 'Permission Error',
        message: 'An error occurred while requesting location permission. Please try again.',
        type: 'error',
      });
      setAlertVisible(true);
    }
  };

  const getCurrentLocation = async () => {
    try {
      // Add timeout for location request (15 seconds)
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Location request timeout')), 15000)
      );

      const location = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;

      if (!location || !location.coords) {
        throw new Error('Invalid location data received');
      }

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      await searchFireStations(location.coords.latitude, location.coords.longitude);
    } catch (error: any) {
      console.error('Error getting location:', error);
      setLocationPermission(false);
      const errorMessage = error?.message?.includes('timeout')
        ? 'Location request timed out. Please check your GPS settings and try again, or search for a location manually.'
        : 'Unable to get your current location. Please search for a location manually.';
      setAlertConfig({
        title: 'Location Error',
        message: errorMessage,
        type: 'error',
      });
      setAlertVisible(true);
    }
  };

  const searchFireStations = async (lat: number, lng: number, regionName?: string) => {
    setLoading(true);
    try {
      // Validate coordinates
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates');
      }

      const stations = await fetchNearbyFireStations(lat, lng, 20000, stationLimit, regionName || null);
      // Ensure we always set an array, even if empty
      setFireStations(Array.isArray(stations) ? stations : []);
    } catch (error: any) {
      console.error('Error fetching fire stations:', error);
      setFireStations([]); // Set empty array on error to prevent crashes
      const errorMessage = error?.message?.includes('network') || error?.message?.includes('fetch')
        ? 'Network error. Please check your internet connection and try again.'
        : 'Failed to fetch fire stations. Please try again.';
      setAlertConfig({
        title: 'Error',
        message: errorMessage,
        type: 'error',
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setStationLimit(20); // Reset limit on refresh
    if (userLocation) {
      await searchFireStations(userLocation.latitude, userLocation.longitude);
    } else {
      await getCurrentLocation();
    }
    setRefreshing(false);
  };

  const handleCallStation = (station: FireStation) => {
    if (station.phone) {
      Linking.openURL(`tel:${station.phone}`);
    } else {
      setAlertConfig({
        title: 'No Phone Number',
        message: 'Phone number not available for this station.',
        type: 'warning',
      });
      setAlertVisible(true);
    }
  };

  const handleDirections = (station: FireStation) => {
    const url = `https://maps.google.com/maps?daddr=${station.latitude},${station.longitude}`;
    Linking.openURL(url);
  };

  const handleViewOnMap = (station: FireStation) => {
    const url = `https://maps.google.com/maps?q=${station.latitude},${station.longitude}`;
    Linking.openURL(url);
  };

  const handleStationPress = (station: FireStation) => {
    // Handle station press - could show more details or navigate to station info
    console.log('Station pressed:', station.name);
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const handleStationClick = async (stationData: FireStationClickData) => {
    try {
      console.log('Sending fire station click data to backend:', stationData);
      const result = await sendFireStationClick(stationData);

      if (result.success) {
        console.log('Fire station click data sent successfully:', result.message);

        if (result.alreadyExists) {
          showAlert(
            'Station Already Exists',
            `Fire station "${stationData.name}" already exists in the database.`,
            'warning'
          );
        } else {
          showAlert(
            'Data Added Successfully',
            `Fire station "${stationData.name}" has been added to the database successfully!`,
            'success'
          );
        }
      }
    } catch (error) {
      console.error('Error sending fire station click data:', error);
      showAlert(
        'Error',
        'Failed to send fire station data to backend. Please try again.',
        'error'
      );
    }
  };

  const handleSendToBackend = async (stationData: FireStationClickData) => {
    try {
      console.log('Sending individual fire station to backend:', stationData);
      const result = await sendFireStationClick(stationData);

      if (result.success) {
        console.log('Individual fire station sent successfully:', result.message);

        if (result.alreadyExists) {
          showAlert(
            'Station Already Exists',
            `Fire station "${stationData.name}" already exists in the database.`,
            'warning'
          );
        } else {
          showAlert(
            'Data Added Successfully',
            `Fire station "${stationData.name}" has been added to the database successfully!`,
            'success'
          );
        }
      }
    } catch (error) {
      console.error('Error sending individual fire station:', error);
      showAlert(
        'Error',
        'Failed to send fire station to backend. Please try again.',
        'error'
      );
    }
  };

  const handleSaveAllToBackend = async () => {
    if (fireStations.length === 0) {
      setAlertConfig({
        title: 'No Data',
        message: 'No fire stations to send to backend.',
        type: 'warning',
      });
      setAlertVisible(true);
      return;
    }

    setAlertConfig({
      title: 'Send All to Backend',
      message: `Send all ${fireStations.length} fire stations to backend?`,
      type: 'confirm',
      onConfirm: async () => {
        setAlertVisible(false);
        try {
          const stationsData = fireStations.map(station => ({
            name: station.name,
            location: station.address,
            location_url: `https://maps.google.com/maps?q=${station.latitude},${station.longitude}`,
            latitude: station.latitude,
            longitude: station.longitude,
            phone_number: station.phone || null,
            placeId: station.placeId
          }));

          const result = await sendFireStationsBulk(stationsData);

          if (result.success) {
            showAlert(
              'Data Added Successfully',
              `Successfully added ${fireStations.length} fire stations to the database!`,
              'success'
            );
          } else {
            showAlert(
              'Error',
              'Failed to send fire stations to backend. Please try again.',
              'error'
            );
          }

        } catch (error) {
          console.error('Error in bulk send:', error);
          showAlert(
            'Error',
            'Failed to send fire stations to backend. Please try again.',
            'error'
          );
        }
      },
      onCancel: () => {
        setAlertVisible(false);
      },
      confirmText: 'Send All',
      cancelText: 'Cancel',
    });
    setAlertVisible(true);
  };

  const extractRegionName = (locationName: string, address: string): string | undefined => {
    const nameLower = locationName.toLowerCase();
    const addressLower = address.toLowerCase();

    // Ghana regions and cities mapping
    const regionMappings: { [key: string]: string[] } = {
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

    // Check both name and address for region matches
    const searchText = `${nameLower} ${addressLower}`;

    for (const [region, keywords] of Object.entries(regionMappings)) {
      if (keywords.some(keyword => searchText.includes(keyword))) {
        return region;
      }
    }

    return undefined;
  };

  const handleLocationSelect = (location: { latitude: number, longitude: number, address: string, name: string }) => {
    setSelectedLocation(location);
    setShowLocationSearch(false);
    const regionName = extractRegionName(location.name, location.address);
    searchFireStations(location.latitude, location.longitude, regionName);
  };

  const handleSearchLocation = () => {
    setShowLocationSearch(true);
  };

  const handleUseCurrentLocation = async () => {
    if (userLocation) {
      setSelectedLocation(null);
      await searchFireStations(userLocation.latitude, userLocation.longitude);
    } else {
      await getCurrentLocation();
    }
  };


  const renderContent = () => {
    if (locationPermission === false) {
      return (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="map-marker-off" size={64} color={Colors.tertiary} />
          <Text style={styles.centerTitle}>Location Access Required</Text>
          <Text style={styles.centerSubtitle}>
            Please enable location access to find nearby fire stations, or search for a specific location.
          </Text>
          <View style={styles.emptyStateActions}>
            <TouchableOpacity style={styles.retryButton} onPress={requestLocationPermission}>
              <Text style={styles.retryButtonText}>Enable Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButtonEmpty} onPress={handleSearchLocation}>
              <Text style={styles.searchButtonEmptyText}>Search Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (loading && fireStations.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.centerTitle}>Searching for Fire Stations...</Text>
          <Text style={styles.centerSubtitle}>Finding stations near your location</Text>
        </View>
      );
    }

    if (fireStations.length === 0 && !loading) {
      return (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="fire-truck" size={64} color={Colors.tertiary} />
          <Text style={styles.centerTitle}>No Fire Stations Found</Text>
          <Text style={styles.centerSubtitle}>
            {selectedLocation
              ? `No fire stations were found near ${selectedLocation.name}. Try searching for a different location.`
              : 'No fire stations were found in your area. Try refreshing or search for a different location.'
            }
          </Text>
          <View style={styles.emptyStateActions}>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButtonEmpty} onPress={handleSearchLocation}>
              <Text style={styles.searchButtonEmptyText}>Search Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.resultsHeader}>
          <View style={styles.resultsHeaderLeft}>
            <Text style={styles.resultsTitle}>
              {fireStations.length} Fire Station{fireStations.length !== 1 ? 's' : ''} Found
            </Text>
            <Text style={styles.resultsSubtitle}>
              {selectedLocation
                ? `Fire stations in ${extractRegionName(selectedLocation.name, selectedLocation.address) || selectedLocation.name}`
                : 'Sorted by proximity to your location'
              }
            </Text>
          </View>
        </View>


        {fireStations.map((station, index) => (
          <FireStationDetailCard
            key={station.id || station.name}
            station={station}
            index={index}
            onPress={handleStationPress}
            onStationClick={handleStationClick}
            onSendToBackend={handleSendToBackend}
            showRanking={true}
          />
        ))}

      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="fire-truck" size={28} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Fire Stations</Text>
            <Text style={styles.headerSubtitle}>
              {fireStations.length > 0
                ? `${fireStations.length} stations found${selectedLocation ? ` in ${extractRegionName(selectedLocation.name, selectedLocation.address) || selectedLocation.name}` : ''}`
                : selectedLocation ? selectedLocation.name : 'Find nearby emergency services'
              }
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchLocation}>
            <Ionicons name="search" size={20} color={NB.border} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveAllButton, isSaving && styles.saveAllButtonDisabled]}
            onPress={handleSaveAllToBackend}
            disabled={isSaving || fireStations.length === 0}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                <Text style={styles.saveAllButtonText}>Save All</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={loading}>
            <Ionicons name="refresh" size={20} color={NB.border} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Search Bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity style={styles.searchLocationButton} onPress={handleSearchLocation}>
          <Ionicons name="location-outline" size={20} color={Colors.primary} />
          <Text style={styles.searchLocationText}>
            {selectedLocation ? selectedLocation.name : 'Search for a location...'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.tertiary} />
        </TouchableOpacity>

        {selectedLocation && (
          <TouchableOpacity style={styles.currentLocationButton} onPress={handleUseCurrentLocation}>
            <Ionicons name="locate" size={18} color={Colors.accent} />
            <Text style={styles.currentLocationText}>Use Current</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {renderContent()}

      {/* Location Search Modal */}
      <LocationSearch
        visible={showLocationSearch}
        onClose={() => setShowLocationSearch(false)}
        onLocationSelect={handleLocationSelect}
      />

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: NB.surface,
    borderBottomWidth: 3,
    borderBottomColor: NB.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: NB.border,
    backgroundColor: NB.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: NB.border,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: NB.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: NB.border,
    backgroundColor: NB.bg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: NB.border,
    backgroundColor: NB.bg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  saveAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NB.primary,
    borderWidth: 2,
    borderColor: NB.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  saveAllButtonDisabled: {
    backgroundColor: NB.bg,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveAllButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: NB.surface,
    borderBottomWidth: 3,
    borderBottomColor: NB.border,
    gap: 12,
  },
  searchLocationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NB.bg,
    borderWidth: 2,
    borderColor: NB.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: NB.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  searchLocationText: {
    flex: 1,
    fontSize: 14,
    color: NB.border,
    fontWeight: '700',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NB.accent,
    borderWidth: 2,
    borderColor: NB.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
    shadowColor: NB.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  currentLocationText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  resultsHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: NB.border,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsSubtitle: {
    fontSize: 13,
    color: NB.muted,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  centerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: NB.border,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  centerSubtitle: {
    fontSize: 14,
    color: NB.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: NB.primary,
    borderWidth: 2,
    borderColor: NB.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyStateActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  searchButtonEmpty: {
    backgroundColor: NB.accent,
    borderWidth: 2,
    borderColor: NB.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: NB.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  searchButtonEmptyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
