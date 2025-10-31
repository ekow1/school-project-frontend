'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone,
  Users,
  MoreVertical,
  Download,
  Upload,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
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

interface Station {
  id: string;
  name: string;
  city: string;
  region: string;
  address: string;
  phone: string;
  personnel: number;
  equipment: number;
  status: 'active' | 'maintenance' | 'offline';
  lastInspection: string;
  createdAt: string;
}

const StationManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Mock data
  const stations: Station[] = [
    {
      id: '1',
      name: 'Accra Central Fire Station',
      city: 'Accra',
      region: 'Greater Accra',
      address: 'Independence Avenue, Accra',
      phone: '+233 30 123 4567',
      personnel: 45,
      equipment: 12,
      status: 'active',
      lastInspection: '2024-02-15',
      createdAt: '2020-01-15'
    },
    {
      id: '2',
      name: 'Kumasi Central Fire Station',
      city: 'Kumasi',
      region: 'Ashanti',
      address: 'Prempeh II Street, Kumasi',
      phone: '+233 32 234 5678',
      personnel: 38,
      equipment: 10,
      status: 'active',
      lastInspection: '2024-02-10',
      createdAt: '2020-03-20'
    },
    {
      id: '3',
      name: 'Tamale Central Fire Station',
      city: 'Tamale',
      region: 'Northern',
      address: 'Central Market Road, Tamale',
      phone: '+233 37 345 6789',
      personnel: 32,
      equipment: 8,
      status: 'maintenance',
      lastInspection: '2024-01-28',
      createdAt: '2020-05-10'
    },
    {
      id: '4',
      name: 'Takoradi Fire Station',
      city: 'Takoradi',
      region: 'Western',
      address: 'Harbor Road, Takoradi',
      phone: '+233 31 456 7890',
      personnel: 28,
      equipment: 7,
      status: 'active',
      lastInspection: '2024-02-12',
      createdAt: '2020-07-15'
    },
    {
      id: '5',
      name: 'Cape Coast Fire Station',
      city: 'Cape Coast',
      region: 'Central',
      address: 'Pedu Road, Cape Coast',
      phone: '+233 33 567 8901',
      personnel: 25,
      equipment: 6,
      status: 'active',
      lastInspection: '2024-02-08',
      createdAt: '2020-09-05'
    },
    {
      id: '6',
      name: 'Sunyani Fire Station',
      city: 'Sunyani',
      region: 'Bono',
      address: 'Airport Road, Sunyani',
      phone: '+233 35 678 9012',
      personnel: 22,
      equipment: 5,
      status: 'offline',
      lastInspection: '2024-01-15',
      createdAt: '2021-01-20'
    },
    {
      id: '7',
      name: 'Ho Fire Station',
      city: 'Ho',
      region: 'Volta',
      address: 'Civic Centre Road, Ho',
      phone: '+233 36 789 0123',
      personnel: 20,
      equipment: 4,
      status: 'active',
      lastInspection: '2024-02-14',
      createdAt: '2021-03-10'
    },
    {
      id: '8',
      name: 'Koforidua Fire Station',
      city: 'Koforidua',
      region: 'Eastern',
      address: 'Ring Road, Koforidua',
      phone: '+233 34 890 1234',
      personnel: 18,
      equipment: 4,
      status: 'active',
      lastInspection: '2024-02-11',
      createdAt: '2021-05-25'
    }
  ];

  // TanStack table columns
  const columns: ColumnDef<Station>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Station Name',
        cell: ({ getValue }) => (
          <div className="font-semibold text-gray-900">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'city',
        header: 'City',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'region',
        header: 'Region',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Contact',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'personnel',
        header: 'Personnel',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as number}</div>
        ),
      },
      {
        accessorKey: 'equipment',
        header: 'Equipment',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as number}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              status === 'active' ? 'bg-green-100 text-green-800' :
              status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
              status === 'offline' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: 'lastInspection',
        header: 'Last Inspection',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
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

  const table = useReactTable({
    data: stations,
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

  // Calculate metrics
  const activeStations = stations.filter(station => station.status === 'active').length;
  const maintenanceStations = stations.filter(station => station.status === 'maintenance').length;
  const totalPersonnel = stations.reduce((sum, station) => sum + station.personnel, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">
              Station Management
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage fire stations, personnel, and equipment
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-sm">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <Building2 className="w-10 h-10 text-red-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{stations.length}</span>
              <p className="text-gray-500 text-sm">Total Stations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+5%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Stations</h3>
            <p className="text-3xl font-bold text-gray-900">{activeStations}</p>
            <p className="text-xs text-gray-500">operational</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-yellow-600 font-semibold">{maintenanceStations}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Maintenance</h3>
            <p className="text-3xl font-bold text-gray-900">{maintenanceStations}</p>
            <p className="text-xs text-gray-500">under repair</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-semibold">100%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Personnel</h3>
            <p className="text-3xl font-bold text-gray-900">{totalPersonnel.toLocaleString()}</p>
            <p className="text-xs text-gray-500">firefighters</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export Data
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
              <Plus className="w-5 h-5" />
              Add New Station
            </button>
          </div>
        </div>
      </div>

      {/* Stations Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Station Directory</h2>
        </div>
        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-wider"
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
                <tr key={row.id} className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
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

export default StationManagementPage;