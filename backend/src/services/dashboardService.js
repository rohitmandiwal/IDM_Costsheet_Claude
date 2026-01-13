const { CostSheet, User, SapPr, Approval, RoleAssignment, AuditLog, ApproverLevel, CostSheetPr, CostSheetLineItem, SapPrLineItem } = require('../models');
const { Op } = require('sequelize');

const getRecentPRs = async () => {
  const recentPrs = await SapPr.findAll({
    order: [['release_date', 'DESC']],
    limit: 5
  });

  return recentPrs.map(pr => ({
    prNumber: pr.pr_number,
    description: pr.description,
    plant: pr.plant_code,
    type: pr.category === 'technical' ? 'Technical' : 'Non-Technical',
    createdAt: pr.release_date,
    lineItems: 1, // Placeholder, as SapPr model doesn't have lineItems directly in this context
  }));
};

const getInitiatorDashboardMetrics = async (userId) => {
  const totalActiveCostSheets = await CostSheet.count({
    where: {
      initiator_id: userId,
      status: {
        [Op.notIn]: ['draft'],
      },
    },
  });

  const recentPRs = await getRecentPRs();

  return {
    totalActiveCostSheets,
    recentPRs,
  };
};

const getApproverDashboardMetrics = async (userId, userRoles) => {
  const pendingStatuses = ['pending'];
  const approverRoles = userRoles.filter(role => role.startsWith('approver_l') || role === 'admin');

  // Find approval levels assigned to the current user's roles
  const relevantApprovalLevels = await ApproverLevel.findAll({
    where: { approver_role: { [Op.in]: approverRoles } },
    attributes: ['level'],
    raw: true,
  });

  const levelsUserCanApprove = relevantApprovalLevels.map(al => al.level);

  // If the user has no approver roles, or admin role, they might not see specific levels by default,
  // but an admin would see all pending approvals. For now, we filter by specific levels.
  let pendingCostSheetsWhereClause = {
    status: { [Op.in]: pendingStatuses },
    // This assumes `current_approval_level` exists in CostSheet to track which level it's pending at.
    // If cost_sheet_id is 1, current_approval_level is 1. If 2 then 2 and so on.
    current_approval_level: { [Op.in]: levelsUserCanApprove },
  };

  if (userRoles.includes('admin')) {
    // Admins can see all pending cost sheets regardless of level
    pendingCostSheetsWhereClause = {
      status: { [Op.in]: pendingStatuses },
    };
  }

  const pendingCount = await CostSheet.count({
    where: pendingCostSheetsWhereClause,
  });

  const technicalCount = await CostSheet.count({
    where: {
      ...pendingCostSheetsWhereClause,
      requirement_type: 'technical',
    },
  });

  const commercialCount = await CostSheet.count({
    where: {
      ...pendingCostSheetsWhereClause,
      requirement_type: 'non_technical',
    },
  });

  const totalValueResult = await CostSheet.sum('final_order_value', {
    where: pendingCostSheetsWhereClause,
  });

  const totalValue = totalValueResult || 0;

  const pendingApprovals = await CostSheet.findAll({
    where: pendingCostSheetsWhereClause,
    include: [
      { model: User, as: 'initiator', attributes: ['full_name'] },
      {
        model: CostSheetPr,
        as: 'cost_sheet_prs', // Ensure this alias matches your association
        include: [
          {
            model: SapPr,
          }
        ]
      },
      {
        model: CostSheetLineItem,
        as: 'cost_sheet_line_items',
        include: [
          {
            model: SapPrLineItem,
            attributes: ['description']
          }
        ]
      },
      {
        model: Approval,
        as: 'approvals',
        where: {
          status: 'pending',
          ...(userRoles.includes('admin') ? {} : { level: { [Op.in]: levelsUserCanApprove } }),
        },
        required: false // LEFT JOIN
      }
    ],
    order: [['created_at', 'DESC']],
    limit: 10,
  });

  const draftCostSheets = await CostSheet.findAll({
    where: {
      initiator_id: userId, // Drafts are specific to the initiator
      status: 'draft',
    },
    order: [['updated_at', 'DESC']],
    limit: 5,
  });

  return {
    pendingCount,
    technicalCount,
    commercialCount,
    totalValue: parseFloat((totalValue || 0).toString()),
    pendingApprovals: pendingApprovals.map((cs) => {
      const estimatedPrValue = cs.cost_sheet_prs ? cs.cost_sheet_prs.reduce((sum, csp) => {
        const sapPr = csp.SapPr || csp.sap_pr;
        return sum + (sapPr ? parseFloat(sapPr.est_value || 0) : 0);
      }, 0) : 0;
      const displayValue = parseFloat((cs.final_order_value || 0).toString()) || estimatedPrValue;

      return {
        // id: cs.id, 
        id: cs.cost_sheet_number,
        prNumbers: cs.cost_sheet_prs ? cs.cost_sheet_prs.map(csp => csp.pr_number).join(', ') : '',
        description: cs.cost_sheet_line_items ? cs.cost_sheet_line_items.map(li => li.SapPrLineItem ? li.SapPrLineItem.description : 'No Description').join(', ') : 'No Description',
        value: displayValue,
        // status: cs.status, 
        submittedDate: cs.updated_at ? new Date(cs.updated_at).toLocaleDateString() : 'N/A',
        type: cs.requirement_type === 'technical' ? 'TECH' : 'COMM',
        createdBy: cs.initiator ? cs.initiator.full_name : 'Unknown',
        level: `Level ${cs.current_approval_level}`,
        priority: 'Medium',
      };
    }),
    draftCostSheets: draftCostSheets.map((cs) => ({
      id: cs.id,
      costSheetNumber: cs.cost_sheet_number,
      updatedAt: cs.updated_at,
      requirementType: cs.requirement_type,
      prs: cs.cost_sheet_prs ? cs.cost_sheet_prs.map(csp => csp.pr_number) : [],
    })),
  };
};

