const { CostSheet, CostSheetLineItem, ApprovalRule, ApproverLevel, Deviation, User } = require('../models');
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

  // Use the total finalized value from the cost sheet header
  // Fallback to 0 if not set (e.g., specific logic for 0 value can range start at 0)
  const totalValue = parseFloat(costSheet.final_order_value) || 0;
  const requirementType = costSheet.requirement_type; // 'technical' or 'non_technical'

  // Find matching approval rules
  const approvalRules = await ApprovalRule.findAll({
    where: {
      category: requirementType,
      min_value: { [Op.lte]: totalValue },
      [Op.or]: [
        { max_value: { [Op.gte]: totalValue } },
        { max_value: null },
      ],
    },
    include: [
      {
        model: ApproverLevel,
        as: 'approver_levels',
      },
    ],
    order: [['min_value', 'ASC']], // Order by min_value to get the most specific match
  });

  // Ensure approver_levels within each rule are sorted (Sequelize include order can be tricky with associations sometimes)
  approvalRules.forEach(rule => {
    if (rule.approver_levels) {
      rule.approver_levels.sort((a, b) => a.level - b.level);
    }
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
    // For simplicity, let's add it as an additional step or inserting at a specific level.
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

const getApprovalChainForCostSheet = async (costSheetId) => {
  const approvalChain = await determineApprovalChain(costSheetId);
  const { Approval } = require('../models');

  // Fetch actual approval records for this cost sheet
  const approvals = await Approval.findAll({
    where: { cost_sheet_id: costSheetId },
    include: [
      {
        model: User,
        as: 'approverUser',
        attributes: ['id', 'full_name']
      }
    ],
    order: [['level', 'ASC']]
  });

  // Map approval chain with actual statuses
  const approvalChainWithStatus = approvalChain.map(chainItem => {
    const approval = approvals.find(a => a.level === chainItem.level);
    return {
      level: chainItem.level,
      role: chainItem.role,
      status: approval ? approval.status : 'pending',
      approver_name: approval?.approverUser?.full_name || null,
      comments: approval?.comments || null,
      updated_at: approval?.updated_at || null
    };
  });

  return approvalChainWithStatus;
};

/**
 * Calculate approval chain dynamically based on total value and requirement type
 * This is used for real-time preview before cost sheet is created/submitted
 */
const calculateApprovalChainByValue = async (totalValue, requirementType) => {
  logger.info(`Calculating approval chain for value: ${totalValue}, type: ${requirementType}`);

  // Find matching approval rules
  const approvalRules = await ApprovalRule.findAll({
    where: {
      category: requirementType,
      min_value: { [Op.lte]: totalValue },
      [Op.or]: [
        { max_value: { [Op.gte]: totalValue } },
        { max_value: null },
      ],
    },
    include: [
      {
        model: ApproverLevel,
        as: 'approver_levels',
      },
    ],
    order: [['min_value', 'ASC']],
  });

  // Ensure approver_levels within each rule are sorted
  approvalRules.forEach(rule => {
    if (rule.approver_levels) {
      rule.approver_levels.sort((a, b) => a.level - b.level);
    }
  });

  let finalApprovalChain = [];

  // Select the most specific rule
  if (approvalRules.length > 0) {
    const bestMatchRule = approvalRules[approvalRules.length - 1];
    finalApprovalChain = bestMatchRule.approver_levels.map(level => ({
      level: level.level,
      role: level.approver_role,
      status: 'pending', // All pending for preview
      approver_name: null,
      comments: null,
      updated_at: null
    }));
  }

  logger.info(`Calculated approval chain: ${JSON.stringify(finalApprovalChain)}`);
  return finalApprovalChain;
};

module.exports = {
  determineApprovalChain,
  getNextApprover,
  getApprovalChainForCostSheet,
  calculateApprovalChainByValue,
};
