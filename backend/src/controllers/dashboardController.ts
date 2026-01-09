import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';
import { User } from '../models/userModel';

export const getUnifiedDashboard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const metrics = await dashboardService.getInitiatorDashboardMetrics(user.id);
    res.status(200).json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInitiatorDashboard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const metrics = await dashboardService.getInitiatorDashboardMetrics(user.id);
    res.status(200).json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApproverDashboard = async (req: Request, res: Response) => {
  try {
    const metrics = await dashboardService.getApproverDashboardMetrics();
    res.status(200).json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const metrics = await dashboardService.getAdminDashboardMetrics();
    res.status(200).json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
