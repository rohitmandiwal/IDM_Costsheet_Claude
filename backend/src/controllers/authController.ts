import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ success: true, userId: user.id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { token, user } = await authService.loginUser(req.body);
    res.status(200).json({ success: true, token, user });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const user = await authService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: Array.isArray(user.role) ? user.role[0] : user.role,
        department: user.department
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = (req: Request, res: Response) => {
  // For JWT, logout is primarily client-side by removing the token.
  // This endpoint can be used for server-side session invalidation if implemented in future.
  res.status(200).json({ success: true, message: 'Logged out successfully (client-side token removal expected)' });
};
