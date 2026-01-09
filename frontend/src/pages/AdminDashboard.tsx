import { useState, useEffect } from 'react';
import { Users, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { dashboardService } from '../services/dashboard.service';
import type { AdminDashboardData } from '../types/dashboard.types';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const dashboardData = await dashboardService.getAdminDashboard();
      setData(dashboardData);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      if (error.response?.status === 403) {
        console.error('Access denied: User does not have Admin role');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserManagement = () => {
    navigate('/admin');
  };

  const handleApprovalMatrix = () => {
    navigate('/admin');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-500 mb-2">Failed to load dashboard data</div>
          <div className="text-sm text-gray-600">You may not have the required permissions to access this dashboard.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">System overview and administrative controls</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Cost Sheets</CardTitle>
            <FileText className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.activeCostSheets}</div>
            <p className="text-xs text-gray-500 mt-1">
              Currently in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
            <Settings className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-gray-500 mt-1">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Manage user accounts, roles, and permissions across the system.
            </p>
            <Button
              onClick={handleUserManagement}
              className="w-full"
            >
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Approval Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Configure approval workflows and value-based approval rules.
            </p>
            <Button
              onClick={handleApprovalMatrix}
              className="w-full"
            >
              Configure Approval Matrix
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
