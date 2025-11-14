'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useFirePersonnelAuthStore } from '@/lib/stores/firePersonnelAuth';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import { 
  Building2, 
  MapPin,
  Phone,
  Search,
  Navigation,
  Flag,
  Droplets,
  Shield,
  Hospital,
  Car,
  School,
  ShoppingBag,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';

interface JurisdictionPlace {
  id: string;
  name: string;
  address: string;
  coordinates: string;
  lat?: number;
  lng?: number;
  type: 'Commercial' | 'Residential' | 'Industrial' | 'Public' | 'Educational' | 'Other';
  distance: string; // Distance from station
  notes?: string;
}

interface PlaceOfImportance {
  id: string;
  name: string;
  location: string;
  coordinates: string;
  lat?: number;
  lng?: number;
  type: 'Hospital' | 'School' | 'Government' | 'Market' | 'Monument' | 'Park' | 'Other';
  description: string;
  distance: string;
  contact?: string;
}

interface SisterService {
  id: string;
  name: string;
  type: 'Fire Station' | 'Police Station' | 'Hospital' | 'Ambulance Service' | 'Military';
  location: string;
  coordinates: string;
  lat?: number;
  lng?: number;
  distance: string;
  phone?: string;
  contact?: string;
}

interface HydrantLocation {
  id: string;
  number: string;
  location: string;
  coordinates: string;
  lat?: number;
  lng?: number;
  type: 'Underground' | 'Above Ground' | 'Wall Mounted';
  status: 'Operational' | 'Under Maintenance' | 'Out of Service';
  waterPressure: string;
  distance: string;
  lastInspection: string;
  nextInspection: string;
}

