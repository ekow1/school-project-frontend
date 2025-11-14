'use client';

import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Users,
  Download,
  AlertTriangle,
  Shield
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

interface Unit {
  id: string;
  name: string;
  color: string;
  department: string;
  groupNames: string[];
  personnelCount: number;
  createdAt?: string;
  updatedAt?: string;
}

const UnitsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    department: '',
    groupNames: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Mock data
  const [units, setUnits] = useState<Unit[]>([
    {
      id: '1',
      name: 'Unit A',
      color: '#FF0000',
      department: 'Fire Suppression',
      groupNames: ['Group 1', 'Group 2'],
      personnelCount: 12,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Unit B',
      color: '#00FF00',
      department: 'Fire Suppression',
      groupNames: ['Group 3'],
      personnelCount: 8,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'Medical Response Unit',
      color: '#0000FF',
      department: 'Emergency Medical Services',
      groupNames: ['AMB-1', 'AMB-2'],
      personnelCount: 15,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]);

  const departments = [
    'Fire Suppression',
    'Emergency Medical Services',
    'Rescue Operations',
    'Prevention & Safety',
    'Training & Development'
  ];

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Unit name is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const groupNamesArray = formData.groupNames.split(',').map(g => g.trim()).filter(g => g);

    if (editingUnit) {
      setUnits(units.map(unit =>
        unit.id === editingUnit.id
          ? {
              ...unit,
              name: formData.name.trim(),
              color: formData.color,
              department: formData.department,
              groupNames: groupNamesArray
            }
          : unit
      ));
    } else {
      const newUnit: Unit = {
        id: (units.length + 1).toString(),
        name: formData.name.trim(),
        color: formData.color,
        department: formData.department,
        groupNames: groupNamesArray,
        personnelCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUnits([...units, newUnit]);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingUnit(null);
    setErrors({});
    setFormData({
      name: '',
      color: '#000000',
      department: '',
      groupNames: ''
    });
  };

  const columns: ColumnDef<Unit>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Unit Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: row.original.color }}>
              <FolderTree className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.name}</div>
              <div className="text-xs text-gray-500">{row.original.department}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'groupNames',
        header: 'Groups',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.groupNames.length > 0 ? (
              row.original.groupNames.map((group, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                  {group}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">No groups</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'personnelCount',
        header: 'Personnel',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-900">{getValue() as number}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingUnit(row.original);
                setFormData({
                  name: row.original.name,
                  color: row.original.color,
                  department: row.original.department,
                  groupNames: row.original.groupNames.join(', ')
                });
                setShowAddModal(true);
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setUnits(units.filter(r => r.id !== row.original.id));
              }}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [units]
  );

  const table = useReactTable({
    data: units,
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

  const filteredData = useMemo(() => {
    if (!searchTerm) return units;
    return units.filter(
      unit =>
        unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, units]);

  const totalUnits = units.length;
  const totalPersonnel = units.reduce((sum, r) => sum + r.personnelCount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <FolderTree className="w-12 h-12 text-blue-600" />
              Unit Management
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage organizational units and personnel assignments
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-blue-200 p-6 rounded-xl hover:border-blue-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FolderTree className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Units</h3>
            <p className="text-3xl font-bold text-gray-900">{totalUnits}</p>
            <p className="text-xs text-gray-500">operational units</p>
          </div>
        </div>

        <div className="bg-white border-2 border-green-200 p-6 rounded-xl hover:border-green-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Personnel</h3>
            <p className="text-3xl font-bold text-gray-900">{totalPersonnel}</p>
            <p className="text-xs text-gray-500">across all units</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-300 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export
            </button>
            <button
              onClick={() => {
                setEditingUnit(null);
                setFormData({
                  name: '',
                  color: '#000000',
                  department: '',
                  groupNames: ''
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-600 rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Unit
            </button>
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <FolderTree className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Unit Directory</h2>
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
              {filteredData.map((unit, index) => (
                <tr key={unit.id} className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}>
                  {table.getRowModel().rows[index]?.getVisibleCells().map(cell => (
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FolderTree className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {editingUnit ? 'Edit Unit' : 'Add New Unit'}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Unit Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: '' });
                    }}
                    placeholder="e.g., Red Watch, Yellow Watch, Blue Watch"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'
                    }`}
                  />
                  {errors.name ? (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1.5">Common examples: Red Watch, Yellow Watch, Blue Watch, Green Watch</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-16 border-2 border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#000000"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:bg-blue-50/30 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => {
                      setFormData({ ...formData, department: e.target.value });
                      setErrors({ ...errors, department: '' });
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.department ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:bg-blue-50/30'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Group Names</label>
                  <input
                    type="text"
                    value={formData.groupNames}
                    onChange={(e) => setFormData({ ...formData, groupNames: e.target.value })}
                    placeholder="e.g., Crew, Watch Room, Dispatch, Emergency (comma separated)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:bg-blue-50/30 focus:outline-none transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Common examples: Crew, Watch Room, Dispatch, Emergency, Admin (comma separated)</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    {editingUnit ? 'Update Unit' : 'Create Unit'}
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

export default UnitsPage;
