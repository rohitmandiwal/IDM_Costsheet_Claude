import express from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = express.Router();

router.get('/', protect, dashboardController.getUnifiedDashboard);
router.get('/initiator', protect, requireRole('Initiator'), dashboardController.getInitiatorDashboard);
router.get('/approver', protect, requireRole('Approver'), dashboardController.getApproverDashboard);
router.get('/admin', protect, requireRole('Admin'), dashboardController.getAdminDashboard);

export default router;
