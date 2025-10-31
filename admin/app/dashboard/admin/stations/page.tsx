'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Edit, 
  MapPin, 
  Phone,
  Users,
  Download,
  Upload,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';

const AdminStationManagementPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Current station data
  const [stationData, setStationData] = useState({
    name: 'Accra Central Fire Station',
    code: 'A1',
    city: 'Accra',
    region: 'Greater Accra',
    address: 'Independence Avenue, Accra',
    phone: '+233 30 123 4567',
    email: 'accra.central@gnfs.gov.gh',
    mdfodfo: 'Commander John Doe',
    personnel: 45,
    callSign: 'CENTRAL-A1',
    status: 'active' as 'active' | 'maintenance' | 'offline',
    lastInspection: '2024-02-15',
    establishedDate: '2020-01-15'
  });

  const handleInputChange = (field: string, value: string | number) => {
    setStationData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would save to API
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              Station Management
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Manage station details, personnel, and operational status
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
              <span className="text-2xl font-bold text-gray-900">{stationData.name}</span>
              <p className="text-gray-500 text-sm">Current Station</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          {!isEditing ? (
            <>
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm">
                <Download className="w-5 h-5" />
                Export Data
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                <Edit className="w-5 h-5" />
                Edit Station Details
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-red-50 border-2 border-red-200 p-6 rounded-2xl hover:border-red-400 hover:shadow-xl hover:shadow-red-100 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-bold">Active</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Station Status</h3>
            <p className="text-4xl font-black text-gray-900 capitalize">{stationData.status}</p>
            <p className="text-xs text-gray-400 font-medium">operational</p>
          </div>
        </div>

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
            <p className="text-4xl font-black text-gray-900">{stationData.personnel}</p>
            <p className="text-xs text-gray-400 font-medium">station staff</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 p-6 rounded-2xl hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-bold">Current</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Last Inspection</h3>
            <p className="text-2xl font-black text-gray-900">{new Date(stationData.lastInspection).toLocaleDateString()}</p>
            <p className="text-xs text-gray-400 font-medium">inspection date</p>
          </div>
        </div>
      </div>

      {/* Station Details Form */}
      <div className="space-y-6">
        <h2 className="text-3xl font-black text-gray-900">Station Information</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Station Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={stationData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 font-medium"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold">
                  {stationData.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Station Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={stationData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 font-medium"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold">
                  {stationData.code}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={stationData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 font-medium"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold">
                  {stationData.city}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Region</label>
              {isEditing ? (
                <input
                  type="text"
                  value={stationData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 font-medium"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold">
                  {stationData.region}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={stationData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 font-medium"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold">
                  {stationData.address}
                </div>
              )}
            </div>
          </div>

          {/* Contact & Operational Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={stationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 font-medium"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold">
                  {stationData.phone}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={stationData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 font-medium"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold">
                  {stationData.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">MDFO/DFO</label>
              {isEditing ? (
                <input
                  type="text"
                  value={stationData.mdfodfo}
                  onChange={(e) => handleInputChange('mdfodfo', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 font-medium"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold">
                  {stationData.mdfodfo}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Call Sign</label>
              {isEditing ? (
                <input
                  type="text"
                  value={stationData.callSign}
                  onChange={(e) => handleInputChange('callSign', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 font-medium"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold">
                  {stationData.callSign}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Status</label>
              {isEditing ? (
                <select
                  value={stationData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 font-medium"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              ) : (
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    stationData.status === 'active' ? 'bg-green-100 text-green-800' :
                    stationData.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {stationData.status.charAt(0).toUpperCase() + stationData.status.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStationManagementPage;
