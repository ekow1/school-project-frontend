'use client';

import React, { useState, useMemo } from 'react';
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
  Activity
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

interface EmergencyCall {
  id: string;
  callerName: string;
  phoneNumber: string;
  location: string;
  emergencyType: 'Fire' | 'Medical' | 'Rescue' | 'Hazardous' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Dispatched' | 'En Route' | 'On Scene' | 'Completed' | 'Cancelled';
  assignedStation: string;
  assignedUnits: string[];
  reportedAt: string;
  dispatchedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  description: string;
}

const EmergencyResponsePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Mock data
  const emergencyCalls: EmergencyCall[] = [
    {
      id: '1',
      callerName: 'John Doe',
      phoneNumber: '+233 24 123 4567',
      location: 'Accra Central Market',
      emergencyType: 'Fire',
      priority: 'Critical',
      status: 'On Scene',
      assignedStation: 'Accra Central',
      assignedUnits: ['Unit A1', 'Unit A2'],
      reportedAt: '2024-02-15 14:30:00',
      dispatchedAt: '2024-02-15 14:32:00',
      arrivedAt: '2024-02-15 14:45:00',
      description: 'Building fire with smoke visible'
    },
    {
      id: '2',
      callerName: 'Jane Smith',
      phoneNumber: '+233 20 234 5678',
      location: 'Kumasi Road, Accra',
      emergencyType: 'Medical',
      priority: 'High',
      status: 'En Route',
      assignedStation: 'Accra Central',
      assignedUnits: ['Unit A3'],
      reportedAt: '2024-02-15 14:45:00',
      dispatchedAt: '2024-02-15 14:47:00',
      description: 'Vehicle accident with injuries'
    },
    {
      id: '3',
      callerName: 'Mike Johnson',
      phoneNumber: '+233 26 345 6789',
      location: 'Tamale Central',
      emergencyType: 'Rescue',
      priority: 'Medium',
      status: 'Dispatched',
      assignedStation: 'Tamale Central',
      assignedUnits: ['Unit T1', 'Unit T2'],
      reportedAt: '2024-02-15 15:00:00',
      dispatchedAt: '2024-02-15 15:02:00',
      description: 'Person trapped in collapsed building'
    },
    {
      id: '4',
      callerName: 'Sarah Wilson',
      phoneNumber: '+233 24 456 7890',
      location: 'Takoradi Harbor',
      emergencyType: 'Hazardous',
      priority: 'Critical',
      status: 'Completed',
      assignedStation: 'Takoradi',
      assignedUnits: ['Unit T1', 'Unit T2', 'Unit T3'],
      reportedAt: '2024-02-15 13:15:00',
      dispatchedAt: '2024-02-15 13:17:00',
      arrivedAt: '2024-02-15 13:30:00',
      completedAt: '2024-02-15 14:45:00',
      description: 'Chemical spill at port facility'
    },
    {
      id: '5',
      callerName: 'David Brown',
      phoneNumber: '+233 20 567 8901',
      location: 'Cape Coast University',
      emergencyType: 'Fire',
      priority: 'High',
      status: 'Pending',
      assignedStation: 'Cape Coast',
      assignedUnits: [],
      reportedAt: '2024-02-15 15:30:00',
      description: 'Laboratory fire with chemical involvement'
    }
  ];

  // TanStack table columns
  const columns: ColumnDef<EmergencyCall>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Call ID',
        cell: ({ getValue }) => (
          <div className="font-mono text-sm font-semibold text-gray-900">#{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'callerName',
        header: 'Caller',
        cell: ({ getValue }) => (
          <div className="font-semibold text-gray-900">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone',
        cell: ({ getValue }) => (
          <div className="text-gray-600 font-mono text-sm">{getValue() as string}</div>
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
        accessorKey: 'emergencyType',
        header: 'Type',
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              type === 'Fire' ? 'bg-red-100 text-red-800' :
              type === 'Medical' ? 'bg-blue-100 text-blue-800' :
              type === 'Rescue' ? 'bg-green-100 text-green-800' :
              type === 'Hazardous' ? 'bg-yellow-100 text-yellow-800' :
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
        cell: ({ getValue }) => {
          const priority = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              priority === 'Critical' ? 'bg-red-100 text-red-800' :
              priority === 'High' ? 'bg-orange-100 text-orange-800' :
              priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              priority === 'Low' ? 'bg-green-100 text-green-800' :
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
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              status === 'Completed' ? 'bg-green-100 text-green-800' :
              status === 'On Scene' ? 'bg-blue-100 text-blue-800' :
              status === 'En Route' ? 'bg-yellow-100 text-yellow-800' :
              status === 'Dispatched' ? 'bg-purple-100 text-purple-800' :
              status === 'Pending' ? 'bg-gray-100 text-gray-800' :
              status === 'Cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'assignedStation',
        header: 'Station',
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'reportedAt',
        header: 'Reported',
        cell: ({ getValue }) => (
          <div className="text-gray-600 text-sm">{getValue() as string}</div>
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
    data: emergencyCalls,
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
  const activeCalls = emergencyCalls.filter(call => ['Pending', 'Dispatched', 'En Route', 'On Scene'].includes(call.status)).length;
  const criticalCalls = emergencyCalls.filter(call => call.priority === 'Critical').length;
  const completedCalls = emergencyCalls.filter(call => call.status === 'Completed').length;
  const totalCalls = emergencyCalls.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">
              Emergency Response
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Real-time emergency call management and dispatch
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

      {/* Controls */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search emergency calls..."
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
              <option value="Pending">Pending</option>
              <option value="Dispatched">Dispatched</option>
              <option value="En Route">En Route</option>
              <option value="On Scene">On Scene</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
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
      </div>

      {/* Emergency Calls Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Emergency Calls</h2>
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

export default EmergencyResponsePage;
