'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  Flame, 
  Ambulance, 
  Car, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Building2,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Shield, 
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { Incident } from '@/lib/types/incident';
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
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data for station-level fire service metrics
const stationMetrics = {
  daily: {
    emergencyCalls: 8,
    responseTime: 6.2,
    incidentsResolved: 7,
    personnelActive: 45,
    stationsOperational: 1
  },
  weekly: {
    emergencyCalls: 52,
    responseTime: 6.8,
    incidentsResolved: 48,
    personnelActive: 45,
    stationsOperational: 1
  },
  monthly: {
    emergencyCalls: 234,
    responseTime: 6.5,
    incidentsResolved: 218,
    personnelActive: 45,
    stationsOperational: 1
  }
};

// Mock data for charts
const emergencyCallsData = [
  { name: 'Mon', calls: 4, resolved: 4 },
  { name: 'Tue', calls: 7, resolved: 6 },
  { name: 'Wed', calls: 5, resolved: 5 },
  { name: 'Thu', calls: 8, resolved: 7 },
  { name: 'Fri', calls: 6, resolved: 6 },
  { name: 'Sat', calls: 9, resolved: 8 },
  { name: 'Sun', calls: 3, resolved: 3 }
];

const incidentTypesData = [
  { name: 'Fire', value: 45, color: '#ef4444' },
  { name: 'Medical', value: 30, color: '#3b82f6' },
  { name: 'Rescue', value: 15, color: '#10b981' },
  { name: 'Hazardous', value: 10, color: '#f59e0b' },
];

const responseTimeData = [
  { name: 'Jan', avgTime: 7.2 },
  { name: 'Feb', avgTime: 6.8 },
  { name: 'Mar', avgTime: 6.5 },
  { name: 'Apr', avgTime: 6.9 },
  { name: 'May', avgTime: 6.3 },
  { name: 'Jun', avgTime: 6.1 },
];

