const express = require('express');
const costSheetController = require('../controllers/costSheetController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/fetch-pr', protect, requireRole('initiator', 'admin'), costSheetController.fetchPR);
router.get('/demo-prs', costSheetController.getDemoPRs);
router.get('/:costSheetId/line-items', protect, costSheetController.getPRLineItems);

module.exports = router;
