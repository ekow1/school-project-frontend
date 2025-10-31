'use client';

import DashboardRouter from '@/components/DashboardRouter';
import SuperAdminSidebar from '@/components/layout/SuperAdminSidebar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import TopBar from '@/components/layout/TopBar';
import { useAuthStore } from '@/lib/stores/auth';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  // Render appropriate sidebar based on user role
  const renderSidebar = () => {
    if (user?.role === 'SuperAdmin') {
      return <SuperAdminSidebar />;
    }
    // Use Admin sidebar as the unified default for all non-superadmin roles
    return <AdminSidebar />;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar onLogout={handleLogout} />
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 bg-gray-50 dark:bg-gray-900">
            <DashboardRouter />
          </div>
        </div>
      </div>
    </div>
  );
}
