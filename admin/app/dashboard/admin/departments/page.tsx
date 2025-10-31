'use client';

import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  deputyHead?: string; // 2IC for department
  contactNumber: string;
  email: string;
  location: string;
  establishedDate: string;
  status: 'Active' | 'Inactive' | 'Under Review';
  personnelCount: number;
  subDivisions: number;
  mfoDfo?: string; // MDFO/DFO
  mfoDfoDeputy?: string; // 2IC for MDFO/DFO
}

// Mock data for departments
const departments: Department[] = [
  {
    id: '1',
    name: 'Fire Suppression',
    code: 'FS',
    description: 'Primary firefighting operations and emergency response',
    headOfDepartment: 'John Doe',
    deputyHead: 'Mary Mensah',
    contactNumber: '+233 24 123 4567',
    email: 'fs@gnfs.gov.gh',
    location: 'Station A1 - Ground Floor',
    establishedDate: '2020-01-15',
    status: 'Active',
    personnelCount: 15,
    subDivisions: 3,
    mfoDfo: 'MDFO: Accra Central',
    mfoDfoDeputy: '2IC: Kwame Boateng'
  },
  {
    id: '2',
    name: 'Emergency Medical Services',
    code: 'EMS',
    description: 'Medical emergency response and ambulance services',
    headOfDepartment: 'Jane Smith',
    deputyHead: 'Esi Agyapong',
    contactNumber: '+233 24 234 5678',
    email: 'ems@gnfs.gov.gh',
    location: 'Station A1 - First Floor',
    establishedDate: '2020-02-20',
    status: 'Active',
    personnelCount: 12,
    subDivisions: 2,
    mfoDfo: 'DFO: Accra Central',
    mfoDfoDeputy: '2IC: Akua Ofori'
  },
  {
    id: '3',
    name: 'Rescue Operations',
    code: 'RO',
    description: 'Technical rescue operations and specialized rescue services',
    headOfDepartment: 'Mike Johnson',
    deputyHead: 'Kojo Appiah',
    contactNumber: '+233 24 345 6789',
    email: 'ro@gnfs.gov.gh',
    location: 'Station A1 - Second Floor',
    establishedDate: '2020-03-10',
    status: 'Active',
    personnelCount: 8,
    subDivisions: 2
  },
  {
    id: '4',
    name: 'Prevention & Safety',
    code: 'PS',
    description: 'Fire prevention, safety inspections, and public education',
    headOfDepartment: 'Sarah Wilson',
    deputyHead: 'Nana Akua',
    contactNumber: '+233 24 456 7890',
    email: 'ps@gnfs.gov.gh',
    location: 'Station A1 - Ground Floor',
    establishedDate: '2020-04-05',
    status: 'Active',
    personnelCount: 6,
    subDivisions: 2
  },
  {
    id: '5',
    name: 'Training & Development',
    code: 'TD',
    description: 'Personnel training, skill development, and certification programs',
    headOfDepartment: 'David Brown',
    deputyHead: 'Abena Adjei',
    contactNumber: '+233 24 567 8901',
    email: 'td@gnfs.gov.gh',
    location: 'Station A1 - Third Floor',
    establishedDate: '2020-05-12',
    status: 'Under Review',
    personnelCount: 4,
    subDivisions: 1
  }
];

const DepartmentManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const totalDepartments = departments.length;
  const activeDepartments = departments.filter(dept => dept.status === 'Active').length;

  const columns: ColumnDef<Department>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Department Name',
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-gray-900">{row.getValue('name')}</div>
            <div className="text-sm text-gray-500">{row.original.code}</div>
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="max-w-xs truncate text-gray-700">
            {row.getValue('description')}
          </div>
        ),
      },
      {
        accessorKey: 'headOfDepartment',
        header: 'Head / 2IC',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.getValue('headOfDepartment')}</div>
            <div className="text-xs text-gray-500">2IC: {row.original.deputyHead || '-'}</div>
          </div>
        ),
      },
      {
        accessorKey: 'mfoDfo',
        header: 'MFO/DFO',
        cell: ({ row }) => (
          <div>
            <div className="text-gray-800">{row.original.mfoDfo || '-'}</div>
            <div className="text-xs text-gray-500">2IC: {row.original.mfoDfoDeputy || '-'}</div>
          </div>
        ),
      },
      {
        accessorKey: 'personnelCount',
        header: 'Personnel',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">{row.getValue('personnelCount')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'subDivisions',
        header: 'Sub-Divisions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">{row.getValue('subDivisions')}</span>
          </div>
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
                : status === 'Under Review'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {status}
            </span>
          );
        },
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

  const filteredData = useMemo(() => {
    return departments.filter(dept => {
      const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dept.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || dept.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

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

  const [activeTab, setActiveTab] = useState<'departments' | 'subdivisions'>('departments');

  // Mock sub-divisions (reusing structure from sub-divisions page)
  const subDivisions = [
    { id: '1', name: 'Fire Suppression Unit A', department: 'Fire Suppression', code: 'FSU-A', supervisor: 'John Doe', status: 'Active' },
    { id: '2', name: 'Ambulance Unit', department: 'Emergency Medical Services', code: 'AU', supervisor: 'David Brown', status: 'Active' },
    { id: '3', name: 'Technical Rescue Unit', department: 'Rescue Operations', code: 'TRU', supervisor: 'Mike Johnson', status: 'Active' },
  ];

  const subDivisionsColumns: ColumnDef<any>[] = useMemo(() => ([
    { accessorKey: 'name', header: 'Sub-Division', cell: ({ getValue }) => <div className="font-semibold text-gray-900">{getValue() as string}</div> },
    { accessorKey: 'department', header: 'Department', cell: ({ getValue }) => <div className="text-gray-700">{getValue() as string}</div> },
    { accessorKey: 'code', header: 'Code', cell: ({ getValue }) => <div className="text-gray-600">{getValue() as string}</div> },
    { accessorKey: 'supervisor', header: 'Supervisor', cell: ({ getValue }) => <div className="text-gray-700">{getValue() as string}</div> },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => {
      const status = getValue() as string;
      return <span className={`px-2 py-1 text-xs font-medium rounded-full ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{status}</span>;
    } },
  ]), []);

  const scopedSubDivisions = useMemo(() => {
    return subDivisions.filter(s => filteredData.some(d => d.name === s.department));
  }, [filteredData]);

  const subsTable = useReactTable({
    data: scopedSubDivisions,
    columns: subDivisionsColumns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3">
              Department Management
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage station departments and organizational structure
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
              <span className="text-2xl font-bold text-gray-900">{totalDepartments}</span>
              <p className="text-gray-500 text-sm">Total Departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">Active</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Departments</h3>
            <p className="text-3xl font-bold text-gray-900">{activeDepartments}</p>
            <p className="text-xs text-gray-500">operational</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Personnel</h3>
            <p className="text-3xl font-bold text-gray-900">{departments.reduce((sum, dept) => sum + dept.personnelCount, 0)}</p>
            <p className="text-xs text-gray-500">across departments</p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sub-Divisions</h3>
            <p className="text-3xl font-bold text-gray-900">{departments.reduce((sum, dept) => sum + dept.subDivisions, 0)}</p>
            <p className="text-xs text-gray-500">across departments</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
            <Download className="w-5 h-5" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
            <Plus className="w-5 h-5" />
            Add New Department
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
        <button onClick={() => setActiveTab('departments')} className={`px-6 py-3 text-sm font-bold rounded-xl border-2 transition-all ${activeTab==='departments' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50'}`}>Departments</button>
        <button onClick={() => setActiveTab('subdivisions')} className={`px-6 py-3 text-sm font-bold rounded-xl border-2 transition-all ${activeTab==='subdivisions' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50'}`}>Sub-Divisions</button>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-red-200 rounded-xl">
        <div className="p-6 border-b-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{activeTab === 'departments' ? 'Departments Overview' : 'Sub-Divisions (Scoped to Departments)'}</h3>
              <p className="text-gray-600">{activeTab === 'departments' ? 'Station organizational structure and personnel' : 'Units under the listed departments'}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-2 rounded-lg">
                {activeTab === 'departments' ? <Building2 className="w-5 h-5 text-red-600" /> : <Users className="w-5 h-5 text-red-600" />}
              </div>
              <span className="text-sm text-gray-500">{activeTab === 'departments' ? `${filteredData.length} Departments` : `${scopedSubDivisions.length} Sub-Divisions`}</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              {(activeTab === 'departments' ? table : subsTable).getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
              {(activeTab === 'departments' ? table : subsTable).getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
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
    </div>
  );
};

export default DepartmentManagementPage;
