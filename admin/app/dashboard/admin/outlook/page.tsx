'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Building2,
  Droplets,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Filter,
  Navigation,
  Flag,
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

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: string;
  type: 'Commercial' | 'Residential' | 'Industrial' | 'Public' | 'Educational' | 'Other';
  accessibility: 'Easy' | 'Moderate' | 'Difficult';
  notes: string;
}

interface Landmark {
  id: string;
  name: string;
  location: string;
  coordinates: string;
  type: 'Building' | 'Monument' | 'Park' | 'Water Body' | 'Bridge' | 'Other';
  description: string;
  proximityToStation: string; // Distance in km
}

interface FireHydrant {
  id: string;
  number: string;
  location: string;
  coordinates: string;
  type: 'Underground' | 'Above Ground' | 'Wall Mounted';
  status: 'Operational' | 'Under Maintenance' | 'Out of Service';
  waterPressure: string; // PSI
  lastInspection: string;
  nextInspection: string;
}

// Mock data - Locations
const locations: Location[] = [
  {
    id: '1',
    name: 'Accra Central Market',
    address: 'Makola Road, Accra',
    coordinates: '5.5500°N, 0.2000°W',
    type: 'Commercial',
    accessibility: 'Easy',
    notes: 'Main market area, high foot traffic'
  },
  {
    id: '2',
    name: 'Kumasi Road Residential Complex',
    address: 'Kumasi Road, Accra',
    coordinates: '5.5550°N, 0.2050°W',
    type: 'Residential',
    accessibility: 'Moderate',
    notes: 'Multi-story residential buildings'
  },
  {
    id: '3',
    name: 'Independence Square',
    address: '28th February Road, Accra',
    coordinates: '5.5450°N, 0.1950°W',
    type: 'Public',
    accessibility: 'Easy',
    notes: 'Large public square, events venue'
  },
  {
    id: '4',
    name: 'Accra Technical University',
    address: 'Barnes Road, Accra',
    coordinates: '5.5600°N, 0.2100°W',
    type: 'Educational',
    accessibility: 'Easy',
    notes: 'University campus with multiple buildings'
  },
  {
    id: '5',
    name: 'Kaneshie Industrial Estate',
    address: 'Kaneshie Road, Accra',
    coordinates: '5.5700°N, 0.2150°W',
    type: 'Industrial',
    accessibility: 'Moderate',
    notes: 'Warehouses and manufacturing facilities'
  },
];

// Mock data - Landmarks
const landmarks: Landmark[] = [
  {
    id: '1',
    name: 'Independence Arch',
    location: 'Independence Square, Accra',
    coordinates: '5.5450°N, 0.1950°W',
    type: 'Monument',
    description: 'National monument and symbol of Ghana\'s independence',
    proximityToStation: '2.5 km'
  },
  {
    id: '2',
    name: 'Korle Lagoon',
    location: 'Korle Gonno, Accra',
    coordinates: '5.5350°N, 0.1900°W',
    type: 'Water Body',
    description: 'Large lagoon, important environmental feature',
    proximityToStation: '3.8 km'
  },
  {
    id: '3',
    name: 'Makola Market Tower',
    location: 'Makola Road, Accra',
    coordinates: '5.5500°N, 0.2000°W',
    type: 'Building',
    description: 'Historic market building, landmark structure',
    proximityToStation: '1.2 km'
  },
  {
    id: '4',
    name: 'W.E.B. Du Bois Memorial Centre',
    location: 'Cantonments, Accra',
    coordinates: '5.5800°N, 0.1800°W',
    type: 'Monument',
    description: 'Historic site and memorial center',
    proximityToStation: '5.2 km'
  },
  {
    id: '5',
    name: 'Kokrobite Beach',
    location: 'Kokrobite, Accra',
    coordinates: '5.5200°N, 0.2200°W',
    type: 'Park',
    description: 'Popular beach area with recreational facilities',
    proximityToStation: '12.5 km'
  },
];

// Mock data - Fire Hydrants
const fireHydrants: FireHydrant[] = [
  {
    id: '1',
    number: 'FH-ACC-001',
    location: 'Makola Road, Accra Central Market',
    coordinates: '5.5500°N, 0.2000°W',
    type: 'Above Ground',
    status: 'Operational',
    waterPressure: '65 PSI',
    lastInspection: '2024-01-15',
    nextInspection: '2024-04-15'
  },
  {
    id: '2',
    number: 'FH-ACC-002',
    location: 'Kumasi Road, Near Residential Complex',
    coordinates: '5.5550°N, 0.2050°W',
    type: 'Underground',
    status: 'Operational',
    waterPressure: '70 PSI',
    lastInspection: '2024-01-20',
    nextInspection: '2024-04-20'
  },
  {
    id: '3',
    number: 'FH-ACC-003',
    location: 'Independence Square, North Side',
    coordinates: '5.5450°N, 0.1950°W',
    type: 'Wall Mounted',
    status: 'Operational',
    waterPressure: '60 PSI',
    lastInspection: '2024-01-10',
    nextInspection: '2024-04-10'
  },
  {
    id: '4',
    number: 'FH-ACC-004',
    location: 'Barnes Road, Accra Technical University',
    coordinates: '5.5600°N, 0.2100°W',
    type: 'Above Ground',
    status: 'Under Maintenance',
    waterPressure: '0 PSI',
    lastInspection: '2024-01-05',
    nextInspection: '2024-02-05'
  },
  {
    id: '5',
    number: 'FH-ACC-005',
    location: 'Kaneshie Road, Industrial Estate',
    coordinates: '5.5700°N, 0.2150°W',
    type: 'Underground',
    status: 'Operational',
    waterPressure: '75 PSI',
    lastInspection: '2024-01-25',
    nextInspection: '2024-04-25'
  },
  {
    id: '6',
    number: 'FH-ACC-006',
    location: '28th February Road, Near Circle',
    coordinates: '5.5480°N, 0.1980°W',
    type: 'Above Ground',
    status: 'Out of Service',
    waterPressure: '0 PSI',
    lastInspection: '2023-12-15',
    nextInspection: '2024-02-15'
  },
];

const StationOverviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'locations' | 'landmarks' | 'hydrants'>('locations');
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Location columns
  const locationColumns: ColumnDef<Location>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Location Name',
        cell: ({ getValue }) => (
          <div className="font-semibold text-gray-900">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'address',
        header: 'Address',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'coordinates',
        header: 'Coordinates',
        cell: ({ getValue }) => (
          <div className="font-mono text-sm text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              type === 'Commercial' ? 'bg-blue-100 text-blue-800' :
              type === 'Residential' ? 'bg-green-100 text-green-800' :
              type === 'Industrial' ? 'bg-orange-100 text-orange-800' :
              type === 'Public' ? 'bg-purple-100 text-purple-800' :
              type === 'Educational' ? 'bg-pink-100 text-pink-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: 'accessibility',
        header: 'Accessibility',
        cell: ({ getValue }) => {
          const accessibility = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              accessibility === 'Easy' ? 'bg-green-100 text-green-800' :
              accessibility === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {accessibility}
            </span>
          );
        },
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ getValue }) => (
          <div className="text-gray-600 max-w-xs">{getValue() as string}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: () => (
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Landmark columns
  const landmarkColumns: ColumnDef<Landmark>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Landmark Name',
        cell: ({ getValue }) => (
          <div className="font-semibold text-gray-900">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'coordinates',
        header: 'Coordinates',
        cell: ({ getValue }) => (
          <div className="font-mono text-sm text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              type === 'Monument' ? 'bg-purple-100 text-purple-800' :
              type === 'Building' ? 'bg-blue-100 text-blue-800' :
              type === 'Water Body' ? 'bg-cyan-100 text-cyan-800' :
              type === 'Park' ? 'bg-green-100 text-green-800' :
              type === 'Bridge' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: 'proximityToStation',
        header: 'Distance from Station',
        cell: ({ getValue }) => (
          <div className="text-gray-600 font-medium">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <div className="text-gray-600 max-w-xs">{getValue() as string}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: () => (
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Fire Hydrant columns
  const hydrantColumns: ColumnDef<FireHydrant>[] = useMemo(
    () => [
      {
        accessorKey: 'number',
        header: 'Hydrant Number',
        cell: ({ getValue }) => (
          <div className="font-mono font-semibold text-gray-900">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'coordinates',
        header: 'Coordinates',
        cell: ({ getValue }) => (
          <div className="font-mono text-sm text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              type === 'Above Ground' ? 'bg-green-100 text-green-800' :
              type === 'Underground' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              status === 'Operational' ? 'bg-green-100 text-green-800' :
              status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'waterPressure',
        header: 'Water Pressure',
        cell: ({ getValue }) => (
          <div className="text-gray-600 font-medium">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'lastInspection',
        header: 'Last Inspection',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'nextInspection',
        header: 'Next Inspection',
        cell: ({ getValue }) => (
          <div className="text-gray-600 font-medium">{getValue() as string}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: () => (
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Filter data based on active tab and search
  const filteredLocations = useMemo(() => {
    return locations.filter(loc =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredLandmarks = useMemo(() => {
    return landmarks.filter(landmark =>
      landmark.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      landmark.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredHydrants = useMemo(() => {
    return fireHydrants.filter(hydrant =>
      hydrant.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hydrant.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Create tables based on active tab
  const locationTable = useReactTable({
    data: filteredLocations,
    columns: locationColumns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const landmarkTable = useReactTable({
    data: filteredLandmarks,
    columns: landmarkColumns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const hydrantTable = useReactTable({
    data: filteredHydrants,
    columns: hydrantColumns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Get current table and data count
  const currentTable = activeTab === 'locations' ? locationTable : activeTab === 'landmarks' ? landmarkTable : hydrantTable;
  const currentCount = activeTab === 'locations' ? filteredLocations.length : activeTab === 'landmarks' ? filteredLandmarks.length : filteredHydrants.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              Station Outlook
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              District locations, landmarks, and fire hydrant information
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <MapPin className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{currentCount}</span>
              <p className="text-gray-500 text-sm">
                {activeTab === 'locations' ? 'Locations' : activeTab === 'landmarks' ? 'Landmarks' : 'Fire Hydrants'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'locations'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
              : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Navigation className="w-5 h-5" />
          Locations
        </button>
        <button
          onClick={() => setActiveTab('landmarks')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'landmarks'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
              : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Flag className="w-5 h-5" />
          Landmarks
        </button>
        <button
          onClick={() => setActiveTab('hydrants')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'hydrants'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
              : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Droplets className="w-5 h-5" />
          Fire Hydrants
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
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
            <Download className="w-5 h-5" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
            <Plus className="w-5 h-5" />
            Add {activeTab === 'locations' ? 'Location' : activeTab === 'landmarks' ? 'Landmark' : 'Hydrant'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {currentTable.getHeaderGroups().map(headerGroup => (
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
              {currentTable.getRowModel().rows.map((row, index) => (
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
    </div>
  );
};

export default StationOverviewPage;

