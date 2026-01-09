export interface PurchaseRequisition {
  prNumber: string;
  description: string;
  lineItems: number;
  plant: string;
  type: 'Technical' | 'Non-Technical';
  createdAt: string;
}

export interface CostSheet {
  costSheetNumber: string;
  prNumber: string;
  amount: number;
  type: 'Technical' | 'Non-Technical';
  status: string;
  createdAt: string;
  progress?: number;
}

export interface InitiatorDashboardData {
  totalActiveCostSheets: number;
  recentPRs: PurchaseRequisition[];
}

export interface ApproverDashboardData {
  pendingApprovals: CostSheet[];
  draftCostSheets: CostSheet[];
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  activeCostSheets: number;
}
