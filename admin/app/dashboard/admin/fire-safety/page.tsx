'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { TipList } from '@/components/fire-safety/TipList';

const AdminFireSafetyPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 px-6">
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Fire Safety Tips</h1>
          <p className="text-gray-600">
            Create and manage safety tips to share with your station and the public.
          </p>
        </div>
        <div className="rounded-full bg-red-50 p-3 border border-red-100">
          <Flame className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <TipList isSuperAdmin={false} />
    </div>
  );
};

export default AdminFireSafetyPage;
