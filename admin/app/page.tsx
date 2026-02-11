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

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.login-dropdown') && !target.closest('.login-button')) {
        setShowLoginDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1516567716610-1c2622997a3e?w=1920&q=80)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/70 to-gray-900/90" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-8 py-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-2xl">🔥</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">GNFS Dashboard</h1>
              <p className="text-sm text-gray-300">Ghana National Fire Service</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowLoginDropdown(!showLoginDropdown)}
              className="login-button bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 border border-white/20"
            >
              <LogIn className="w-5 h-5" />
              Sign In
              <ChevronDown className={`w-4 h-4 transition-transform ${showLoginDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showLoginDropdown && (
              <div className="login-dropdown absolute right-0 mt-2 w-72 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
                <div className="py-2">
                  <Link
                    href="/super-admin/login"
                    onClick={() => setShowLoginDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <Shield className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-semibold text-white">Super Admin</div>
                      <div className="text-xs text-gray-400">System administrators</div>
                    </div>
                  </Link>
                  <Link
                    href="/station-admin/login"
                    onClick={() => setShowLoginDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors border-t border-white/10"
                  >
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-semibold text-white">Station Admin</div>
                      <div className="text-xs text-gray-400">Fire station managers</div>
                    </div>
                  </Link>
                  <Link
                    href="/fire-personnel/login"
                    onClick={() => setShowLoginDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors border-t border-white/10"
                  >
                    <Users className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-semibold text-white">Fire Personnel</div>
                      <div className="text-xs text-gray-400">Operations & staff</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-100px)] px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm text-red-300 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-red-500/30">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Next-Generation Fire Service Management
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Empowering Ghana's
            <span className="block text-red-400">Fire Service</span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            A comprehensive management system designed to streamline operations,
            enhance safety protocols, and improve emergency response coordination.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-12 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">50+</div>
              <div className="text-gray-400 text-sm">Fire Stations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">2,000+</div>
              <div className="text-gray-400 text-sm">Personnel</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">24/7</div>
              <div className="text-gray-400 text-sm">Operations</div>
            </div>
          </div>

          {/* Quick Access Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/super-admin/login"
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-red-500/25"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 border border-white/20"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-400">
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
