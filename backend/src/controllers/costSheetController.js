const { createCostSheetFromPRs } = require('../services/costSheetService');
const { getDemoPRNumbers } = require('../services/sapService');
const { findLineItemsByCostSheetId } = require('../repositories/costSheetRepository');
const logger = require('../utils/logger');

const fetchPR = async (req, res) => {
  try {
    const initiatorId = req.user?.id;

    if (!initiatorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { requirementType, prNumbers } = req.body;

    if (!requirementType || !prNumbers) {
      logger.error('Missing required fields: requirementType or prNumbers');
      return res.status(400).json({ success: false, message: 'requirementType and prNumbers are required' });
    }

    if (requirementType !== 'technical' && requirementType !== 'non_technical') {
      logger.error(`Invalid requirement type: ${requirementType}`);
      return res.status(400).json({ success: false, message: 'requirementType must be either technical or non_technical' });
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
  } catch (error) {
    logger.error(`Error in fetchPR controller: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDemoPRs = async (req, res) => {
  try {
    const demoPRs = getDemoPRNumbers();
    res.status(200).json({ success: true, data: { demoPRs } });
  } catch (error) {
    logger.error(`Error in getDemoPRs controller: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPRLineItems = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const costSheetId = parseInt(req.params.costSheetId, 10);

    if (isNaN(costSheetId)) {
      return res.status(400).json({ success: false, message: 'Invalid cost sheet ID' });
    }

    const lineItems = await findLineItemsByCostSheetId(costSheetId);

    res.status(200).json({
      success: true,
      data: {
        lineItems,
      },
    });
  } catch (error) {
    logger.error(`Error in getPRLineItems controller: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
    fetchPR,
    getDemoPRs,
    getPRLineItems
}
