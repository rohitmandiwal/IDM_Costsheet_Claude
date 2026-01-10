const { CostSheet, User, SapPr } = require('../models');
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
        requirement_type: pr.category,
        createdAt: pr.release_date
    }));
};

const getInitiatorDashboardMetrics = async (userId) => {
  const totalActiveCostSheets = await CostSheet.count({
    where: {
      initiator_id: userId,
      status: {
        [Op.notIn]: ['Draft'],
      },
    },
  });

  const recentPRs = await getRecentPRs();

  return {
    totalActiveCostSheets,
    recentPRs,
  };
};

const getApproverDashboardMetrics = async () => {
  const pendingStatuses = ['pending'];

  const pendingCount = await CostSheet.count({
    where: {
      status: {
        [Op.in]: pendingStatuses,
      },
    },
  });

  const technicalCount = await CostSheet.count({
    where: {
      status: {
        [Op.in]: pendingStatuses,
      },
      requirement_type: 'technical',
    },
  });

  const commercialCount = await CostSheet.count({
    where: {
      status: {
        [Op.in]: pendingStatuses,
      },
      requirement_type: 'non_technical',
    },
  });

  const totalValueResult = await CostSheet.sum('final_order_value', {
    where: {
      status: {
        [Op.in]: pendingStatuses,
      },
    },
  });

  const totalValue = totalValueResult || 0;

  const pendingApprovals = await CostSheet.findAll({
    where: {
      status: {
        [Op.in]: pendingStatuses,
      },
    },
    order: [['created_at', 'DESC']],
    limit: 10,
  });

  const draftCostSheets = await CostSheet.findAll({
    where: {
      status: 'Draft',
    },
    order: [['updated_at', 'DESC']],
    limit: 5,
  });

  return {
    pendingCount,
    technicalCount,
    commercialCount,
    totalValue: parseFloat(totalValue.toString()),
    pendingApprovals: pendingApprovals.map((cs) => ({
      id: cs.id,
      total_value: parseFloat(cs.final_order_value.toString()),
      status: cs.status,
      created_at: cs.created_at,
      requirement_type: cs.requirement_type,
    })),
    draftCostSheets: draftCostSheets.map((cs) => ({
      id: cs.id,
      updated_at: cs.updated_at,
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
        [Op.notIn]: ['Draft'],
      },
    },
  });

  return {
    totalUsers,
    activeUsers,
    activeCostSheets,
  };
};

module.exports = {
    getRecentPRs,
    getInitiatorDashboardMetrics,
    getApproverDashboardMetrics,
    getAdminDashboardMetrics
}
