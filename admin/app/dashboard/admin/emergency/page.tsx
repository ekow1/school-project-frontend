'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  Upload,
  TrendingUp,
  Users,
  Activity,
  Building2,
  X,
  AlertCircle
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
import { Incident, IncidentStatus } from '@/lib/types/incident';
import toast, { Toaster } from 'react-hot-toast';
import { STATION_IDS } from '@/lib/types/station';

// All stations for referral dropdown
const allStations = [
  { id: STATION_IDS.ACCRA_CENTRAL, name: 'Accra Central Fire Station' },
  { id: STATION_IDS.ACCRA_CITY, name: 'Accra City Fire Station' },
  { id: STATION_IDS.ACCRA_REGIONAL_HQ, name: 'Accra Regional Headquarters - GNFS' },
  { id: STATION_IDS.AMAMORLEY, name: 'Amamorley Fire Service Station' },
  { id: STATION_IDS.ANYAA, name: 'Anyaa fire service' },
  { id: STATION_IDS.DANSONAN, name: 'Dansoman Fire station' },
  { id: STATION_IDS.FIRE_ACADEMY, name: 'Fire Academy And Training School' },
  { id: STATION_IDS.ADENTA, name: 'Fire Service - Adenta' },
  { id: STATION_IDS.GHANA_HQ, name: 'GHANA NATIONAL FIRE SERVICE HEADQUARTERS' },
  { id: STATION_IDS.UG_STATION, name: 'Ghana Fire Service (University of Ghana Station)' },
  { id: STATION_IDS.MADINA, name: 'Ghana Fire Service Station - Madina' },
  { id: STATION_IDS.NATIONAL_FIRE_SERVICE, name: 'Ghana National Fire Service' },
  { id: STATION_IDS.MILE_11, name: 'Ghana National Fire Service - Mile 11' },
  { id: STATION_IDS.CIRCLE, name: 'Ghana National Fire Service - Circle' },
  { id: STATION_IDS.AMASAMAN, name: 'Ghana National Fire Service Amasaman' },
  { id: STATION_IDS.MOTORWAY, name: 'Ghana National Fire Service, MOTORWAY Fire Station' },
  { id: STATION_IDS.WEST_MUNICIPAL, name: 'Ghana West Municipal Fire Station' },
  { id: STATION_IDS.TESHIE, name: 'Teshie Fire Service' },
  { id: STATION_IDS.WEIJA, name: 'Weija Fire Station' },
];

