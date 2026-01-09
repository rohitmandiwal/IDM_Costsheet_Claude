import { CostSheet } from '../models/costSheetModel';
import { User } from '../models/userModel';
import { Op } from 'sequelize';

interface RecentPR {
  prNumber: string;
  description: string;
  lineItems: number;
  plant: string;
  type: 'Technical' | 'Non-Technical';
  createdAt: string;
}

interface PendingApproval {
  id: string;
  cost_sheet_number: string;
  pr_number: string;
  description: string;
  plant: string;
  type: 'Technical' | 'Non-Technical';
  total_value: number;
  status: string;
  created_at: Date;
}

interface DraftCostSheet {
  id: string;
  cost_sheet_number: string;
  pr_number: string;
  description: string;
  progress: number;
  updated_at: Date;
}

export const getRecentPRs = (): RecentPR[] => {
  return [
    {
      prNumber: '13633801',
      description: 'Technical equipment procurement',
      lineItems: 5,
      plant: 'Plant A',
      type: 'Technical',
      createdAt: '2024-01-15',
    },
    {
      prNumber: '24678012',
      description: 'Office supplies and materials',
      lineItems: 3,
      plant: 'Plant B',
      type: 'Non-Technical',
      createdAt: '2024-01-14',
    },
    {
      prNumber: '35489023',
      description: 'Maintenance parts for machinery',
      lineItems: 8,
      plant: 'Plant A',
      type: 'Technical',
      createdAt: '2024-01-13',
    },
    {
      prNumber: '46790134',
      description: 'Safety equipment and PPE',
      lineItems: 4,
      plant: 'Plant C',
      type: 'Non-Technical',
      createdAt: '2024-01-12',
    },
    {
      prNumber: '57891245',
      description: 'Industrial chemicals and reagents',
      lineItems: 6,
      plant: 'Plant B',
      type: 'Technical',
      createdAt: '2024-01-11',
    },
  ];
};

export const getInitiatorDashboardMetrics = async (userId: number) => {
  const totalActiveCostSheets = await CostSheet.count({
    where: {
      created_by: userId,
      status: {
        [Op.notIn]: ['Draft'],
      },
    },
  });

  const recentPRs = getRecentPRs();

  return {
    totalActiveCostSheets,
    recentPRs,
  };
};

export const getApproverDashboardMetrics = async () => {
  const pendingStatuses = ['Pending L1', 'Pending L2', 'Pending L3'];

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
      type: 'Technical',
    },
  });

  const commercialCount = await CostSheet.count({
    where: {
      status: {
        [Op.in]: pendingStatuses,
      },
      type: 'Non-Technical',
    },
  });

  const totalValueResult = await CostSheet.sum('total_value', {
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
      cost_sheet_number: cs.cost_sheet_number,
      pr_number: cs.pr_number,
      description: cs.description,
      plant: cs.plant,
      type: cs.type,
      total_value: parseFloat(cs.total_value.toString()),
      status: cs.status,
      created_at: cs.created_at,
    })),
    draftCostSheets: draftCostSheets.map((cs) => ({
      id: cs.id,
      cost_sheet_number: cs.cost_sheet_number,
      pr_number: cs.pr_number,
      description: cs.description,
      progress: cs.progress,
      updated_at: cs.updated_at,
    })),
  };
};

export const getAdminDashboardMetrics = async () => {
  const totalUsers = await User.count();

  const activeUsers = await User.count({
    where: {
      status: 'Active',
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