const StationOutlookPage: React.FC = () => {
  const { user } = useFirePersonnelAuthStore();
  const stations = useStationsStore(selectStations);
  const fetchStations = useStationsStore((state) => state.fetchStations);
  const isLoadingStations = useStationsStore((state) => state.isLoading);
  
  const [activeTab, setActiveTab] = useState<'jurisdiction' | 'importance' | 'services' | 'hydrants'>('jurisdiction');
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // State for storing places data
  const [jurisdictionPlacesState, setJurisdictionPlacesState] = useState<JurisdictionPlace[]>([]);
  const [placesOfImportanceState, setPlacesOfImportanceState] = useState<PlaceOfImportance[]>([]);
  const [sisterServicesState, setSisterServicesState] = useState<SisterService[]>([]);
  const [hydrantLocationsState, setHydrantLocationsState] = useState<HydrantLocation[]>([]);

  // Form state
  const [formData, setFormData] = useState<any>({});

  const stationId = user?.stationId;

  useEffect(() => {
    fetchStations().catch((err) => {
      console.error('Failed to fetch stations:', err);
    });
  }, [fetchStations]);

  const currentStation = useMemo(() => {
    if (!stationId) return null;
    return stations.find(s => {
      const sId = typeof s._id === 'string' ? s._id : s.id;
      return sId === stationId || s.id === stationId;
    });
  }, [stations, stationId]);

  // Load data from localStorage on mount
  useEffect(() => {
    if (!stationId) return;
    const storageKey = `station-outlook-${stationId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.jurisdiction) setJurisdictionPlacesState(data.jurisdiction);
        if (data.importance) setPlacesOfImportanceState(data.importance);
        if (data.services) setSisterServicesState(data.services);
        if (data.hydrants) setHydrantLocationsState(data.hydrants);
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, [stationId]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!stationId) return;
    const storageKey = `station-outlook-${stationId}`;
    const data = {
      jurisdiction: jurisdictionPlacesState,
      importance: placesOfImportanceState,
      services: sisterServicesState,
      hydrants: hydrantLocationsState,
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [stationId, jurisdictionPlacesState, placesOfImportanceState, sisterServicesState, hydrantLocationsState]);

  // Generate dummy data based on station coordinates
  const generateJurisdictionPlaces = (): JurisdictionPlace[] => {
    if (!currentStation?.lat || !currentStation?.lng) {
      // Default coordinates for Accra if station doesn't have coordinates
      return [
        {
          id: '1',
          name: 'Central Business District',
          address: 'Makola Road, Accra',
          coordinates: '5.5500°N, 0.2000°W',
          lat: 5.5500,
          lng: -0.2000,
          type: 'Commercial',
          distance: '0.5 km',
          notes: 'Main commercial area',
        },
        {
          id: '2',
          name: 'Residential Complex',
          address: 'Kumasi Road, Accra',
          coordinates: '5.5550°N, 0.2050°W',
          lat: 5.5550,
          lng: -0.2050,
          type: 'Residential',
          distance: '1.2 km',
          notes: 'High-density residential area',
        },
        {
          id: '3',
          name: 'Industrial Zone',
          address: 'Kaneshie Road, Accra',
          coordinates: '5.5700°N, 0.2150°W',
          lat: 5.5700,
          lng: -0.2150,
          type: 'Industrial',
          distance: '2.5 km',
          notes: 'Manufacturing and warehouses',
        },
        {
          id: '4',
          name: 'University Campus',
          address: 'Legon, Accra',
          coordinates: '5.6500°N, -0.1867°W',
          lat: 5.6500,
          lng: -0.1867,
          type: 'Educational',
          distance: '3.8 km',
          notes: 'University of Ghana',
        },
        {
          id: '5',
          name: 'Public Square',
          address: 'Independence Square, Accra',
          coordinates: '5.5450°N, 0.1950°W',
          lat: 5.5450,
          lng: -0.1950,
          type: 'Public',
          distance: '0.8 km',
          notes: 'Large public events venue',
        },
      ];
    }
    
    // Generate places based on station coordinates (dummy data)
    const baseLat = currentStation.lat;
    const baseLng = currentStation.lng;
    
    return [
      {
        id: '1',
        name: 'Commercial District',
        address: 'Near Station',
        coordinates: `${(baseLat + 0.001).toFixed(4)}°N, ${(baseLng + 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.001,
        lng: baseLng + 0.001,
        type: 'Commercial',
        distance: '0.5 km',
        notes: 'Main commercial area',
      },
      {
        id: '2',
        name: 'Residential Area',
        address: 'Near Station',
        coordinates: `${(baseLat + 0.002).toFixed(4)}°N, ${(baseLng - 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.002,
        lng: baseLng - 0.001,
        type: 'Residential',
        distance: '1.2 km',
        notes: 'Residential community',
      },
      {
        id: '3',
        name: 'Industrial Zone',
        address: 'Near Station',
        coordinates: `${(baseLat - 0.003).toFixed(4)}°N, ${(baseLng + 0.002).toFixed(4)}°W`,
        lat: baseLat - 0.003,
        lng: baseLng + 0.002,
        type: 'Industrial',
        distance: '2.5 km',
        notes: 'Industrial facilities',
      },
    ];
  };

  const generatePlacesOfImportance = (): PlaceOfImportance[] => {
    if (!currentStation?.lat || !currentStation?.lng) {
      return [
        {
          id: '1',
          name: 'Korle Bu Teaching Hospital',
          location: 'Korle Bu, Accra',
          coordinates: '5.5400°N, 0.1900°W',
          lat: 5.5400,
          lng: -0.1900,
          type: 'Hospital',
          description: 'Major teaching hospital',
          distance: '1.5 km',
          contact: '+233302665401',
        },
        {
          id: '2',
          name: 'University of Ghana',
          location: 'Legon, Accra',
          coordinates: '5.6500°N, -0.1867°W',
          lat: 5.6500,
          lng: -0.1867,
          type: 'School',
          description: 'Premier university',
          distance: '3.8 km',
          contact: '+233302213650',
        },
        {
          id: '3',
          name: 'Independence Square',
          location: '28th February Road, Accra',
          coordinates: '5.5450°N, 0.1950°W',
          lat: 5.5450,
          lng: -0.1950,
          type: 'Monument',
          description: 'National monument',
          distance: '0.8 km',
        },
        {
          id: '4',
          name: 'Makola Market',
          location: 'Makola Road, Accra',
          coordinates: '5.5500°N, 0.2000°W',
          lat: 5.5500,
          lng: -0.2000,
          type: 'Market',
          description: 'Major market hub',
          distance: '0.5 km',
        },
      ];
    }
    
    const baseLat = currentStation.lat;
    const baseLng = currentStation.lng;
    
    return [
      {
        id: '1',
        name: 'Regional Hospital',
        location: 'Near Station',
        coordinates: `${(baseLat + 0.002).toFixed(4)}°N, ${(baseLng + 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.002,
        lng: baseLng + 0.001,
        type: 'Hospital',
        description: 'Major hospital facility',
        distance: '1.2 km',
        contact: '+233302123456',
      },
      {
        id: '2',
        name: 'Central School',
        location: 'Near Station',
        coordinates: `${(baseLat - 0.001).toFixed(4)}°N, ${(baseLng + 0.002).toFixed(4)}°W`,
        lat: baseLat - 0.001,
        lng: baseLng + 0.002,
        type: 'School',
        description: 'Primary and secondary school',
        distance: '0.8 km',
        contact: '+233302123457',
      },
    ];
  };

  const generateSisterServices = (): SisterService[] => {
    if (!currentStation?.lat || !currentStation?.lng) {
      return [
        {
          id: '1',
          name: 'Accra Central Police Station',
          type: 'Police Station',
          location: 'Central Business District, Accra',
          coordinates: '5.5500°N, 0.2000°W',
          lat: 5.5500,
          lng: -0.2000,
          distance: '0.3 km',
          phone: '+233302123456',
        },
        {
          id: '2',
          name: '37 Military Hospital',
          type: 'Hospital',
          location: '37, Accra',
          coordinates: '5.6000°N, -0.1800°W',
          lat: 5.6000,
          lng: -0.1800,
          distance: '4.2 km',
          phone: '+233302665401',
        },
        {
          id: '3',
          name: 'Accra City Fire Station',
          type: 'Fire Station',
          location: 'Kojo Thompson Road, Accra',
          coordinates: '5.5550°N, 0.2050°W',
          lat: 5.5550,
          lng: -0.2050,
          distance: '1.5 km',
          phone: '+233302123458',
        },
        {
          id: '4',
          name: 'National Ambulance Service',
          type: 'Ambulance Service',
          location: 'Accra',
          coordinates: '5.5450°N, 0.1950°W',
          lat: 5.5450,
          lng: -0.1950,
          distance: '0.8 km',
          phone: '+233302123459',
        },
      ];
    }
    
    const baseLat = currentStation.lat;
    const baseLng = currentStation.lng;
    
    return [
      {
        id: '1',
        name: 'Nearby Police Station',
        type: 'Police Station',
        location: 'Near Station',
        coordinates: `${(baseLat + 0.001).toFixed(4)}°N, ${(baseLng + 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.001,
        lng: baseLng + 0.001,
        distance: '0.5 km',
        phone: '+233302123456',
      },
      {
        id: '2',
        name: 'Regional Hospital',
        type: 'Hospital',
        location: 'Near Station',
        coordinates: `${(baseLat + 0.003).toFixed(4)}°N, ${(baseLng - 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.003,
        lng: baseLng - 0.001,
        distance: '1.8 km',
        phone: '+233302123457',
      },
    ];
  };

  const generateHydrantLocations = (): HydrantLocation[] => {
    if (!currentStation?.lat || !currentStation?.lng) {
      return [
        {
          id: '1',
          number: 'FH-ACC-001',
          location: 'Makola Road, Accra Central Market',
          coordinates: '5.5500°N, 0.2000°W',
          lat: 5.5500,
          lng: -0.2000,
          type: 'Above Ground',
          status: 'Operational',
          waterPressure: '65 PSI',
          distance: '0.5 km',
          lastInspection: '2024-01-15',
          nextInspection: '2024-04-15',
        },
        {
          id: '2',
          number: 'FH-ACC-002',
          location: 'Kumasi Road, Near Residential Complex',
          coordinates: '5.5550°N, 0.2050°W',
          lat: 5.5550,
          lng: -0.2050,
          type: 'Underground',
          status: 'Operational',
          waterPressure: '70 PSI',
          distance: '1.2 km',
          lastInspection: '2024-01-20',
          nextInspection: '2024-04-20',
        },
        {
          id: '3',
          number: 'FH-ACC-003',
          location: 'Independence Square, North Side',
          coordinates: '5.5450°N, 0.1950°W',
          lat: 5.5450,
          lng: -0.1950,
          type: 'Wall Mounted',
          status: 'Operational',
          waterPressure: '60 PSI',
          distance: '0.8 km',
          lastInspection: '2024-01-10',
          nextInspection: '2024-04-10',
        },
        {
          id: '4',
          number: 'FH-ACC-004',
          location: 'Barnes Road, Accra Technical University',
          coordinates: '5.5600°N, 0.2100°W',
          lat: 5.5600,
          lng: -0.2100,
          type: 'Above Ground',
          status: 'Under Maintenance',
          waterPressure: '55 PSI',
          distance: '2.1 km',
          lastInspection: '2024-01-08',
          nextInspection: '2024-04-08',
        },
      ];
    }
    
    const baseLat = currentStation.lat;
    const baseLng = currentStation.lng;
    
    return [
      {
        id: '1',
        number: 'FH-001',
        location: 'Near Station - Main Road',
        coordinates: `${(baseLat + 0.001).toFixed(4)}°N, ${(baseLng + 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.001,
        lng: baseLng + 0.001,
        type: 'Above Ground',
        status: 'Operational',
        waterPressure: '65 PSI',
        distance: '0.3 km',
        lastInspection: '2024-01-15',
        nextInspection: '2024-04-15',
      },
      {
        id: '2',
        number: 'FH-002',
        location: 'Near Station - Residential Area',
        coordinates: `${(baseLat + 0.002).toFixed(4)}°N, ${(baseLng - 0.001).toFixed(4)}°W`,
        lat: baseLat + 0.002,
        lng: baseLng - 0.001,
        type: 'Underground',
        status: 'Operational',
        waterPressure: '70 PSI',
        distance: '0.8 km',
        lastInspection: '2024-01-20',
        nextInspection: '2024-04-20',
      },
    ];
  };

  // Use saved data if available, otherwise use generated data
  const jurisdictionPlaces = useMemo(() => {
    if (jurisdictionPlacesState.length > 0) return jurisdictionPlacesState;
    return generateJurisdictionPlaces();
  }, [currentStation, jurisdictionPlacesState]);

  const placesOfImportance = useMemo(() => {
    if (placesOfImportanceState.length > 0) return placesOfImportanceState;
    return generatePlacesOfImportance();
  }, [currentStation, placesOfImportanceState]);

  const sisterServices = useMemo(() => {
    if (sisterServicesState.length > 0) return sisterServicesState;
    return generateSisterServices();
  }, [currentStation, sisterServicesState]);

  const hydrantLocations = useMemo(() => {
    if (hydrantLocationsState.length > 0) return hydrantLocationsState;
    return generateHydrantLocations();
  }, [currentStation, hydrantLocationsState]);

  // CRUD Functions
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setShowAddModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    switch (activeTab) {
      case 'jurisdiction':
        setJurisdictionPlacesState(prev => prev.filter(p => p.id !== id));
        break;
      case 'importance':
        setPlacesOfImportanceState(prev => prev.filter(p => p.id !== id));
        break;
      case 'services':
        setSisterServicesState(prev => prev.filter(p => p.id !== id));
        break;
      case 'hydrants':
        setHydrantLocationsState(prev => prev.filter(p => p.id !== id));
        break;
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newId = editingItem?.id || `item-${Date.now()}`;
    
    switch (activeTab) {
      case 'jurisdiction': {
        const newItem: JurisdictionPlace = {
          id: newId,
          name: formData.name || '',
          address: formData.address || '',
          coordinates: formData.coordinates || '',
          lat: formData.lat ? parseFloat(formData.lat) : undefined,
          lng: formData.lng ? parseFloat(formData.lng) : undefined,
          type: formData.type || 'Other',
          distance: formData.distance || '',
          notes: formData.notes || '',
        };
        if (editingItem) {
          setJurisdictionPlacesState(prev => prev.map(p => p.id === editingItem.id ? newItem : p));
        } else {
          setJurisdictionPlacesState(prev => [...prev, newItem]);
        }
        break;
      }
      case 'importance': {
        const newItem: PlaceOfImportance = {
          id: newId,
          name: formData.name || '',
          location: formData.location || '',
          coordinates: formData.coordinates || '',
          lat: formData.lat ? parseFloat(formData.lat) : undefined,
          lng: formData.lng ? parseFloat(formData.lng) : undefined,
          type: formData.type || 'Other',
          description: formData.description || '',
          distance: formData.distance || '',
          contact: formData.contact || '',
        };
        if (editingItem) {
          setPlacesOfImportanceState(prev => prev.map(p => p.id === editingItem.id ? newItem : p));
        } else {
          setPlacesOfImportanceState(prev => [...prev, newItem]);
        }
        break;
      }
      case 'services': {
        const newItem: SisterService = {
          id: newId,
          name: formData.name || '',
          type: formData.type || 'Fire Station',
          location: formData.location || '',
          coordinates: formData.coordinates || '',
          lat: formData.lat ? parseFloat(formData.lat) : undefined,
          lng: formData.lng ? parseFloat(formData.lng) : undefined,
          distance: formData.distance || '',
          phone: formData.phone || '',
          contact: formData.contact || '',
        };
        if (editingItem) {
          setSisterServicesState(prev => prev.map(p => p.id === editingItem.id ? newItem : p));
        } else {
          setSisterServicesState(prev => [...prev, newItem]);
        }
        break;
      }
      case 'hydrants': {
        const newItem: HydrantLocation = {
          id: newId,
          number: formData.number || '',
          location: formData.location || '',
          coordinates: formData.coordinates || '',
          lat: formData.lat ? parseFloat(formData.lat) : undefined,
          lng: formData.lng ? parseFloat(formData.lng) : undefined,
          type: formData.type || 'Above Ground',
          status: formData.status || 'Operational',
          waterPressure: formData.waterPressure || '',
          distance: formData.distance || '',
          lastInspection: formData.lastInspection || '',
          nextInspection: formData.nextInspection || '',
        };
        if (editingItem) {
          setHydrantLocationsState(prev => prev.map(p => p.id === editingItem.id ? newItem : p));
        } else {
          setHydrantLocationsState(prev => [...prev, newItem]);
        }
        break;
      }
    }
    
    handleCloseModal();
  };

  // Filter data based on active tab and search
  const filteredData = useMemo(() => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'jurisdiction':
        data = jurisdictionPlaces;
        break;
      case 'importance':
        data = placesOfImportance;
        break;
      case 'services':
        data = sisterServices;
        break;
      case 'hydrants':
        data = hydrantLocations;
        break;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter(item =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower) ||
        item.address?.toLowerCase().includes(searchLower) ||
        item.coordinates?.toLowerCase().includes(searchLower)
      );
    }

    return data;
  }, [activeTab, searchTerm, jurisdictionPlaces, placesOfImportance, sisterServices, hydrantLocations]);

  // Get Google Maps URL for a location
  const getGoogleMapsUrl = (lat?: number, lng?: number, coordinates?: string) => {
    if (lat && lng) {
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    if (coordinates) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`;
    }
    return null;
  };

  // Table columns for Jurisdiction
  const jurisdictionColumns: ColumnDef<JurisdictionPlace>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => <span>{row.original.address}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const typeColors: Record<string, string> = {
          Commercial: 'bg-blue-100 text-blue-800',
          Residential: 'bg-green-100 text-green-800',
          Industrial: 'bg-orange-100 text-orange-800',
          Public: 'bg-purple-100 text-purple-800',
          Educational: 'bg-yellow-100 text-yellow-800',
          Other: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[row.original.type] || typeColors.Other}`}>
            {row.original.type}
          </span>
        );
      },
    },
    {
      accessorKey: 'distance',
      header: 'Distance',
      cell: ({ row }) => <span>{row.original.distance}</span>,
    },
    {
      accessorKey: 'coordinates',
      header: 'Coordinates',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{row.original.coordinates}</span>
          {getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) && (
            <a
              href={getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ),
    },
  ];

  // Table columns for Places of Importance
  const importanceColumns: ColumnDef<PlaceOfImportance>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-yellow-500" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const typeIcons: Record<string, any> = {
          Hospital: Hospital,
          School: School,
          Government: Building2,
          Market: ShoppingBag,
          Monument: Flag,
          Park: MapPin,
          Other: MapPin,
        };
        const Icon = typeIcons[row.original.type] || MapPin;
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400" />
            <span>{row.original.type}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <span>{row.original.location}</span>,
    },
    {
      accessorKey: 'distance',
      header: 'Distance',
      cell: ({ row }) => <span>{row.original.distance}</span>,
    },
    {
      accessorKey: 'coordinates',
      header: 'Coordinates',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{row.original.coordinates}</span>
          {getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) && (
            <a
              href={getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Table columns for Sister Services
  const servicesColumns: ColumnDef<SisterService>[] = [
    {
      accessorKey: 'name',
      header: 'Service Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.type === 'Fire Station' && <Building2 className="w-4 h-4 text-red-500" />}
          {row.original.type === 'Police Station' && <Shield className="w-4 h-4 text-blue-500" />}
          {row.original.type === 'Hospital' && <Hospital className="w-4 h-4 text-green-500" />}
          {row.original.type === 'Ambulance Service' && <Car className="w-4 h-4 text-yellow-500" />}
          {row.original.type === 'Military' && <Shield className="w-4 h-4 text-gray-500" />}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <span>{row.original.location}</span>,
    },
    {
      accessorKey: 'distance',
      header: 'Distance',
      cell: ({ row }) => <span>{row.original.distance}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.phone && <Phone className="w-4 h-4 text-gray-400" />}
          <span>{row.original.phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'coordinates',
      header: 'Coordinates',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{row.original.coordinates}</span>
          {getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) && (
            <a
              href={getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Table columns for Hydrants
  const hydrantsColumns: ColumnDef<HydrantLocation>[] = [
    {
      accessorKey: 'number',
      header: 'Hydrant #',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span className="font-medium">{row.original.number}</span>
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <span>{row.original.location}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusColors: Record<string, string> = {
          Operational: 'bg-green-100 text-green-800',
          'Under Maintenance': 'bg-yellow-100 text-yellow-800',
          'Out of Service': 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[row.original.status] || statusColors.Operational}`}>
            {row.original.status}
          </span>
        );
      },
    },
    {
      accessorKey: 'distance',
      header: 'Distance',
      cell: ({ row }) => <span>{row.original.distance}</span>,
    },
    {
      accessorKey: 'coordinates',
      header: 'Coordinates',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{row.original.coordinates}</span>
          {getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) && (
            <a
              href={getGoogleMapsUrl(row.original.lat, row.original.lng, row.original.coordinates) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Get columns based on active tab
  const getColumns = () => {
    switch (activeTab) {
      case 'jurisdiction':
        return jurisdictionColumns;
      case 'importance':
        return importanceColumns;
      case 'services':
        return servicesColumns;
      case 'hydrants':
        return hydrantsColumns;
      default:
        return jurisdictionColumns;
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns: getColumns(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  if (isLoadingStations) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Loading station information...</p>
      </div>
    );
  }

  if (!currentStation) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Station information not available</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Station Outlook</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{currentStation.name || 'Station Information'}</p>
        </div>
        {currentStation.lat && currentStation.lng && (
          <a
            href={`https://www.google.com/maps?q=${currentStation.lat},${currentStation.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
          >
            <Navigation className="w-4 h-4" />
            View on Google Maps
          </a>
        )}
      </div>

      {/* Tabs and Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 p-4">
            <button
              onClick={() => setActiveTab('jurisdiction')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'jurisdiction'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Jurisdiction/Places
            </button>
            <button
              onClick={() => setActiveTab('importance')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'importance'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Places of Importance
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'services'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Nearby Sister Services
            </button>
            <button
              onClick={() => setActiveTab('hydrants')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'hydrants'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Hydrant Locations
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'jurisdiction' ? 'places' : activeTab === 'importance' ? 'places of importance' : activeTab === 'services' ? 'services' : 'hydrants'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={getColumns().length} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingItem ? 'Edit' : 'Add New'} {activeTab === 'jurisdiction' ? 'Place' : activeTab === 'importance' ? 'Place of Importance' : activeTab === 'services' ? 'Sister Service' : 'Hydrant'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'jurisdiction' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                        <select
                          value={formData.type || 'Other'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Commercial">Commercial</option>
                          <option value="Residential">Residential</option>
                          <option value="Industrial">Industrial</option>
                          <option value="Public">Public</option>
                          <option value="Educational">Educational</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance</label>
                        <input
                          type="text"
                          value={formData.distance || ''}
                          onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="e.g. 0.5 km"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lat || ''}
                          onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lng || ''}
                          onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coordinates</label>
                      <input
                        type="text"
                        value={formData.coordinates || ''}
                        onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. 5.5500°N, 0.2000°W"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'importance' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                        <select
                          value={formData.type || 'Other'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Hospital">Hospital</option>
                          <option value="School">School</option>
                          <option value="Government">Government</option>
                          <option value="Market">Market</option>
                          <option value="Monument">Monument</option>
                          <option value="Park">Park</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance</label>
                        <input
                          type="text"
                          value={formData.distance || ''}
                          onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lat || ''}
                          onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lng || ''}
                          onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coordinates</label>
                      <input
                        type="text"
                        value={formData.coordinates || ''}
                        onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact</label>
                      <input
                        type="text"
                        value={formData.contact || ''}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'services' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                        <select
                          value={formData.type || 'Fire Station'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Fire Station">Fire Station</option>
                          <option value="Police Station">Police Station</option>
                          <option value="Hospital">Hospital</option>
                          <option value="Ambulance Service">Ambulance Service</option>
                          <option value="Military">Military</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance</label>
                        <input
                          type="text"
                          value={formData.distance || ''}
                          onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lat || ''}
                          onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lng || ''}
                          onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coordinates</label>
                      <input
                        type="text"
                        value={formData.coordinates || ''}
                        onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                      <input
                        type="text"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'hydrants' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hydrant Number *</label>
                      <input
                        type="text"
                        value={formData.number || ''}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                        <select
                          value={formData.type || 'Above Ground'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Above Ground">Above Ground</option>
                          <option value="Underground">Underground</option>
                          <option value="Wall Mounted">Wall Mounted</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select
                          value={formData.status || 'Operational'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Operational">Operational</option>
                          <option value="Under Maintenance">Under Maintenance</option>
                          <option value="Out of Service">Out of Service</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Water Pressure</label>
                        <input
                          type="text"
                          value={formData.waterPressure || ''}
                          onChange={(e) => setFormData({ ...formData, waterPressure: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="e.g. 65 PSI"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance</label>
                        <input
                          type="text"
                          value={formData.distance || ''}
                          onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Inspection</label>
                        <input
                          type="date"
                          value={formData.lastInspection || ''}
                          onChange={(e) => setFormData({ ...formData, lastInspection: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Inspection</label>
                        <input
                          type="date"
                          value={formData.nextInspection || ''}
                          onChange={(e) => setFormData({ ...formData, nextInspection: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lat || ''}
                          onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lng || ''}
                          onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coordinates</label>
                      <input
                        type="text"
                        value={formData.coordinates || ''}
                        onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    {editingItem ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationOutlookPage;
