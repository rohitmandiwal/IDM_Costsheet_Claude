export interface PRLineItem {
  id?: number;
  prNumber: string;
  lineNumber: number;
  partCode: string;
  description: string;
  quantity: number;
  uom: string;
  estimatedValue?: number;
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
  lineItems?: PRLineItem[];
}

export interface FetchPRRequest {
  requirementType: 'technical' | 'non_technical';
  prNumbers: string[];
}

export interface FetchPRResponse {
  success: boolean;
  data: {
    costSheetId?: number;
    prSummaries: PRSummary[];
  };
}

export interface FetchPRLineItemsResponse {
  success: boolean;
  data: {
    lineItems: PRLineItem[];
  };
}

