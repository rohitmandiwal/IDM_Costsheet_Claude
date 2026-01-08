import { apiClient } from '../lib/api-client';
import type { LoginCredentials, User } from '../types/auth.types';
import type { AuthResponse } from '../types/auth.types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; user: User }>('/api/auth/me');
    return response.data.user;
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }
}

export const authService = new AuthService();
