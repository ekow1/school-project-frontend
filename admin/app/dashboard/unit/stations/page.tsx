'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStationsStore, selectStations } from '@/lib/stores/stations';
import { 
  MapPin, 
  Search, 
  Phone,
  Building2,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';

const StationsPage: React.FC = () => {
  const stations = useStationsStore(selectStations);
  const fetchStations = useStationsStore((state) => state.fetchStations);
  const isLoadingStations = useStationsStore((state) => state.isLoading);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStations().catch((err) => {
      console.error('Failed to fetch stations:', err);
      toast.error('Failed to load stations');
    });
  }, [fetchStations]);

  const filteredStations = useMemo(() => {
    if (!searchTerm) return stations;

    const searchLower = searchTerm.toLowerCase();
    return stations.filter(station =>
      station.name?.toLowerCase().includes(searchLower) ||
      station.location?.toLowerCase().includes(searchLower) ||
      station.region?.toLowerCase().includes(searchLower) ||
      station.phone_number?.toLowerCase().includes(searchLower)
    );
  }, [stations, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fire Stations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all fire stations</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stations Grid */}
      {isLoadingStations ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading stations...</p>
        </div>
      ) : filteredStations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStations.map((station) => (
            <div
              key={station._id || station.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                    {station.name || 'Unknown Station'}
                  </h3>
                  <div className="space-y-2">
                    {station.location && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {station.location}
                      </p>
                    )}
                    {station.phone_number && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {station.phone_number}
                      </p>
                    )}
                    {station.region && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Region: {station.region}
                      </p>
                    )}
                    {station.call_sign && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Call Sign: {station.call_sign}
                      </p>
                    )}
                  </div>
                  {station.location_url && (
                    <a
                      href={station.location_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      View on Map
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No stations found</p>
        </div>
      )}
    </div>
  );
};

export default StationsPage;



