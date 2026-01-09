export interface PRLineItem {
  prNumber: string;
  lineNumber: number;
  materialCode: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  deliveryDate?: string;
  plant: string;
  prPrice?: number;
  lastYearPrice?: number;
}

export interface PRSummary {
  prNumber: string;
  description: string;
  plant: string;
  requester: string;
  lineItemCount: number;
  estimatedValue: number;
}

export interface FetchPRRequest {
  requirementType: 'Technical' | 'Commercial';
  prNumbers: string[];
}

export interface FetchPRResponse {
  success: boolean;
  data: {
    costSheetId: number;
    prSummaries: PRSummary[];
  };
}

export interface FetchPRLineItemsResponse {
  success: boolean;
  data: {
    lineItems: PRLineItem[];
  };
}

export interface DemoPRsResponse {
  success: boolean;
  data: {
    demoPRs: string[];
  };
}
