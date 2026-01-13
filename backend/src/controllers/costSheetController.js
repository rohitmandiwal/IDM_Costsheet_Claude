const { createCostSheetFromPRs, createCostSheet, getCostSheetById, updateCostSheet, createVendorQuotation, updateVendorQuotation, deleteVendorQuotation, selectVendorAndDeviation, submitCostSheet, performApprovalAction, generatePoRequest } = require('../services/costSheetService');
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

    res.status(200).json({
      success: true,
      data: {
        prSummaries: result.prSummaries,
      },
    });
  } catch (error) {
    logger.error(`Error in fetchPR controller: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};



const createCostSheetController = async (req, res) => {
  try {
    const initiatorId = req.user?.id;
    if (!initiatorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const { prNumbers, selectedLineItemIds, requirementType } = req.body;
    const costSheet = await createCostSheet(initiatorId, prNumbers, selectedLineItemIds, requirementType);
    res.status(201).json({ success: true, data: costSheet });
  } catch (error) {
    logger.error(`Error in createCostSheet controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getCostSheetByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const costSheet = await getCostSheetById(id);
    if (!costSheet) {
      return res.status(404).json({ success: false, message: 'Cost Sheet not found' });
    }
    res.status(200).json({ success: true, data: costSheet });
  } catch (error) {
    logger.error(`Error in getCostSheetById controller: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCostSheetController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCostSheet = await updateCostSheet(id, req.body);
    res.status(200).json({ success: true, data: updatedCostSheet });
  } catch (error) {
    logger.error(`Error in updateCostSheet controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

const createVendorQuotationForLineItemController = async (req, res) => {
  try {
    const { lineItemId } = req.params;
    const quotationData = req.body;
    const newQuotation = await createVendorQuotation(lineItemId, quotationData);
    res.status(201).json({ success: true, data: newQuotation });
  } catch (error) {
    logger.error(`Error in createVendorQuotationForLineItem controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateVendorQuotationByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuotation = await updateVendorQuotation(id, req.body);
    res.status(200).json({ success: true, data: updatedQuotation });
  } catch (error) {
    logger.error(`Error in updateVendorQuotationById controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteVendorQuotationByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteVendorQuotation(id);
    res.status(200).json({ success: true, message: 'Vendor quotation deleted successfully.' });
  } catch (error) {
    logger.error(`Error in deleteVendorQuotationById controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

const selectVendorAndDeviationController = async (req, res) => {
  try {
    const { lineItemId } = req.params;
    const { finalizedVendorId, deviationData } = req.body;
    const initiatorId = req.user?.id; // Assuming initiator ID is available from authentication

    if (!initiatorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const updatedCostSheet = await selectVendorAndDeviation(
      lineItemId,
      finalizedVendorId,
      deviationData,
      initiatorId
    );
    res.status(200).json({ success: true, data: updatedCostSheet });
  } catch (error) {
    logger.error(`Error in selectVendorAndDeviation controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

const submitCostSheetController = async (req, res) => {
  try {
    const { id: costSheetId } = req.params;
    const { comments } = req.body || {};
    const initiatorId = req.user?.id;

    if (!initiatorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const submittedCostSheet = await submitCostSheet(costSheetId, initiatorId, comments);
    res.status(200).json({ success: true, data: submittedCostSheet });
  } catch (error) {
    logger.error(`Error in submitCostSheet controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

const performApprovalActionController = async (req, res) => {
  try {
    const { id: costSheetId } = req.params;
    const { action, comments, justification } = req.body;
    const approverId = req.user?.id;
    const approverRoles = req.user?.roles; // Assuming roles are part of req.user

    if (!approverId || !approverRoles) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const updatedCostSheet = await performApprovalAction(
      costSheetId,
      approverId,
      action,
      comments,
      justification,
    );
    res.status(200).json({ success: true, data: updatedCostSheet });
  } catch (error) {
    logger.error(`Error in performApprovalAction controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

const generatePoRequestController = async (req, res) => {
  try {
    const { id: costSheetId } = req.params;
    const poData = req.body;
    const userId = req.user?.id; // Assuming the user triggering is the final approver

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const updatedCostSheet = await generatePoRequest(costSheetId, userId, poData);
    res.status(200).json({ success: true, data: updatedCostSheet });
  } catch (error) {
    logger.error(`Error in generatePoRequest controller: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getPreviousPurchaseRecordsController = async (req, res) => {
  try {
    const { partCode, vendorCodes } = req.body; // Expecting POST request body filter params
    // or GET query params: req.query.partCode, req.query.vendorCodes (comma separated or repeats)
    // Let's stick to POST for array handling or GET with query params.
    // Given the requirement "Dynamic Lookup", GET with query params is cleaner but arrays in query params can be tricky. POST is safer for arrays.
    // However, usually 'fetch' suggests GET. Let's use POST for searching/filtering with complex inputs.

    // Actually, req.query is standard for GET. Let's try GET first.
    // URL: /previous-purchase-records?partCode=XYZ&vendorCodes=V1,V2
    let vCodes = [];
    if (req.method === 'GET') {
      const { partCode: pCode, vendorCodes: vCodesStr } = req.query;
      if (!pCode) {
        return res.status(400).json({ success: false, message: 'partCode is required' });
      }
      if (vCodesStr) {
        vCodes = vCodesStr.split(',');
      }
      const records = await require('../services/costSheetService').getPreviousPurchaseRecords(pCode, vCodes);
      return res.status(200).json({ success: true, data: records });
    } else {
      // Fallback or POST implementation
      const { partCode, vendorCodes } = req.body;
      if (!partCode) {
        return res.status(400).json({ success: false, message: 'partCode is required' });
      }
      const records = await require('../services/costSheetService').getPreviousPurchaseRecords(partCode, vendorCodes);
      return res.status(200).json({ success: true, data: records });
    }
  } catch (error) {
    logger.error(`Error in getPreviousPurchaseRecords controller: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const calculateApprovalChainController = async (req, res) => {
  try {
    const { totalValue, requirementType } = req.body;

    if (totalValue === undefined || totalValue === null) {
      return res.status(400).json({ success: false, message: 'totalValue is required' });
    }

    if (!requirementType || (requirementType !== 'technical' && requirementType !== 'non_technical')) {
      return res.status(400).json({ success: false, message: 'Valid requirementType (technical or non_technical) is required' });
    }

    const { calculateApprovalChainByValue } = require('../services/approvalService');
    const approvalChain = await calculateApprovalChainByValue(parseFloat(totalValue), requirementType);

    res.status(200).json({ success: true, data: approvalChain });
  } catch (error) {
    logger.error(`Error in calculateApprovalChain controller: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  fetchPR,
  createCostSheet: createCostSheetController,
  getCostSheetById: getCostSheetByIdController,
  updateCostSheet: updateCostSheetController,
  createVendorQuotationForLineItem: createVendorQuotationForLineItemController,
  updateVendorQuotationById: updateVendorQuotationByIdController,
  deleteVendorQuotationById: deleteVendorQuotationByIdController,
  selectVendorAndDeviation: selectVendorAndDeviationController,
  submitCostSheet: submitCostSheetController,
  performApprovalAction: performApprovalActionController,
  generatePoRequest: generatePoRequestController,
  getPreviousPurchaseRecords: getPreviousPurchaseRecordsController,
  calculateApprovalChain: calculateApprovalChainController,
};
