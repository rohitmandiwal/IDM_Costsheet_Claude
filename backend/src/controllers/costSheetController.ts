import { Request, Response } from 'express';
import { createCostSheetFromPRs } from '../services/costSheetService';
import { getDemoPRNumbers } from '../services/sapService';
import logger from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const fetchPR = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const initiatorId = authReq.user?.id;

    if (!initiatorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { requirementType, prNumbers } = req.body;

    if (!requirementType || !prNumbers) {
      logger.error('Missing required fields: requirementType or prNumbers');
      return res.status(400).json({ success: false, message: 'requirementType and prNumbers are required' });
    }

    if (requirementType !== 'Technical' && requirementType !== 'Commercial') {
      logger.error(`Invalid requirement type: ${requirementType}`);
      return res.status(400).json({ success: false, message: 'requirementType must be either Technical or Commercial' });
    }

    if (!Array.isArray(prNumbers)) {
      logger.error('prNumbers must be an array');
      return res.status(400).json({ success: false, message: 'prNumbers must be an array' });
    }

    if (prNumbers.length === 0) {
      logger.error('At least one PR number is required');
      return res.status(400).json({ success: false, message: 'At least one PR number is required' });
    }

    if (prNumbers.length > 10) {
      logger.error(`Too many PR numbers: ${prNumbers.length}`);
      return res.status(400).json({ success: false, message: 'Maximum 10 PR numbers allowed' });
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    for (const prNumber of prNumbers) {
      if (!alphanumericRegex.test(prNumber)) {
        logger.error(`Invalid PR number format: ${prNumber}`);
        return res.status(400).json({ success: false, message: `Invalid PR number format: ${prNumber}. PR numbers must be alphanumeric.` });
      }
    }

    logger.info(`Fetch PR request from user ${initiatorId} for PRs: ${prNumbers.join(', ')}`);

    const result = await createCostSheetFromPRs({
      initiatorId,
      requirementType,
      prNumbers,
    });

    logger.info(`Successfully created cost sheet ${result.costSheetId} for user ${initiatorId}`);

    res.status(201).json({
      success: true,
      data: {
        costSheetId: result.costSheetId,
        prSummaries: result.prSummaries,
      },
    });
  } catch (error: any) {
    logger.error(`Error in fetchPR controller: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDemoPRs = async (req: Request, res: Response) => {
  try {
    const demoPRs = getDemoPRNumbers();
    res.status(200).json({ success: true, data: { demoPRs } });
  } catch (error: any) {
    logger.error(`Error in getDemoPRs controller: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPRLineItems = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const costSheetId = parseInt(req.params.costSheetId, 10);

    if (isNaN(costSheetId)) {
      return res.status(400).json({ success: false, message: 'Invalid cost sheet ID' });
    }

    const { findPRLineItemsByCostSheetId } = await import('../repositories/costSheetRepository');
    const lineItems = await findPRLineItemsByCostSheetId(costSheetId);

    const formattedLineItems = lineItems.map((item: any) => ({
      prNumber: item.pr_number,
      lineNumber: item.line_number,
      materialCode: item.part_code,
      description: item.description,
      quantity: item.quantity,
      unit: item.uom,
      estimatedValue: item.pr_price || 0,
      plant: item.plant,
      prPrice: item.pr_price,
      lastYearPrice: item.last_year_price,
    }));

    res.status(200).json({
      success: true,
      data: {
        lineItems: formattedLineItems,
      },
    });
  } catch (error: any) {
    logger.error(`Error in getPRLineItems controller: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
