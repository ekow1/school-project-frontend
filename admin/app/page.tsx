'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  ChevronDown,
  Building2,
  LogIn
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowLoginDropdown(!showLoginDropdown);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/ddwet1dzj/image/upload/v1749741221/pexels-photo-2030190_z0ke3z.jpg)'
        }}
      >
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-8 py-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
              <span className="text-2xl">🔥</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">GNFS Dashboard</h1>
              <p className="text-sm text-gray-300">Ghana National Fire Service</p>
            </div>
          </div>

          <div className="relative z-30">
            <button
              onClick={toggleDropdown}
              className="login-button bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              Sign In
              <ChevronDown className={`w-4 h-4 transition-transform ${showLoginDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showLoginDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-50">
                <div className="py-2">
                  <a
                    href="/super-admin/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <Shield className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-semibold text-white">Super Admin</div>
                      <div className="text-xs text-gray-400">System administrators</div>
                    </div>
                  </a>
                  <a
                    href="/station-admin/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors border-t border-gray-700 cursor-pointer"
                  >
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-semibold text-white">Station Admin</div>
                      <div className="text-xs text-gray-400">Fire station managers</div>
                    </div>
                  </a>
                  <a
                    href="/fire-personnel/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors border-t border-gray-700 cursor-pointer"
                  >
                    <Users className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-semibold text-white">Fire Personnel</div>
                      <div className="text-xs text-gray-400">Operations & staff</div>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-100px)] px-8 pointer-events-none">
        <div className="text-center max-w-4xl mx-auto pointer-events-auto">
          <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-300 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-red-600/30">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Next-Generation Fire Service Management
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Empowering Ghana's
            <span className="block text-red-400">Fire Service</span>
          </h1>

          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            A comprehensive management system designed to streamline operations,
            enhance safety protocols, and improve emergency response coordination.
          </p>

          {/* Quick Access Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/super-admin/login"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-600/30 cursor-pointer pointer-events-auto"
            >
              Get Started
            </a>
            <a
              href="/fire-personnel/login"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer pointer-events-auto"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-300 pointer-events-auto">
          <p>&copy; 2024 Ghana National Fire Service. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
