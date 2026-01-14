const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(requireRole('admin'));



// Approval Rules & Levels
router.post('/approval-rules', adminController.createApprovalRule);
router.get('/approval-rules', adminController.getApprovalRules);
router.put('/approval-rules/:id', adminController.updateApprovalRule);
router.delete('/approval-rules/:id', adminController.deleteApprovalRule);

// User Management
router.post('/users', adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
