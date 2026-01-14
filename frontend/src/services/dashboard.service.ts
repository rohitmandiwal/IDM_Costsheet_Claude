import { apiClient } from '../lib/api-client';
import type { UnifiedDashboardData, ApproverDashboardData, AdminDashboardData } from '../types/dashboard.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const dashboardService = {
  async getUnifiedDashboard(): Promise<UnifiedDashboardData> {
    const response = await apiClient.get<ApiResponse<UnifiedDashboardData>>('/api/dashboard');
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

  async getAuditLogs(params: { costSheetId?: number | string; userId?: number | string; activityType?: string }): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/api/dashboard/audit-logs', { params });
    return response.data.data;
  }
};
