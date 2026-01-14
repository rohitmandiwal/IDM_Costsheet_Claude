import { apiClient } from '../lib/api-client';
import type {
  ValueBand,
  CreateValueBandRequest,
  UpdateValueBandRequest,
  ApprovalRule,
  CreateApprovalRuleRequest,
  UpdateApprovalRuleRequest,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ApiResponse,
} from '../types/admin.types';

class AdminService {
  // ============================================================


  // ============================================================
  // APPROVAL RULES
  // ============================================================

  async getApprovalRules(): Promise<ApprovalRule[]> {
    const response = await apiClient.get<ApiResponse<ApprovalRule[]>>('/api/admin/approval-rules');
    return response.data.data;
  }

  async getApprovalRuleById(id: number): Promise<ApprovalRule> {
    const response = await apiClient.get<ApiResponse<ApprovalRule>>(`/api/admin/approval-rules/${id}`);
    return response.data.data;
  }

  async createApprovalRule(data: CreateApprovalRuleRequest): Promise<ApprovalRule> {
    const response = await apiClient.post<ApiResponse<ApprovalRule>>('/api/admin/approval-rules', data);
    return response.data.data;
  }

  async updateApprovalRule(id: number, data: UpdateApprovalRuleRequest): Promise<ApprovalRule> {
    const response = await apiClient.put<ApiResponse<ApprovalRule>>(`/api/admin/approval-rules/${id}`, data);
    return response.data.data;
  }

  async deleteApprovalRule(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/approval-rules/${id}`);
  }

  // ============================================================
  // USERS
  // ============================================================

  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/api/admin/users');
    return response.data.data;
  }

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/api/admin/users/${id}`);
    return response.data.data;
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/api/admin/users', data);
    return response.data.data;
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/api/admin/users/${id}`, data);
    return response.data.data;
  }

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/users/${id}`);
  }
}

export const adminService = new AdminService();
