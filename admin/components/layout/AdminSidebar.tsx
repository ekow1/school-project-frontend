'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  Users, 
  Building2, 
  BarChart3, 
  Shield, 
  Activity,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Bell,
  HelpCircle,
  Mail,
  FileText,
  Wrench,
  Phone,
  MapPin
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  indent?: boolean;
}

const AdminSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [openStationMenu, setOpenStationMenu] = useState(true);
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
      name: 'Station Management',
      href: '/dashboard/admin/stations',
      icon: Building2
    },
    {
      name: 'Analytics & Reports',
      href: '/dashboard/admin/analytics',
      icon: BarChart3
    },
    {
      name: 'Audit Logs',
      href: '/dashboard/admin/audit',
      icon: Shield
    },
    {
      name: 'Station Outlook',
      href: '/dashboard/admin/outlook',
      icon: MapPin
    },
    {
      name: 'Emergency Response',
      href: '/dashboard/admin/emergency',
      icon: Phone
    },
    {
      name: 'Equipment Tracking',
      href: '/dashboard/admin/equipment',
      icon: Wrench
    },
    {
      name: 'Incident Reports',
      href: '/dashboard/admin/incidents',
      icon: FileText
    }
  ];

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${
        isCollapsed ? 'hidden' : 'block'
      }`} onClick={() => setIsCollapsed(true)} />

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r-4 border-red-600 z-50
        transition-all duration-300 ease-in-out flex flex-col
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        w-64
        lg:w-64
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">GNFS Admin</h1>
              <p className="text-sm text-red-600 font-semibold">Station Admin Panel</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-2 rounded-lg hover:bg-red-200 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              // Render Station Management with collapsible sub-menu
              if (item.name === 'Station Management') {
                const stationActive = pathname.startsWith('/dashboard/admin/stations') ||
                  pathname.startsWith('/dashboard/admin/users') ||
                  pathname.startsWith('/dashboard/admin/departments') ||
                  pathname.startsWith('/dashboard/admin/subdivisions');
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setOpenStationMenu(v => !v)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative border
                        ${stationActive 
                          ? 'bg-red-50 text-red-800 border-red-200' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 ${stationActive ? 'text-red-600' : 'text-gray-500 group-hover:text-red-600'}`} />
                      <span className="flex-1 text-sm font-semibold">{item.name}</span>
                      <Link
                        href={item.href}
                        className="text-xs text-red-700 border border-red-200 px-2 py-1 rounded-md hover:bg-red-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open
                      </Link>
                      {openStationMenu ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {openStationMenu && (
                      <div className="pl-5 ml-1 border-l-2 border-gray-200 space-y-1">
                        <Link
                          href="/dashboard/admin/users"
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative
                            ${pathname === '/dashboard/admin/users' 
                              ? 'bg-red-50 text-red-800' 
                              : 'text-gray-700 hover:bg-red-50 hover:text-red-800'
                            }
                          `}
                        >
                          <Users className={`w-4 h-4 ${pathname === '/dashboard/admin/users' ? 'text-red-600' : 'text-gray-500 group-hover:text-red-600'}`} />
                          <span className="flex-1 text-sm font-medium">Personnel Management</span>
                        </Link>
                        <Link
                          href="/dashboard/admin/departments"
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative
                            ${pathname === '/dashboard/admin/departments' 
                              ? 'bg-red-50 text-red-800' 
                              : 'text-gray-700 hover:bg-red-50 hover:text-red-800'
                            }
                          `}
                        >
                          <Building2 className={`w-4 h-4 ${pathname === '/dashboard/admin/departments' ? 'text-red-600' : 'text-gray-500 group-hover:text-red-600'}`} />
                          <span className="flex-1 text-sm font-medium">Departments</span>
                        </Link>
                        <Link
                          href="/dashboard/admin/subdivisions"
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative
                            ${pathname === '/dashboard/admin/subdivisions' 
                              ? 'bg-red-50 text-red-800' 
                              : 'text-gray-700 hover:bg-red-50 hover:text-red-800'
                            }
                          `}
                        >
                          <MapPin className={`w-4 h-4 ${pathname === '/dashboard/admin/subdivisions' ? 'text-red-600' : 'text-gray-500 group-hover:text-red-600'}`} />
                          <span className="flex-1 text-sm font-medium">Sub-Divisions</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-red-100 text-red-700 border-2 border-red-200 shadow-md' 
                      : 'text-gray-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md'
                    }
                    ${item.indent ? 'ml-4' : ''}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-gray-600 group-hover:text-red-600'}`} />
                  <span className={`flex-1 text-sm font-medium ${item.indent ? 'pl-4' : ''}`}>{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-red-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-gray-200 bg-gray-50">
          {/* Profile Dropdown */}
          <div className="relative mb-3">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">Station Admin</p>
                <p className="text-xs text-gray-500">Accra Central</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                showProfileDropdown ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile Settings
                </Link>
                <Link
                  href="/dashboard/notifications"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </Link>
                <Link
                  href="/dashboard/help"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </Link>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
