export interface PurchaseRequisition {
  prNumber: string;
  description: string;
  lineItems: number;
  plant: string;
  type: 'Technical' | 'Commercial';
  createdAt: string;
}

export interface DraftCostSheet {
  id: string;
  costSheetNumber: string;
  prs: string[];
  updatedAt: string;
  requirementType: 'Technical' | 'Non-Technical';
  progress: number;
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
  priority: 'High' | 'Medium' | 'Critical' | 'Low';
}

export interface InitiatorDashboardData {
  totalActiveCostSheets: number;
  recentPRs: PurchaseRequisition[];
}

export interface ApproverDashboardData {
  pendingApprovals: Approval[];
  draftCostSheets: CostSheet[];
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  activeCostSheets: number;
}
