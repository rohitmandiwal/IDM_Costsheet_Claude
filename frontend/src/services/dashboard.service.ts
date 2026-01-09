import { apiClient } from '../lib/api-client';
import type { InitiatorDashboardData, ApproverDashboardData, AdminDashboardData } from '../types/dashboard.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const dashboardService = {
  async getUnifiedDashboard(): Promise<InitiatorDashboardData> {
    const response = await apiClient.get<ApiResponse<InitiatorDashboardData>>('/api/dashboard');
    return response.data.data;
  },

  async getInitiatorDashboard(): Promise<InitiatorDashboardData> {
    const response = await apiClient.get<ApiResponse<InitiatorDashboardData>>('/api/dashboard/initiator');
    return response.data.data;
  },

  async getApproverDashboard(): Promise<ApproverDashboardData> {
    const response = await apiClient.get<ApiResponse<ApproverDashboardData>>('/api/dashboard/approver');
    return response.data.data;
  },

  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await apiClient.get<ApiResponse<AdminDashboardData>>('/api/dashboard/admin');
    return response.data.data;
  },
};
