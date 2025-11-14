'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  TrendingUp,
  Users,
  Download,
  AlertTriangle,
  Loader2
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
import { useRolesStore, selectRoles, selectRolesIsLoading, selectRolesError, selectRolesCount, Role } from '@/lib/stores/roles';
import toast, { Toaster } from 'react-hot-toast';

const RolesPage: React.FC = () => {
  const roles = useRolesStore(selectRoles);
  const isLoading = useRolesStore(selectRolesIsLoading);
  const error = useRolesStore(selectRolesError);
  const count = useRolesStore(selectRolesCount);
  const fetchRoles = useRolesStore((state) => state.fetchRoles);
  const createRole = useRolesStore((state) => state.createRole);
  const updateRole = useRolesStore((state) => state.updateRole);
  const deleteRole = useRolesStore((state) => state.deleteRole);
  const clearError = useRolesStore((state) => state.clearError);

  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles().catch((err) => {
      console.error('Failed to fetch roles:', err);
    });
  }, [fetchRoles]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Role name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id || editingRole._id, {
          name: formData.name.trim(),
          description: formData.description.trim()
        });
        toast.success(`Role "${formData.name}" updated successfully!`, {
          icon: '✅',
          duration: 3000,
        });
      } else {
        await createRole({
          name: formData.name.trim(),
          description: formData.description.trim()
        });
        toast.success(`Role "${formData.name}" created successfully!`, {
          icon: '✅',
          duration: 3000,
        });
      }
      handleCloseModal();
      // Refresh roles list
      await fetchRoles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save role';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteRole(id);
      toast.success('Role deleted successfully!', {
        icon: '✅',
        duration: 3000,
      });
      // Refresh roles list
      await fetchRoles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete role';
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    setShowAddModal(false);
    setEditingRole(null);
    setErrors({});
    setFormData({
      name: '',
      description: ''
    });
  };

  // Transform roles to match table format
  const transformedRoles = useMemo(() => {
    return roles.map((role) => ({
      ...role,
      id: role.id || role._id,
      _id: role._id || role.id,
    }));
  }, [roles]);

  const columns: ColumnDef<Role>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Role Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.name || '-'}</div>
              <div className="text-xs text-gray-500">{row.original.description || '-'}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'userCount',
        header: 'Users',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-600" />
            <span className="font-semibold text-gray-900">{getValue() as number ?? 0}</span>
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
                setEditingRole(row.original);
                setFormData({
                  name: row.original.name || '',
                  description: row.original.description || ''
                });
                setShowAddModal(true);
              }}
              className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200"
              title="Edit Role"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original.id || row.original._id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete Role"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: transformedRoles,
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
    if (!searchTerm) return transformedRoles;
    return transformedRoles.filter(
      role =>
        role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transformedRoles]);

  const totalRoles = count || transformedRoles.length;
  const totalUsers = transformedRoles.reduce((sum, r) => sum + (r.userCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="p-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 flex items-center gap-3">
              <Shield className="w-12 h-12 text-red-600" />
              System Roles
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage user roles and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-red-200 p-6 rounded-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-yellow-600 font-semibold">+3</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Roles</h3>
            <p className="text-3xl font-bold text-gray-900">{totalRoles}</p>
            <p className="text-xs text-gray-500">defined roles</p>
          </div>
        </div>

        <div className="bg-white border-2 border-yellow-200 p-6 rounded-xl hover:border-yellow-300 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-amber-800" />
                <span className="text-xs text-amber-800 font-semibold">{totalUsers}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
            <p className="text-xs text-gray-500">assigned to roles</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
              <Download className="w-5 h-5" />
              Export
            </button>
            <button
              onClick={() => {
                setEditingRole(null);
                setFormData({
                  name: '',
                  description: ''
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Role
            </button>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Role Directory</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading roles...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No roles found matching your search' : 'No roles found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gradient-to-r from-red-500 to-red-600">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-left text-sm font-black text-white uppercase tracking-wider cursor-pointer hover:bg-red-600"
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className="flex items-center gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {header.column.getCanSort() && (
                            <span className="text-white/70">
                              {{
                                asc: ' ↑',
                                desc: ' ↓',
                              }[header.column.getIsSorted() as string] ?? ' ↕'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row, index) => (
                  <tr 
                    key={row.id} 
                    className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
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
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900">
                  {editingRole ? 'Edit Role' : 'Add New Role'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: '' });
                    }}
                    placeholder="e.g., Fire Fighter, Admin, Operations"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 text-sm ${
                      errors.name 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      setErrors({ ...errors, description: '' });
                    }}
                    rows={4}
                    placeholder="e.g., Fire Fighter - Frontline personnel responsible for firefighting operations, rescue missions, and emergency response"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 text-sm resize-none ${
                      errors.description 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 focus:border-red-400 focus:bg-red-50/30'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1.5">
                    Provide details about what this role can access and do
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingRole ? 'Update Role' : 'Create Role'}
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

export default RolesPage;

