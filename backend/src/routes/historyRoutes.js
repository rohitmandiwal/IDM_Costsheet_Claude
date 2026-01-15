const express = require('express');
const router = express.Router();
const {
    getCostSheetHistoryController,
    getHistoryTimelineController,
    createChangeRequestController,
    getChangeRequestsController,
    resolveChangeRequestController,
} = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/cost-sheet/:costSheetId/history', protect, getCostSheetHistoryController);
router.get('/cost-sheet/:costSheetId/timeline', protect, getHistoryTimelineController);
router.post('/cost-sheet/:costSheetId/change-request', protect, createChangeRequestController);
router.get('/cost-sheet/:costSheetId/change-requests', protect, getChangeRequestsController);
router.put('/change-request/:changeRequestId/resolve', protect, resolveChangeRequestController);

module.exports = router;
