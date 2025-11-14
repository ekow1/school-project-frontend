'use client';

import OperationsDashboard from '@/components/dashboards/OperationsDashboard';
import { useAuthStore } from '@/lib/stores/auth';

export default function OperationsPage() {
  const user = useAuthStore((state) => state.user);
  
  return (
    <OperationsDashboard 
      stationId={user?.stationId}
      departmentId={user?.departmentId}
      subRole={user?.subRole}
    />
  );
}

