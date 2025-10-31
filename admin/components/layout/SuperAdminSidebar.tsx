'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  Shield, 
  Activity,
  Database,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Bell,
  HelpCircle,
  Mail
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const SuperAdminSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const navigationItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Activity
    },
    {
      name: 'User Management',
      href: '/dashboard/superadmin/users',
      icon: Users
    },
    {
      name: 'Station Management',
      href: '/dashboard/superadmin/stations',
      icon: Building2
    },
    {
      name: 'Analytics & Reports',
      href: '/dashboard/superadmin/analytics',
      icon: BarChart3
    },
    {
      name: 'System Configuration',
      href: '/dashboard/superadmin/system',
      icon: Settings
    },
    {
      name: 'Audit Logs',
      href: '/dashboard/superadmin/audit',
      icon: Shield
    },
    {
      name: 'Emergency Response',
      href: '/dashboard/superadmin/emergency',
      icon: Shield
    },
    {
      name: 'Equipment Tracking',
      href: '/dashboard/superadmin/equipment',
      icon: Building2
    },
    {
      name: 'Incident Reports',
      href: '/dashboard/superadmin/incidents',
      icon: Shield
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r-4 border-red-600 z-50
        transition-all duration-300 ease-in-out flex flex-col
        ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        ${isCollapsed ? 'w-0' : 'w-64'}
        lg:w-64
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-black text-gray-900">GNFS Admin</h1>
                <p className="text-sm text-red-600 font-semibold">Super Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-red-200 transition-colors lg:hidden"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                    ${active 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-600 group-hover:text-red-600'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.name}</span>
                      {active && (
                        <div className="absolute right-2 w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer with Dropdowns */}
        <div className="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 space-y-3">
          {/* Profile Section with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-red-50 transition-all duration-200 w-full text-left shadow-sm border border-gray-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                SA
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      Super Admin
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      superadmin@gnfs.gov.gh
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    showProfileDropdown ? 'rotate-180' : ''
                  }`} />
                </>
              )}
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && !isCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>View Profile</span>
                </Link>
                <Link
                  href="/dashboard/profile/edit"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Link>
                <Link
                  href="/dashboard/profile/security"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Security Settings</span>
                </Link>
              </div>
            )}
          </div>


          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors w-full text-left font-semibold"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 p-3 bg-white border-2 border-red-600 rounded-xl shadow-lg lg:hidden hover:bg-red-50 transition-colors"
      >
        <Menu className="w-5 h-5 text-red-600" />
      </button>
    </>
  );
};

export default SuperAdminSidebar;