const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, dashboardController.getUnifiedDashboard);
router.get('/initiator', protect, requireRole('initiator'), dashboardController.getInitiatorDashboard);
router.get('/approver', protect, requireRole('approver_l1', 'approver_l2', 'approver_l3', 'approver_l4', 'approver_l5', 'approver_l6'), dashboardController.getApproverDashboard);
router.get('/admin', protect, requireRole('admin'), dashboardController.getAdminDashboard);

module.exports = router;
