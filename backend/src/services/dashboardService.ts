import { CostSheet } from '../models/costSheetModel';
import { User } from '../models/userModel';
import { Op } from 'sequelize';

interface RecentPR {
  prNumber: string;
  description: string;
  lineItems: number;
  plant: string;
  requirement_type: 'Technical' | 'Non-Technical';
  createdAt: string;
}

interface PendingApproval {
  id: string;
  total_value: number;
  status: string;
  created_at: Date;
  po_status?: string;
  po_date?: Date;
  final_approval_status?: string;
  currency: string;
  entry_type: string;
  requirement_type: 'Technical' | 'Non-Technical';
}

interface DraftCostSheet {
  id: string;
  updated_at: Date;
  po_status?: string;
  po_date?: Date;
  final_approval_status?: string;
  currency: string;
  entry_type: string;
}

export const getRecentPRs = (): RecentPR[] => {
  return [
    {
      prNumber: '13633801',
      description: 'Technical equipment procurement',
      lineItems: 5,
      plant: 'Plant A',
      requirement_type: 'Technical',
      createdAt: '2024-01-15',
    },
    {
      prNumber: '24678012',
      description: 'Office supplies and materials',
      lineItems: 3,
      plant: 'Plant B',
      requirement_type: 'Non-Technical',
      createdAt: '2024-01-14',
    },
    {
      prNumber: '35489023',
      description: 'Maintenance parts for machinery',
      lineItems: 8,
      plant: 'Plant A',
      requirement_type: 'Technical',
      createdAt: '2024-01-13',
    },
    {
      prNumber: '46790134',
      description: 'Safety equipment and PPE',
      lineItems: 4,
      plant: 'Plant C',
      requirement_type: 'Non-Technical',
      createdAt: '2024-01-12',
    },
    {
      prNumber: '57891245',
      description: 'Industrial chemicals and reagents',
      lineItems: 6,
      plant: 'Plant B',
      requirement_type: 'Technical',
      createdAt: '2024-01-11',
    },
  ];
};

export const getInitiatorDashboardMetrics = async (userId: number) => {
  const totalActiveCostSheets = await CostSheet.count({
    where: {
      initiator_id: userId,
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
  const pendingStatuses = ['Pending Approval'];

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
      requirement_type: 'Technical',
    },
  });

  const commercialCount = await CostSheet.count({
    where: {
      status: {
        [Op.in]: pendingStatuses,
      },
      requirement_type: 'Non-Technical',
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
      total_value: parseFloat(cs.total_value.toString()),
      status: cs.status,
      created_at: cs.created_at,
      po_status: cs.po_status,
      po_date: cs.po_date,
      final_approval_status: cs.final_approval_status,
      currency: cs.currency,
      entry_type: cs.entry_type,
      requirement_type: cs.requirement_type,
    })),
    draftCostSheets: draftCostSheets.map((cs) => ({
      id: cs.id,
      updated_at: cs.updated_at,
      po_status: cs.po_status,
      po_date: cs.po_date,
      final_approval_status: cs.final_approval_status,
      currency: cs.currency,
      entry_type: cs.entry_type,
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
