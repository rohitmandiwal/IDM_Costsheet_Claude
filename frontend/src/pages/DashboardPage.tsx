import { useAuth } from '../contexts/AuthContext';
import { Dashboard } from './Dashboard';

export function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading user data...</div>
      </div>
    );
  }

  return <Dashboard />;
}
