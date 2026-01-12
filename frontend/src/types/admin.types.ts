// Admin Module Type Definitions - Aligned with Database Schema
import type { RoleType, CategoryType } from '../constants/admin.constants';

// ============================================================
// VALUE BANDS
// ============================================================

export interface ValueBand {
  id: number;
  name: string;
  min_value: number;
  max_value: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateValueBandRequest {
  name: string;
  min_value: number;
  max_value: number | null;
}

export interface UpdateValueBandRequest {
  name?: string;
  min_value?: number;
  max_value?: number | null;
}

// ============================================================
// APPROVER LEVELS
// ============================================================

export interface ApproverLevel {
  id: number;
  rule_id: number;
  level: number;
  approver_role: RoleType;
  created_at: string;
  updated_at: string;
}

export interface CreateApproverLevelRequest {
  level: number;
  approver_role: RoleType;
}

// ============================================================
// APPROVAL RULES
// ============================================================

export interface ApprovalRule {
  id: number;
  value_band_id: number;
  category: CategoryType;
  created_at: string;
  updated_at: string;
  approver_levels?: ApproverLevel[];
  value_band?: ValueBand;
}

export interface CreateApprovalRuleRequest {
  value_band_id: number;
  category: CategoryType;
  approvers: CreateApproverLevelRequest[];
}

export interface UpdateApprovalRuleRequest {
  value_band_id?: number;
  category?: CategoryType;
  approvers?: CreateApproverLevelRequest[];
}

// ============================================================
// ROLE ASSIGNMENTS
// ============================================================

export interface RoleAssignment {
  id: number;
  user_id: number;
  role: RoleType;
  created_at: string;
  updated_at: string;
}

// ============================================================
// USERS
// ============================================================

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  department: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  role_assignments?: RoleAssignment[];
}

export interface CreateUserRequest {
  username: string;
  full_name: string;
  email: string;
  password: string;  // Required for user creation
  department?: string | null;
  is_active?: boolean;
  roles: RoleType[];
}

export interface UpdateUserRequest {
  username?: string;
  full_name?: string;
  email?: string;
  department?: string | null;
  is_active?: boolean;
  roles?: RoleType[];
}

// ============================================================
// API RESPONSE WRAPPERS
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
}
