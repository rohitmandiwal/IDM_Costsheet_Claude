import express from 'express';
import * as costSheetController from '../controllers/costSheetController';
import { protect } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = express.Router();

router.post('/fetch-pr', protect, requireRole('Initiator', 'Admin'), costSheetController.fetchPR);
router.get('/demo-prs', costSheetController.getDemoPRs);
router.get('/:costSheetId/line-items', protect, costSheetController.getPRLineItems);

export default router;