// Mock data for station personnel
const stationPersonnel = [
  {
    id: '1',
    name: 'John Doe',
    rank: 'Station Commander',
    department: 'Operations',
    subDivision: 'Fire Suppression',
    status: 'Active',
    shift: 'Day',
    experience: '15 years',
    certifications: 8
  },
  {
    id: '2',
    name: 'Jane Smith',
    rank: 'Deputy Commander',
    department: 'Emergency Response',
    subDivision: 'Rescue Operations',
    status: 'Active',
    shift: 'Night',
    experience: '12 years',
    certifications: 6
  },
  {
    id: '3',
    name: 'Mike Johnson',
    rank: 'Firefighter',
    department: 'Operations',
    subDivision: 'Fire Suppression',
    status: 'Active',
    shift: 'Day',
    experience: '8 years',
    certifications: 4
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    rank: 'EMT',
    department: 'Emergency Response',
    subDivision: 'Medical Response',
    status: 'Active',
    shift: 'Day',
    experience: '6 years',
    certifications: 5
  },
  {
    id: '5',
    name: 'David Brown',
    rank: 'Firefighter',
    department: 'Operations',
    subDivision: 'Fire Suppression',
    status: 'On Leave',
    shift: 'Night',
    experience: '10 years',
    certifications: 6
  }
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

const AdminDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(true);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [referReason, setReferReason] = useState('');
  const [selectedStation, setSelectedStation] = useState('');

  // Current station - in real app, get from auth/user context
  const currentStationId = '69049470ee691673e388de18'; // Accra Central station ID

  // Sample incident data for Accra Central station
  const allIncidents: Incident[] = [
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
  ];

  // Find the most critical/urgent incident for emergency alert
  const mostUrgentIncident = useMemo(() => {
    const stationIncidents = allIncidents.filter(incident => 
      incident.station?.id === currentStationId
    );
    
    const activeIncidents = stationIncidents.filter(incident => 
      ['pending', 'dispatched', 'en_route', 'on_scene'].includes(incident.status)
    );

    if (activeIncidents.length === 0) return null;

    // Sort by priority (critical > high > medium > low) then by status (pending > dispatched > en_route > on_scene)
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const statusOrder = { pending: 4, dispatched: 3, en_route: 2, on_scene: 1 };

    return activeIncidents.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
    })[0];
  }, [allIncidents, currentStationId]);

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

  const currentMetrics = useMemo(() => {
    return stationMetrics[timeFilter];
  }, [timeFilter]);

  const columns: ColumnDef<typeof stationPersonnel[0]>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="font-semibold text-gray-900">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'rank',
        header: 'Rank',
        cell: ({ row }) => (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            {row.getValue('rank')}
          </span>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => (
          <span className="text-gray-700">{row.getValue('department')}</span>
        ),
      },
      {
        accessorKey: 'subDivision',
        header: 'Sub-Division',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.getValue('subDivision')}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'shift',
        header: 'Shift',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.getValue('shift')}</span>
        ),
      },
      {
        accessorKey: 'experience',
        header: 'Experience',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.getValue('experience')}</span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: stationPersonnel,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="max-w-7xl mx-auto space-y-12 px-6">
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

      {/* Header Section */}
      <div className="flex items-center justify-between">
              <div>
          <h1 className="text-5xl font-black text-gray-900 mb-2">Fire Service Command Center</h1>
          <p className="text-gray-600 text-xl">Welcome back, {user?.name || 'Station Admin'}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-red-600">Accra Central Fire Station</div>
          <div className="text-gray-500 font-medium">Accra Central</div>
              </div>
            </div>

      {/* Time Filter - Right Aligned */}
      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={() => setTimeFilter('daily')}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${
            timeFilter === 'daily'
              ? 'bg-red-600 text-white shadow-lg shadow-red-200'
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-300'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setTimeFilter('weekly')}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${
            timeFilter === 'weekly'
              ? 'bg-red-600 text-white shadow-lg shadow-red-200'
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-300'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setTimeFilter('monthly')}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${
            timeFilter === 'monthly'
              ? 'bg-red-600 text-white shadow-lg shadow-red-200'
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-300'
          }`}
        >
          Monthly
        </button>
          </div>

      {/* Fire Service Metrics */}
              <div>
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Fire Service Metrics</h2>
          <p className="text-gray-600 text-lg">Real-time operational data</p>
              </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Emergency Calls */}
          <div className="bg-gradient-to-br from-white to-red-50 border-2 border-red-200 p-6 rounded-2xl hover:border-red-400 hover:shadow-xl hover:shadow-red-100 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-lg">
                <Phone className="w-6 h-6 text-white" />
            </div>
              <div className="text-right">
                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-bold">+8%</span>
              </div>
            </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Emergency Calls</h3>
              <p className="text-4xl font-black text-gray-900">{currentMetrics.emergencyCalls}</p>
              <p className="text-xs text-gray-400 font-medium">vs last period</p>
          </div>
        </div>

          {/* Response Time */}
          <div className="bg-gradient-to-br from-white to-red-50 border-2 border-red-200 p-6 rounded-2xl hover:border-red-400 hover:shadow-xl hover:shadow-red-100 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-red-700 font-bold">+0.3min</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Avg Response Time</h3>
              <p className="text-4xl font-black text-gray-900">{currentMetrics.responseTime}min</p>
              <p className="text-xs text-gray-400 font-medium">vs last period</p>
              </div>
            </div>

          {/* Incidents Resolved */}
          <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 p-6 rounded-2xl hover:border-green-400 hover:shadow-xl hover:shadow-green-100 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-bold">+5%</span>
              </div>
            </div>
          </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Incidents Resolved</h3>
              <p className="text-4xl font-black text-gray-900">{currentMetrics.incidentsResolved}</p>
              <p className="text-xs text-gray-400 font-medium">vs last period</p>
        </div>
      </div>

          {/* Active Personnel */}
          <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 p-6 rounded-2xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-bold">100%</span>
            </div>
            </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Personnel</h3>
              <p className="text-4xl font-black text-gray-900">{currentMetrics.personnelActive}</p>
              <p className="text-xs text-gray-400 font-medium">station staff</p>
        </div>
      </div>

      {/* Station Status */}
          <div className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 p-6 rounded-2xl hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-bold">Online</span>
              </div>
            </div>
              </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Station Status</h3>
              <p className="text-4xl font-black text-gray-900">{currentMetrics.stationsOperational}</p>
              <p className="text-xs text-gray-400 font-medium">operational</p>
              </div>
            </div>
            </div>
          </div>
          
      {/* Charts Section */}
      <div className="space-y-8">
        <div>
          <h3 className="text-3xl font-black text-gray-900 mb-2">Analytics & Insights</h3>
          <p className="text-gray-600 text-lg">Visual data representation</p>
              </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Calls Trend */}
              <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Emergency Calls Trend</h3>
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={emergencyCallsData}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fill="url(#colorCalls)"
                />
                <Area 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
              </div>

          {/* Incident Types */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Incident Types</h3>
              <PieChart className="w-6 h-6 text-red-600" />
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={incidentTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {incidentTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

      {/* Station Personnel Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black text-gray-900">Station Personnel</h3>
            <p className="text-gray-600 text-lg">Current staff assignments and status</p>
          </div>
          <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border-2 border-red-200">
            <Users className="w-6 h-6 text-red-600" />
            <span className="text-lg font-bold text-gray-900">{stationPersonnel.length} Personnel</span>
        </div>
      </div>

        <div className="overflow-x-auto border-2 border-gray-200 rounded-2xl">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gradient-to-r from-red-500 to-red-600">
                  {headerGroup.headers.map((header) => (
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
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-red-50 transition-all duration-200 border-b border-gray-100">
                  {row.getVisibleCells().map((cell) => (
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

export default AdminDashboard;