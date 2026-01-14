const express = require('express');
const costSheetController = require('../controllers/costSheetController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/fetch-pr', protect, requireRole('initiator', 'admin'), costSheetController.fetchPR);
router.post('/previous-purchase-records', protect, requireRole('initiator', 'approver_l1', 'approver_l2', 'approver_l3', 'approver_l4', 'approver_l5', 'approver_l6', 'admin'), costSheetController.getPreviousPurchaseRecords); // Added
router.post('/calculate-approval-chain', protect, requireRole('initiator', 'approver_l1', 'approver_l2', 'approver_l3', 'approver_l4', 'approver_l5', 'approver_l6', 'admin'), costSheetController.calculateApprovalChain); // Dynamic approval chain calculation


// Cost Sheet Management
router.post('/', protect, requireRole('initiator', 'admin'), costSheetController.createCostSheet);
router.get('/:id', protect, requireRole('initiator', 'approver_l1', 'approver_l2', 'approver_l3', 'approver_l4', 'approver_l5', 'approver_l6', 'admin'), costSheetController.getCostSheetById);
router.put('/:id', protect, requireRole('initiator', 'admin'), costSheetController.updateCostSheet);

// Vendor Quotation Management
router.post('/:lineItemId/vendor-quotations', protect, requireRole('initiator', 'admin'), costSheetController.createVendorQuotationForLineItem);
router.put('/vendor-quotations/:id', protect, requireRole('initiator', 'admin'), costSheetController.updateVendorQuotationById);
router.delete('/vendor-quotations/:id', protect, requireRole('initiator', 'admin'), costSheetController.deleteVendorQuotationById);

// Vendor Selection & Deviation
router.put('/line-items/:lineItemId/select-vendor-and-deviation', protect, requireRole('initiator', 'admin'), costSheetController.selectVendorAndDeviation);
router.put('/line-items/:lineItemId/finalized-deal', protect, requireRole('initiator', 'admin'), costSheetController.updateFinalizedDealTerms);

// Cost Sheet Submission
router.post('/:id/submit', protect, requireRole('initiator', 'admin'), costSheetController.submitCostSheet);

// Approver Actions
router.post('/:id/approve', protect, requireRole('approver_l1', 'approver_l2', 'approver_l3', 'approver_l4', 'approver_l5', 'approver_l6', 'admin'), costSheetController.performApprovalAction);

// PO Generation
router.post('/:id/generate-po', protect, requireRole('approver_l1', 'approver_l2', 'approver_l3', 'approver_l4', 'approver_l5', 'approver_l6', 'admin'), costSheetController.generatePoRequest);

module.exports = router;