// Helper function to capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EmergencyResponsePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'station' | 'general'>('station');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(true);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [referReason, setReferReason] = useState('');
  const [selectedStation, setSelectedStation] = useState('');

  // Current station - in real app, get from auth/user context
  const currentStation = 'Accra Central Fire Station';
  const currentStationId = '69049470ee691673e388de18'; // Accra Central station ID

  // Sample incident data matching API structure - includes incidents for Accra Central and other stations
  const allIncidents: Incident[] = [
    // Accra Central Fire Station incidents
    {
      _id: '6904781bee691673e388ddf1',
      id: '6904781bee691673e388ddf1',
      incidentType: 'fire',
      incidentName: 'Building Fire - Central Business District',
      location: {
        coordinates: {
          latitude: 5.6037,
          longitude: -0.1870,
        },
        locationUrl: 'https://www.google.com/maps?q=5.6037,-0.1870',
        locationName: 'Central Business District, Accra, Greater Accra Region, Ghana',
      },
      station: {
        _id: '69049470ee691673e388de18',
        id: '69049470ee691673e388de18',
        name: 'Accra Central Fire Station',
        location: 'Central Business District, Accra',
        phone_number: '+233302123456',
      },
      userId: {
        _id: '6900c34ad10dd5db82c49ff9',
        id: '6900c34ad10dd5db82c49ff9',
        name: 'John Mensah',
        phone: '+233241234567',
      },
      status: 'on_scene',
      priority: 'critical',
      description: 'Multi-story commercial building fire with heavy smoke and flames visible from 3rd floor',
      estimatedCasualties: 0,
      estimatedDamage: 'major',
      assignedPersonnel: ['P001', 'P002', 'P003'],
      reportedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      responseTimeMinutes: 8,
      __v: 0,
    },
    {
      _id: '6904781bee691673e388ddf2',
      id: '6904781bee691673e388ddf2',
      incidentType: 'medical',
      incidentName: 'Vehicle Accident - Market Circle',
      location: {
        coordinates: {
          latitude: 5.6000,
          longitude: -0.1850,
        },
        locationUrl: 'https://www.google.com/maps?q=5.6000,-0.1850',
        locationName: 'Market Circle, Accra Central, Greater Accra Region, Ghana',
      },
      station: {
        _id: '69049470ee691673e388de18',
        id: '69049470ee691673e388de18',
        name: 'Accra Central Fire Station',
        location: 'Central Business District, Accra',
        phone_number: '+233302123456',
      },
      userId: {
        _id: '6900c34ad10dd5db82c49ff9',
        id: '6900c34ad10dd5db82c49ff9',
        name: 'Ama Serwaa',
        phone: '+233202345678',
      },
      status: 'en_route',
      priority: 'high',
      description: 'Two-vehicle collision with injuries reported, ambulance required',
      estimatedCasualties: 3,
      estimatedDamage: 'moderate',
      assignedPersonnel: ['P004', 'P005'],
      reportedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      responseTimeMinutes: null,
      __v: 0,
    },
    {
      _id: '6904781bee691673e388ddf3',
      id: '6904781bee691673e388ddf3',
      incidentType: 'other',
      incidentName: 'Electrical Fault - Office Complex',
      location: {
        coordinates: {
          latitude: 5.6050,
          longitude: -0.1900,
        },
        locationUrl: 'https://www.google.com/maps?q=5.6050,-0.1900',
        locationName: 'Ridge Road, Accra Central, Greater Accra Region, Ghana',
      },
      station: {
        _id: '69049470ee691673e388de18',
        id: '69049470ee691673e388de18',
        name: 'Accra Central Fire Station',
        location: 'Central Business District, Accra',
        phone_number: '+233302123456',
      },
      userId: {
        _id: '6900c34ad10dd5db82c49ff9',
        id: '6900c34ad10dd5db82c49ff9',
        name: 'Kwame Asante',
        phone: '+233263456789',
      },
      status: 'pending',
      priority: 'medium',
      description: 'Electrical panel smoking in basement of office building, no visible flames',
      estimatedCasualties: 0,
      estimatedDamage: 'minimal',
      assignedPersonnel: [],
      reportedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      responseTimeMinutes: null,
      __v: 0,
    },
    {
      _id: '6904781bee691673e388ddf4',
      id: '6904781bee691673e388ddf4',
      incidentType: 'fire',
      incidentName: 'Residential Fire - Completed',
      location: {
        coordinates: {
          latitude: 5.5980,
          longitude: -0.1820,
        },
        locationUrl: 'https://www.google.com/maps?q=5.5980,-0.1820',
        locationName: 'James Town, Accra Central, Greater Accra Region, Ghana',
      },
      station: {
        _id: '69049470ee691673e388de18',
        id: '69049470ee691673e388de18',
        name: 'Accra Central Fire Station',
        location: 'Central Business District, Accra',
        phone_number: '+233302123456',
      },
      userId: {
        _id: '6900c34ad10dd5db82c49ff9',
        id: '6900c34ad10dd5db82c49ff9',
        name: 'Mary Addo',
        phone: '+233245678901',
      },
      status: 'completed',
      priority: 'high',
      description: 'Kitchen fire in residential apartment, successfully extinguished',
      estimatedCasualties: 0,
      estimatedDamage: 'moderate',
      assignedPersonnel: ['P006', 'P007'],
      reportedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      responseTimeMinutes: 12,
      __v: 0,
    },
    {
      _id: '6904781bee691673e388ddf5',
      id: '6904781bee691673e388ddf5',
      incidentType: 'rescue',
      incidentName: 'Person Trapped - Elevator Malfunction',
      location: {
        coordinates: {
          latitude: 5.6070,
          longitude: -0.1880,
        },
        locationUrl: 'https://www.google.com/maps?q=5.6070,-0.1880',
        locationName: 'High Street, Accra Central, Greater Accra Region, Ghana',
      },
      station: {
        _id: '69049470ee691673e388de18',
        id: '69049470ee691673e388de18',
        name: 'Accra Central Fire Station',
        location: 'Central Business District, Accra',
        phone_number: '+233302123456',
      },
      userId: {
        _id: '6900c34ad10dd5db82c49ff9',
        id: '6900c34ad10dd5db82c49ff9',
        name: 'Robert Quaye',
        phone: '+233205678901',
      },
      status: 'dispatched',
      priority: 'medium',
      description: 'Two people stuck in elevator between floors, maintenance unable to resolve',
      estimatedCasualties: 2,
      estimatedDamage: 'none',
      assignedPersonnel: ['P008'],
      reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      responseTimeMinutes: null,
      __v: 0,
    },
    // Other station incidents (for General Calls tab)
    {
      _id: '6904781bee691673e388ddf0',
      id: '6904781bee691673e388ddf0',
      incidentType: 'other',
      incidentName: 'Light Pole Burning',
      location: {
        coordinates: {
          latitude: 5.7606684,
          longitude: -0.1949533,
        },
        locationUrl: 'https://www.google.com/maps?q=5.7606684,-0.1949533',
        locationName: 'QR63+5VP, Berekuso, Greater Accra Region, Ghana',
      },
      station: {
        _id: '6902474aee691673e388dda8',
        id: '6902474aee691673e388dda8',
        name: 'Ghana Fire Service Station - Madina',
        location: 'Madina',
        lat: 5.6819121,
        lng: -0.172234,
        phone_number: '030 250 1744',
      },
      userId: {
        _id: '6900c34ad10dd5db82c49ff9',
        id: '6900c34ad10dd5db82c49ff9',
        name: 'Enoch Enu',
        phone: '+233552977393',
      },
      status: 'pending',
      priority: 'low',
      description: 'The electricity light pole is on fire at UPSA',
      estimatedCasualties: 0,
      estimatedDamage: 'minimal',
      assignedPersonnel: [],
      reportedAt: '2025-10-31T08:49:31.655Z',
      createdAt: '2025-10-31T08:49:31.656Z',
      updatedAt: '2025-10-31T08:49:31.656Z',
      responseTimeMinutes: null,
      __v: 0,
    },
    {
      _id: '69024df3ee691673e388dddb',
      id: '69024df3ee691673e388dddb',
      incidentType: 'other',
      incidentName: 'Electrical fire',
      location: {
        coordinates: {
          latitude: 5.5729033,
          longitude: -0.2085167,
        },
        locationUrl: 'https://www.google.com/maps?q=5.5729033,-0.2085167',
        locationName: '28, Cola Street, Accra, Greater Accra Region, Ghana',
      },
      station: {
        _id: '69024721ee691673e388dd5f',
        id: '69024721ee691673e388dd5f',
        name: 'GHANA NATIONAL FIRE SERVICE HEADQUARTERS',
        location: 'Accra',
        lat: 5.564904499999999,
        lng: -0.2252025,
        phone_number: '030 277 2446',
      },
      userId: {
        _id: '6900c34ad10dd5db82c49ff9',
        id: '6900c34ad10dd5db82c49ff9',
        name: 'Enoch Enu',
        phone: '+233552977393',
      },
      status: 'pending',
      priority: 'low',
      description: 'Electricity fire',
      estimatedCasualties: 0,
      estimatedDamage: 'minimal',
      assignedPersonnel: [],
      reportedAt: '2025-10-29T17:25:07.453Z',
      createdAt: '2025-10-29T17:25:07.453Z',
      updatedAt: '2025-10-29T17:25:07.453Z',
      responseTimeMinutes: null,
      __v: 0,
    },
    {
      _id: '6902477fee691673e388ddb9',
      id: '6902477fee691673e388ddb9',
      incidentType: 'fire',
      incidentName: 'Fire Emergency',
      location: {
        coordinates: {
          latitude: 5.5728334,
          longitude: -0.2086371,
        },
        locationUrl: 'https://www.google.com/maps?q=5.5728334,-0.2086371',
        locationName: '28, Cola Street, Accra, Greater Accra Region, Ghana',
      },
      station: {
        _id: '69024721ee691673e388dd5f',
        id: '69024721ee691673e388dd5f',
        name: 'GHANA NATIONAL FIRE SERVICE HEADQUARTERS',
        location: 'Accra',
        lat: 5.564904499999999,
        lng: -0.2252025,
        phone_number: '030 277 2446',
      },
      userId: {
        _id: '6900c34ad10dd5db82c49ff9',
        id: '6900c34ad10dd5db82c49ff9',
        name: 'Enoch Enu',
        phone: '+233552977393',
      },
      status: 'pending',
      priority: 'high',
      description: '',
      estimatedCasualties: 0,
      estimatedDamage: 'minimal',
      assignedPersonnel: [],
      reportedAt: '2025-10-29T16:57:35.162Z',
      createdAt: '2025-10-29T16:57:35.163Z',
      updatedAt: '2025-10-29T16:57:35.163Z',
      responseTimeMinutes: null,
      __v: 0,
    },
    {
      _id: '6902457aee691673e388dce6',
      id: '6902457aee691673e388dce6',
      incidentType: 'fire',
      incidentName: 'Fire Emergency',
      location: {
        coordinates: {
          latitude: 5.5728334,
          longitude: -0.2086371,
        },
        locationUrl: 'https://www.google.com/maps?q=5.5728334,-0.2086371',
        locationName: '28, Cola Street, Accra, Greater Accra Region, Ghana',
      },
      station: null,
      userId: {
        _id: '6900c34ad10dd5db82c49ff9',
        id: '6900c34ad10dd5db82c49ff9',
        name: 'Enoch Enu',
        phone: '+233552977393',
      },
      status: 'pending',
      priority: 'high',
      description: '',
      estimatedCasualties: 0,
      estimatedDamage: 'minimal',
      assignedPersonnel: [],
      reportedAt: '2025-10-29T16:48:58.380Z',
      createdAt: '2025-10-29T16:48:58.381Z',
      updatedAt: '2025-10-29T16:48:58.381Z',
      responseTimeMinutes: null,
      __v: 0,
    },
  ];

  // TanStack table columns
  const columns: ColumnDef<Incident>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Call ID',
        cell: ({ row }) => (
          <div className="font-mono text-sm font-semibold text-gray-900">
            #{row.original.id.slice(-8)}
          </div>
        ),
      },
      {
        accessorKey: 'userId.name',
        header: 'Caller',
        cell: ({ row }) => (
          <div className="font-semibold text-gray-900">{row.original.userId.name}</div>
        ),
      },
      {
        accessorKey: 'userId.phone',
        header: 'Phone',
        cell: ({ row }) => (
          <div className="text-gray-600 font-mono text-sm">{row.original.userId.phone}</div>
        ),
      },
      {
        accessorKey: 'location.locationName',
        header: 'Location',
        cell: ({ row }) => (
          <div className="text-gray-600 max-w-xs truncate" title={row.original.location.locationName}>
            {row.original.location.locationName}
          </div>
        ),
      },
      {
        accessorKey: 'incidentType',
        header: 'Type',
        cell: ({ row }) => {
          const type = capitalize(row.original.incidentType);
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              row.original.incidentType === 'fire' ? 'bg-red-100 text-red-800' :
              row.original.incidentType === 'medical' ? 'bg-blue-100 text-blue-800' :
              row.original.incidentType === 'rescue' ? 'bg-green-100 text-green-800' :
              row.original.incidentType === 'flood' ? 'bg-cyan-100 text-cyan-800' :
              row.original.incidentType === 'hazardous' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
          const priority = capitalize(row.original.priority);
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              row.original.priority === 'critical' ? 'bg-red-100 text-red-800' :
              row.original.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              row.original.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              row.original.priority === 'low' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {priority}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = capitalize(row.original.status.replace('_', ' '));
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              row.original.status === 'completed' ? 'bg-green-100 text-green-800' :
              row.original.status === 'on_scene' ? 'bg-blue-100 text-blue-800' :
              row.original.status === 'en_route' ? 'bg-yellow-100 text-yellow-800' :
              row.original.status === 'dispatched' ? 'bg-purple-100 text-purple-800' :
              row.original.status === 'pending' ? 'bg-gray-100 text-gray-800' :
              row.original.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'station.name',
        header: 'Station',
        cell: ({ row }) => (
          <div className="text-gray-600 text-sm">
            {row.original.station?.name || 'Unassigned'}
          </div>
        ),
      },
      {
        accessorKey: 'reportedAt',
        header: 'Reported',
        cell: ({ row }) => (
          <div className="text-gray-600 text-sm">{formatDate(row.original.reportedAt)}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-md">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Filter data based on active tab and filters
  const filteredCalls = useMemo(() => {
    let filtered = allIncidents;

    // Filter by tab
    if (activeTab === 'station') {
      // Only show calls assigned to current station
      filtered = filtered.filter(incident => 
        incident.station?.id === currentStationId || 
        incident.station?.name === currentStation
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      const statusMap: Record<string, string> = {
        'Pending': 'pending',
        'Dispatched': 'dispatched',
        'En route': 'en_route',
        'En Route': 'en_route',
        'On scene': 'on_scene',
        'On Scene': 'on_scene',
        'Completed': 'completed',
        'Cancelled': 'cancelled',
      };
      const statusValue = statusMap[filterStatus] || filterStatus.toLowerCase();
      filtered = filtered.filter(incident => incident.status === statusValue);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(incident => 
        capitalize(incident.priority) === filterPriority
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(incident =>
        incident.incidentName.toLowerCase().includes(searchLower) ||
        incident.userId.name.toLowerCase().includes(searchLower) ||
        incident.location.locationName.toLowerCase().includes(searchLower) ||
        incident.station?.name.toLowerCase().includes(searchLower) ||
        (incident.description || '').toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [activeTab, currentStation, currentStationId, filterStatus, filterPriority, searchTerm]);

  const table = useReactTable({
    data: filteredCalls,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Calculate metrics based on filtered data
  const activeCalls = filteredCalls.filter(incident => 
    ['pending', 'dispatched', 'en_route', 'on_scene'].includes(incident.status)
  ).length;
  const criticalCalls = filteredCalls.filter(incident => incident.priority === 'critical').length;
  const completedCalls = filteredCalls.filter(incident => incident.status === 'completed').length;
  const totalCalls = filteredCalls.length;

  // Find the most critical/urgent incident for emergency alert
  const mostUrgentIncident = useMemo(() => {
    const activeIncidents = allIncidents.filter(incident => 
      ['pending', 'dispatched', 'en_route', 'on_scene'].includes(incident.status)
    );

    if (activeIncidents.length === 0) return null;

    // Sort by priority (critical > high > medium > low) then by status (pending > dispatched > en_route > on_scene)
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const statusOrder: Record<IncidentStatus, number> = { 
      pending: 4, 
      dispatched: 3, 
      en_route: 2, 
      on_scene: 1,
      completed: 0,
      cancelled: 0
    };

    return activeIncidents.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
    })[0];
  }, [allIncidents]);

  // Show emergency alert on page load/reload
  useEffect(() => {
    if (mostUrgentIncident) {
      // Toast notification - show every time page loads/reloads
      const timer = setTimeout(() => {
        toast(
          (t) => (
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-600">EMERGENCY ALERT</span>
              </div>
              <div className="text-sm">
                <p className="font-semibold">{mostUrgentIncident.incidentName}</p>
                <p className="text-gray-600">{mostUrgentIncident.location.locationName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Priority: {capitalize(mostUrgentIncident.priority)} | 
                  Type: {capitalize(mostUrgentIncident.incidentType)}
                </p>
              </div>
            </div>
          ),
          {
            duration: 8000,
            icon: '🚨',
            style: {
              background: '#fff',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              padding: '16px',
              minWidth: '350px',
            },
          }
        );
      }, 500); // Small delay to ensure page is loaded

      return () => clearTimeout(timer);
    }
  }, [mostUrgentIncident]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      {/* Emergency Alert Banner */}
      {showEmergencyAlert && mostUrgentIncident && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-2xl border-4 border-red-800 p-6 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="bg-white/20 p-3 rounded-xl">
                <AlertCircle className="w-8 h-8 text-white animate-bounce" />
              </div>
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl font-black">🚨 EMERGENCY ALERT</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    mostUrgentIncident.priority === 'critical' ? 'bg-red-900 text-white' :
                    mostUrgentIncident.priority === 'high' ? 'bg-orange-600 text-white' :
                    'bg-yellow-500 text-black'
                  }`}>
                    {capitalize(mostUrgentIncident.priority)} Priority
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                    {capitalize(mostUrgentIncident.status.replace('_', ' '))}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-bold">Incident:</span>
                      <span className="font-semibold">{mostUrgentIncident.incidentName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-bold">Caller:</span>
                      <span>{mostUrgentIncident.userId.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      <span className="font-bold">Phone:</span>
                      <a href={`tel:${mostUrgentIncident.userId.phone}`} className="hover:underline">
                        {mostUrgentIncident.userId.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-bold">Location:</span>
                      <span className="text-sm">{mostUrgentIncident.location.locationName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-bold">Coordinates:</span>
                      <span className="text-sm font-mono">
                        {mostUrgentIncident.location.coordinates.latitude.toFixed(6)}, {mostUrgentIncident.location.coordinates.longitude.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      <span className="font-bold">Type:</span>
                      <span className="capitalize">{mostUrgentIncident.incidentType}</span>
                    </div>
                  </div>
                </div>

                {mostUrgentIncident.description && (
                  <div className="bg-white/10 rounded-lg p-3 mb-3">
                    <p className="font-semibold mb-1">Description:</p>
                    <p className="text-sm">{mostUrgentIncident.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <button
                    onClick={() => {
                      toast.success('Incident dispatched successfully!');
                      setShowEmergencyAlert(false);
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Dispatch
                  </button>
                  <button
                    onClick={() => setShowReferModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Building2 className="w-4 h-4" />
                    Refer
                  </button>
                  <button
                    onClick={() => setShowDeclineModal(true)}
                    className="bg-red-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-900 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                  <a
                    href={`tel:${mostUrgentIncident.userId.phone}`}
                    className="bg-white text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call {mostUrgentIncident.userId.name.split(' ')[0]}
                  </a>
                  <div className="text-white/80 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Reported: {formatDate(mostUrgentIncident.reportedAt)}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEmergencyAlert(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Refer Modal */}
      {showReferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                Refer Incident
              </h3>
              <button
                onClick={() => {
                  setShowReferModal(false);
                  setReferReason('');
                  setSelectedStation('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Refer this incident to another station:
              </p>
              <p className="text-sm font-semibold text-gray-900 mb-4">
                {mostUrgentIncident?.incidentName}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Station *
              </label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Choose a station...</option>
                {allStations
                  .filter(station => station.id !== currentStationId)
                  .map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Referral *
              </label>
              <textarea
                value={referReason}
                onChange={(e) => setReferReason(e.target.value)}
                placeholder="Enter reason for referral (e.g., Closer to incident location, Specialized equipment needed, etc.)"
                className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  if (selectedStation && referReason.trim()) {
                    const stationName = allStations.find(s => s.id === selectedStation)?.name || 'Selected Station';
                    toast.success(`Incident referred to ${stationName}. Reason: ${referReason}`);
                    setShowReferModal(false);
                    setShowEmergencyAlert(false);
                    setReferReason('');
                    setSelectedStation('');
                  } else {
                    toast.error('Please select a station and provide a reason');
                  }
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Confirm Referral
              </button>
              <button
                onClick={() => {
                  setShowReferModal(false);
                  setReferReason('');
                  setSelectedStation('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" />
                Decline Incident
              </h3>
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Please provide a reason for declining this incident:
              </p>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                {mostUrgentIncident?.incidentName}
              </p>
            </div>

            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter reason for declining (e.g., Out of coverage area, No available units, etc.)"
              className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none"
              autoFocus
            />

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  if (declineReason.trim()) {
                    toast.success(`Incident declined. Reason: ${declineReason}`);
                    setShowDeclineModal(false);
                    setShowEmergencyAlert(false);
                    setDeclineReason('');
                  } else {
                    toast.error('Please provide a reason for declining');
                  }
                }}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                Confirm Decline
              </button>
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              Emergency Response
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Real-time station emergency call management
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{activeCalls}</span>
              <p className="text-gray-500 text-sm">Active Calls</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+15%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Calls</h3>
            <p className="text-3xl font-bold text-gray-900">{activeCalls}</p>
            <p className="text-xs text-gray-500">currently processing</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-600 font-semibold">{criticalCalls}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Critical</h3>
            <p className="text-3xl font-bold text-gray-900">{criticalCalls}</p>
            <p className="text-xs text-gray-500">urgent calls</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">{completedCalls}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</h3>
            <p className="text-3xl font-bold text-gray-900">{completedCalls}</p>
            <p className="text-xs text-gray-500">resolved today</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-semibold">{totalCalls}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Calls</h3>
            <p className="text-3xl font-bold text-gray-900">{totalCalls}</p>
            <p className="text-xs text-gray-500">received today</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('station')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'station'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
              : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Building2 className="w-5 h-5" />
          Station Calls
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'general'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
              : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Activity className="w-5 h-5" />
          General Calls
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search emergency calls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Dispatched">Dispatched</option>
            <option value="En route">En Route</option>
            <option value="On scene">On Scene</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
          >
            <option value="all">All Priority</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
            <Download className="w-5 h-5" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
            <Plus className="w-5 h-5" />
            New Emergency
          </button>
        </div>
      </div>

      {/* Emergency Calls Table */}
      <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-gradient-to-r from-red-500 to-red-600">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row, index) => (
                <tr key={row.id} className={`hover:bg-red-50 transition-all duration-200 border-b border-gray-100 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default EmergencyResponsePage;
