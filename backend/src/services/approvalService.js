const { CostSheet, CostSheetLineItem, ValueBand, ApprovalRule, ApproverLevel, Deviation, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const determineApprovalChain = async (costSheetId) => {
  const costSheet = await CostSheet.findByPk(costSheetId, {
    include: [
      {
        model: CostSheetLineItem,
        as: 'cost_sheet_line_items',
        include: [
          {
            model: Deviation,
            as: 'deviations',
          },
        ],
      },
    ],
  });

  if (!costSheet) {
    throw new Error('Cost Sheet not found');
  }

  const totalValue = costSheet.cost_sheet_line_items.reduce((sum, item) => sum + (item.final_order_value || 0), 0);
  const requirementType = costSheet.requirement_type; // 'technical' or 'non_technical'

  // Find matching approval rules
  const approvalRules = await ApprovalRule.findAll({
    where: {
      category: requirementType,
    },
    include: [
      {
        model: ValueBand,
        where: {
          min_value: { [Op.lte]: totalValue },
          [Op.or]: [
            { max_value: { [Op.gte]: totalValue } },
            { max_value: null },
          ],
        },
        required: true, // Only include rules with a matching value band
      },
      {
        model: ApproverLevel,
        as: 'approver_levels',
        order: [['level', 'ASC']],
      },
    ],
    order: [[ValueBand, 'min_value', 'ASC']], // Order by value band to get the highest matching if multiple
  });

  let finalApprovalChain = [];
  let paymentTermsDeviationPresent = false;

  // Determine if payment terms deviation is present
  for (const lineItem of costSheet.cost_sheet_line_items) {
    if (lineItem.deviations && lineItem.deviations.some(dev => dev.deviation_type === 'payment_terms')) {
      paymentTermsDeviationPresent = true;
      break;
    }
  }

  // Select the most specific rule (e.g., highest min_value match)
  if (approvalRules.length > 0) {
    const bestMatchRule = approvalRules[approvalRules.length - 1]; // Last one will be the highest min_value
    finalApprovalChain = bestMatchRule.approver_levels.map(level => ({
      level: level.level,
      role: level.approver_role,
    }));
  }

  // Add CFO approval if payment terms deviation is present and not already in chain
  if (paymentTermsDeviationPresent && !finalApprovalChain.some(item => item.role === 'cfo' || item.role.includes('GCO'))) {
    // Assuming CFO is always L5 or L6 if added this way, adjust level as needed based on matrix design.
    // For simplicity, let's add it as a new level after existing ones or at a fixed high level.
    // This logic might need to be more sophisticated based on specific client rules for deviation approvals.
    // For now, appending it as an additional step or inserting at a specific level.
    const cfoLevel = finalApprovalChain.length > 0 ? finalApprovalChain[finalApprovalChain.length - 1].level + 1 : 1;
    finalApprovalChain.push({ level: cfoLevel, role: 'approver_cfo' }); // Use a specific CFO role type if available
    logger.info(`CFO approval added due to payment terms deviation for cost sheet ${costSheetId}`);
  }

  logger.info(`Determined approval chain for cost sheet ${costSheetId}: ${JSON.stringify(finalApprovalChain)}`);
  return finalApprovalChain;
};

const getNextApprover = async (costSheetId, currentApprovalLevel) => {
    const approvalChain = await determineApprovalChain(costSheetId);

    if (!approvalChain || approvalChain.length === 0) {
        throw new Error('No approval chain defined for this cost sheet.');
    }

    // Find the next pending level based on the currentApprovalLevel
    // If currentApprovalLevel is 0 (meaning not yet started approval), the next is the first in the chain.
    const nextLevelIndex = approvalChain.findIndex(item => item.level > currentApprovalLevel);

    if (nextLevelIndex !== -1) {
        return approvalChain[nextLevelIndex];
    } else {
        return null; // All levels approved or no further approvers
    }
};

module.exports = {
  determineApprovalChain,
  getNextApprover,
};