const getAdminDashboardMetrics = async () => {
  const totalUsers = await User.count();

  const activeUsers = await User.count({
    where: {
      is_active: true,
    },
  });

  const activeCostSheets = await CostSheet.count({
    where: {
      status: {
        [Op.notIn]: ['draft', 'rejected'],
      },
    },
  });

  return {
    totalUsers,
    activeUsers,
    activeCostSheets,
  };
};

const getUnifiedDashboardMetrics = async (userId, userRoles) => {
  // Get data for Initiator section
  const initiatorMetrics = await getInitiatorDashboardMetrics(userId);

  // Get data for Approver section
  const pendingStatuses = ['pending'];
  const approverRoles = userRoles.filter(role => role.startsWith('approver_l') || role === 'admin');

  const relevantApprovalLevels = await ApproverLevel.findAll({
    where: { approver_role: { [Op.in]: approverRoles } },
    attributes: ['level'],
    raw: true,
  });
  const levelsUserCanApprove = relevantApprovalLevels.map(al => al.level);

  let pendingCostSheetsWhereClause = {
    status: { [Op.in]: pendingStatuses },
    current_approval_level: { [Op.in]: levelsUserCanApprove },
  };

  if (userRoles.includes('admin')) {
    pendingCostSheetsWhereClause = {
      status: { [Op.in]: pendingStatuses },
    };
  }

  const pendingApprovals = await CostSheet.findAll({
    where: pendingCostSheetsWhereClause,
    include: [
      { model: User, as: 'initiator', attributes: ['full_name'] },
      {
        model: CostSheetPr,
        as: 'cost_sheet_prs',
        include: [
          {
            model: SapPr,
          }
        ]
      },
      {
        model: CostSheetLineItem,
        as: 'cost_sheet_line_items',
        include: [
          {
            model: SapPrLineItem,
            attributes: ['description']
          }
        ]
      },
      {
        model: Approval,
        as: 'approvals',
        where: {
          status: 'pending',
          ...(userRoles.includes('admin') ? {} : { level: { [Op.in]: levelsUserCanApprove } }),
        },
        required: false
      }
    ],
    order: [['created_at', 'DESC']],
    limit: 10,
  });

  const draftCostSheets = await CostSheet.findAll({
    where: {
      initiator_id: userId,
      status: 'draft',
    },
    include: [
      {
        model: CostSheetPr,
        as: 'cost_sheet_prs',
      },
    ],
    order: [['updated_at', 'DESC']],
    limit: 5,
  });

  const formattedPendingApprovals = pendingApprovals.map((cs) => {
    const estimatedPrValue = cs.cost_sheet_prs ? cs.cost_sheet_prs.reduce((sum, csp) => {
      const sapPr = csp.SapPr || csp.sap_pr;
      return sum + (sapPr ? parseFloat(sapPr.est_value || 0) : 0);
    }, 0) : 0;
    const displayValue = parseFloat((cs.final_order_value || 0).toString()) || estimatedPrValue;

    return {
      id: cs.cost_sheet_number,
      prNumbers: cs.cost_sheet_prs ? cs.cost_sheet_prs.map(csp => csp.pr_number).join(', ') : '',
      description: cs.cost_sheet_line_items ? cs.cost_sheet_line_items.map(li => li.SapPrLineItem ? li.SapPrLineItem.description : 'No Description').join(', ') : 'No Description',
      value: displayValue,
      submittedDate: cs.updated_at ? new Date(cs.updated_at).toLocaleDateString('en-US') : 'N/A', // Format date consistently
      type: cs.requirement_type === 'technical' ? 'TECH' : 'COMM',
      createdBy: cs.initiator ? cs.initiator.full_name : 'Unknown',
      level: `Level ${cs.current_approval_level}`,
      priority: 'Medium', // Placeholder for now,
      daysAgo: Math.floor((new Date().getTime() - new Date(cs.createdAt).getTime()) / (1000 * 60 * 60 * 24)) // Calculate days ago
    };
  });

  const formattedDraftCostSheets = draftCostSheets.map((cs) => ({
    id: cs.id,
    costSheetNumber: cs.cost_sheet_number,
    prs: cs.cost_sheet_prs ? cs.cost_sheet_prs.map(csp => csp.pr_number) : [],
    updatedAt: cs.updated_at ? new Date(cs.updated_at).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    requirementType: cs.requirement_type === 'technical' ? 'Technical' : 'Non-Technical',
    progress: Math.floor(Math.random() * 100), // Placeholder for progress
  }));

  return {
    totalActiveCostSheets: initiatorMetrics.totalActiveCostSheets,
    recentPRs: initiatorMetrics.recentPRs,
    pendingApprovals: formattedPendingApprovals,
    draftCostSheets: formattedDraftCostSheets,
  };
};


const getAuditLogs = async (filters) => {
  const whereClause = {};

  if (filters.userId) {
    whereClause.user_id = filters.userId;
  }
  if (filters.costSheetId) {
    whereClause.cost_sheet_id = filters.costSheetId;
  }
  if (filters.activityType) {
    whereClause.activity_type = filters.activityType;
  }
  if (filters.startDate && filters.endDate) {
    whereClause.created_at = {
      [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)],
    };
  } else if (filters.startDate) {
    whereClause.created_at = {
      [Op.gte]: new Date(filters.startDate),
    };
  } else if (filters.endDate) {
    whereClause.created_at = {
      [Op.lte]: new Date(filters.endDate),
    };
  }

  const auditLogs = await AuditLog.findAll({
    where: whereClause,
    include: [
      { model: User, attributes: ['id', 'full_name', 'email'] },
      { model: CostSheet, attributes: ['id', 'cost_sheet_number'] },
    ],
    order: [['created_at', 'DESC']],
  });

  return auditLogs;
};

module.exports = {
  getRecentPRs,
  getInitiatorDashboardMetrics,
  getApproverDashboardMetrics,
  getAdminDashboardMetrics,
  getUnifiedDashboardMetrics,
  getAuditLogs
};
