export interface PurchaseRequisition {
  prNumber: string;
  description: string;
  lineItems: number;
  plant: string;
  type: 'Technical' | 'Non-Technical';
  createdAt: string;
}

export interface DraftCostSheet {
  id: string | number;
  costSheetNumber: string;
  prs: string[];
  updatedAt: string;
  requirementType: 'Technical' | 'Non-Technical';
}

export interface UnifiedDashboardData {
  totalActiveCostSheets: number;
  pendingApprovals: Approval[];
  draftCostSheets: DraftCostSheet[];
  recentPRs: PurchaseRequisition[];
}

export interface Approval {
  id: string;
  prNumbers: string;
  description: string;
  createdBy: string;
  submittedDate: string;
  value: number;
  level: string;
  type: 'TECH' | 'COMM';
  daysAgo: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface InitiatorDashboardData {
  totalActiveCostSheets: number;
  recentPRs: PurchaseRequisition[];
}

export interface ApproverDashboardData {
  pendingApprovals: Approval[];
  draftCostSheets: DraftCostSheet[];
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  activeCostSheets: number;
}
