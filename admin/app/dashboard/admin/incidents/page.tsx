'use client';

import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  FileText,
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
  Eye,
  Calendar,
  Flame,
  Clock3
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

interface IncidentReport {
  id: string;
  incidentNumber: string;
  title: string;
  type: 'Fire' | 'Medical Emergency' | 'Rescue' | 'Hazardous Material' | 'Vehicle Accident' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'Under Review' | 'Approved' | 'Rejected' | 'Closed';
  location: string;
  reportedBy: string;
  assignedTo: string;
  station: string;
  reportedAt: string;
  occurredAt: string;
  description: string;
  casualties: number;
  injuries: number;
  fatalities: number;
  propertyDamage: 'None' | 'Minor' | 'Moderate' | 'Major' | 'Severe';
  responseTime: number; // in minutes
  resolutionTime: number; // in minutes
}

// Mock data - moved outside component to prevent re-creation
const incidentReports: IncidentReport[] = [
    // Recent 24-hour incidents
    {
      id: '1',
      incidentNumber: 'INC-2024-001',
      title: 'Building Fire - Accra Central Market',
      type: 'Fire',
      severity: 'Critical',
      status: 'Approved',
      location: 'Accra Central Market, Accra',
      reportedBy: 'John Doe',
      assignedTo: 'Station Commander A1',
      station: 'Accra Central',
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 - 5 * 60 * 1000).toISOString(),
      description: 'Multi-story building fire with heavy smoke and flames visible from multiple floors',
      casualties: 0,
      injuries: 3,
      fatalities: 0,
      propertyDamage: 'Major',
      responseTime: 8,
      resolutionTime: 120
    },
    {
      id: '2',
      incidentNumber: 'INC-2024-002',
      title: 'Vehicle Accident - Kumasi Road',
      type: 'Vehicle Accident',
      severity: 'High',
      status: 'Under Review',
      location: 'Kumasi Road, Accra',
      reportedBy: 'Jane Smith',
      assignedTo: 'Station Commander B2',
      station: 'Kumasi Central',
      reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      occurredAt: new Date(Date.now() - 4 * 60 * 60 * 1000 - 10 * 60 * 1000).toISOString(),
      description: 'Multi-vehicle collision involving 3 cars with trapped passengers',
      casualties: 2,
      injuries: 5,
      fatalities: 0,
      propertyDamage: 'Moderate',
      responseTime: 12,
      resolutionTime: 90
    },
    {
      id: '3',
      incidentNumber: 'INC-2024-003',
      title: 'Medical Emergency - Residential Building',
      type: 'Medical Emergency',
      severity: 'Medium',
      status: 'Approved',
      location: 'East Legon, Accra',
      reportedBy: 'Mike Johnson',
      assignedTo: 'Station Commander C3',
      station: 'East Legon',
      reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      occurredAt: new Date(Date.now() - 6 * 60 * 60 * 1000 - 15 * 60 * 1000).toISOString(),
      description: 'Elderly person collapsed in apartment building, required immediate medical attention',
      casualties: 0,
      injuries: 1,
      fatalities: 0,
      propertyDamage: 'None',
      responseTime: 15,
      resolutionTime: 45
    },
    {
      id: '4',
      incidentNumber: 'INC-2024-004',
      title: 'House Fire - Tema Community',
      type: 'Fire',
      severity: 'High',
      status: 'Under Review',
      location: 'Tema Community 1, Tema',
      reportedBy: 'Sarah Wilson',
      assignedTo: 'Station Commander D4',
      station: 'Tema Central',
      reportedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      occurredAt: new Date(Date.now() - 8 * 60 * 60 * 1000 - 20 * 60 * 1000).toISOString(),
      description: 'Residential house fire with electrical origin, family evacuated safely',
      casualties: 0,
      injuries: 0,
      fatalities: 0,
      propertyDamage: 'Major',
      responseTime: 10,
      resolutionTime: 180
    },
    {
      id: '5',
      incidentNumber: 'INC-2024-005',
      title: 'Hazardous Material Spill - Industrial Area',
      type: 'Hazardous Material',
      severity: 'Critical',
      status: 'Approved',
      location: 'Industrial Area, Tema',
      reportedBy: 'David Brown',
      assignedTo: 'Station Commander E5',
      station: 'Tema Industrial',
      reportedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      occurredAt: new Date(Date.now() - 12 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
      description: 'Chemical spill at manufacturing facility requiring specialized response',
      casualties: 0,
      injuries: 2,
      fatalities: 0,
      propertyDamage: 'Severe',
      responseTime: 25,
      resolutionTime: 300
    },
    {
      id: '6',
      incidentNumber: 'INC-2024-006',
      title: 'Apartment Fire - Osu District',
      type: 'Fire',
      severity: 'Medium',
      status: 'Approved',
      location: 'Osu District, Accra',
      reportedBy: 'Lisa Davis',
      assignedTo: 'Station Commander F6',
      station: 'Osu Central',
      reportedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
      occurredAt: new Date(Date.now() - 18 * 60 * 60 * 1000 - 25 * 60 * 1000).toISOString(),
      description: 'Kitchen fire in apartment building, quickly contained',
      casualties: 0,
      injuries: 0,
      fatalities: 0,
      propertyDamage: 'Minor',
      responseTime: 7,
      resolutionTime: 60
    },
    // Older incidents (not in 24-hour tab)
    {
      id: '7',
      incidentNumber: 'INC-2024-007',
      title: 'Warehouse Fire - Spintex Road',
      type: 'Fire',
      severity: 'Critical',
      status: 'Approved',
      location: 'Spintex Road, Accra',
      reportedBy: 'Robert Taylor',
      assignedTo: 'Station Commander G7',
      station: 'Spintex Central',
      reportedAt: '2024-02-10 10:30:00',
      occurredAt: '2024-02-10 10:25:00',
      description: 'Large warehouse fire with significant property damage',
      casualties: 0,
      injuries: 4,
      fatalities: 0,
      propertyDamage: 'Severe',
      responseTime: 12,
      resolutionTime: 240
    },
    {
      id: '8',
      incidentNumber: 'INC-2024-008',
      title: 'Rescue Operation - Construction Site',
      type: 'Rescue',
      severity: 'High',
      status: 'Approved',
      location: 'Construction Site, Labadi',
      reportedBy: 'Emma Wilson',
      assignedTo: 'Station Commander H8',
      station: 'Labadi Central',
      reportedAt: '2024-02-08 15:45:00',
      occurredAt: '2024-02-08 15:40:00',
      description: 'Worker trapped in construction accident, successful rescue operation',
      casualties: 0,
      injuries: 1,
      fatalities: 0,
      propertyDamage: 'Moderate',
      responseTime: 18,
      resolutionTime: 120
    },
    {
      id: '9',
      incidentNumber: 'INC-2024-009',
      title: 'Factory Fire - Industrial Zone',
      type: 'Fire',
      severity: 'Critical',
      status: 'Approved',
      location: 'Industrial Zone, Takoradi',
      reportedBy: 'James Anderson',
      assignedTo: 'Station Commander I9',
      station: 'Takoradi Central',
      reportedAt: '2024-02-05 08:20:00',
      occurredAt: '2024-02-05 08:15:00',
      description: 'Factory fire with multiple explosions, extensive damage',
      casualties: 0,
      injuries: 6,
      fatalities: 0,
      propertyDamage: 'Severe',
      responseTime: 20,
      resolutionTime: 360
    },
    {
      id: '10',
      incidentNumber: 'INC-2024-010',
      title: 'Vehicle Fire - Highway',
      type: 'Fire',
      severity: 'Medium',
      status: 'Approved',
      location: 'Accra-Kumasi Highway',
      reportedBy: 'Maria Garcia',
      assignedTo: 'Station Commander J10',
      station: 'Highway Patrol',
      reportedAt: '2024-02-03 14:15:00',
      occurredAt: '2024-02-03 14:10:00',
      description: 'Vehicle fire on highway, traffic disruption',
      casualties: 0,
      injuries: 0,
      fatalities: 0,
      propertyDamage: 'Major',
      responseTime: 15,
      resolutionTime: 90
    }
];

const IncidentReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [activeTab, setActiveTab] = useState<'24hour' | 'fire'>('24hour');

  // TanStack table columns
  const columns: ColumnDef<IncidentReport>[] = useMemo(
    () => [
      {
        accessorKey: 'incidentNumber',
        header: 'Incident #',
        cell: ({ getValue }) => (
          <div className="font-mono text-sm font-semibold text-gray-900">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ getValue }) => (
          <div className="font-semibold text-gray-900 max-w-xs truncate">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              type === 'Fire' ? 'bg-red-100 text-red-800' :
              type === 'Medical Emergency' ? 'bg-blue-100 text-blue-800' :
              type === 'Rescue' ? 'bg-green-100 text-green-800' :
              type === 'Hazardous Material' ? 'bg-yellow-100 text-yellow-800' :
              type === 'Vehicle Accident' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ getValue }) => {
          const severity = getValue() as string;
          return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              severity === 'Critical' ? 'bg-red-100 text-red-800' :
              severity === 'High' ? 'bg-orange-100 text-orange-800' :
              severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              severity === 'Low' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {severity}
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
              status === 'Approved' ? 'bg-green-100 text-green-800' :
              status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
              status === 'Draft' ? 'bg-gray-100 text-gray-800' :
              status === 'Rejected' ? 'bg-red-100 text-red-800' :
              status === 'Closed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ getValue }) => (
          <div className="text-gray-600 max-w-xs truncate">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: 'station',
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
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:shadow-md">
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

  // Filter data based on active tab
  // Current station - in real app, get from auth/user context
  const currentStation = 'Accra Central';

  // Filter data based on active tab and station
  const filteredData = useMemo(() => {
    let filtered = incidentReports.filter(incident => incident.station === currentStation);
    
    if (activeTab === 'fire') {
      filtered = filtered.filter(incident => incident.type === 'Fire');
    } else if (activeTab === '24hour') {
      filtered = filtered.filter(incident => new Date(incident.reportedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000));
    }
    
    return filtered;
  }, [activeTab]);

  const table = useReactTable({
    data: filteredData,
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
  const totalIncidents = filteredData.length;
  const criticalIncidents = filteredData.filter(incident => incident.severity === 'Critical').length;
  const approvedIncidents = filteredData.filter(incident => incident.status === 'Approved').length;
  const underReviewIncidents = filteredData.filter(incident => incident.status === 'Under Review').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              Incident Reports
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Station incident reporting and tracking
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
              <span className="text-2xl font-bold text-gray-900">{totalIncidents}</span>
              <p className="text-gray-500 text-sm">Total Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">+12%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Reports</h3>
            <p className="text-3xl font-bold text-gray-900">{totalIncidents}</p>
            <p className="text-xs text-gray-500">this month</p>
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
                <span className="text-xs text-red-600 font-semibold">{criticalIncidents}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Critical</h3>
            <p className="text-3xl font-bold text-gray-900">{criticalIncidents}</p>
            <p className="text-xs text-gray-500">high priority</p>
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
                <span className="text-xs text-green-600 font-semibold">{approvedIncidents}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Approved</h3>
            <p className="text-3xl font-bold text-gray-900">{approvedIncidents}</p>
            <p className="text-xs text-gray-500">completed</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-yellow-600 font-semibold">{underReviewIncidents}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Under Review</h3>
            <p className="text-3xl font-bold text-gray-900">{underReviewIncidents}</p>
            <p className="text-xs text-gray-500">pending</p>
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
                placeholder="Search incident reports..."
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
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            >
              <option value="all">All Types</option>
              <option value="Fire">Fire</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Rescue">Rescue</option>
              <option value="Hazardous Material">Hazardous Material</option>
              <option value="Vehicle Accident">Vehicle Accident</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export Reports
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
              <Plus className="w-5 h-5" />
              New Report
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('24hour')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === '24hour'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
              : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Clock3 className="w-5 h-5" />
          24-Hour Reports
        </button>
        <button
          onClick={() => setActiveTab('fire')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'fire'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
              : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Flame className="w-5 h-5" />
          Fire Reports
        </button>
      </div>

      {/* Incident Reports Table */}
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
    </div>
  );
};

export default IncidentReportsPage;



