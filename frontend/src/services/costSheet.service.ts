import { apiClient } from '../lib/api-client';
import type { FetchPRRequest, FetchPRResponse, FetchPRLineItemsResponse, PRSummary, PRLineItem } from '../types/costSheet.types';

export const costSheetService = {
  async fetchPRs(requirementType: 'technical' | 'non_technical', prNumbers: string[]): Promise<{ costSheetId?: number; prSummaries: PRSummary[] }> {
    const payload: FetchPRRequest = {
      requirementType,
      prNumbers,
    };

    const response = await apiClient.post<FetchPRResponse>('/api/cost-sheets/fetch-pr', payload);
    return {
      costSheetId: response.data.data.costSheetId,
      prSummaries: response.data.data.prSummaries,
    };
  },

  async fetchPRLineItems(costSheetId: number): Promise<PRLineItem[]> {
    const response = await apiClient.get<FetchPRLineItemsResponse>(`/api/cost-sheets/${costSheetId}/line-items`);
    return response.data.data.lineItems;
  },

  async createCostSheet(requirementType: 'technical' | 'non_technical', prNumbers: string[], selectedLineItemIds: number[]) {
    const response = await apiClient.post('/api/cost-sheets', {
      requirementType,
      prNumbers,
      selectedLineItemIds
    });
    return response.data.data;
  },

  async submitCostSheet(id: number) {
    const response = await apiClient.post(`/api/cost-sheets/${id}/submit`);
    return response.data;
  },

  async getPreviousPurchaseRecords(partCode: string, vendorCodes?: string[]) {
    const response = await apiClient.post('/api/cost-sheets/previous-purchase-records', {
      partCode,
      vendorCodes
    });
    return response.data.data;
  },

  async getCostSheetById(id: number | string) {
    const response = await apiClient.get(`/api/cost-sheets/${id}`);
    return response.data.data;
  },

  async performApprovalAction(id: number | string, action: 'approve' | 'reject' | 'send_back', comments?: string) {
    const response = await apiClient.post(`/api/cost-sheets/${id}/approve`, {
      action,
      comments
    });
    return response.data;
  },

  async calculateApprovalChain(totalValue: number, requirementType: 'technical' | 'non_technical') {
    const response = await apiClient.post('/api/cost-sheets/calculate-approval-chain', {
      totalValue,
      requirementType
    });
    return response.data.data;
  },

  async selectVendorAndDeviation(lineItemId: number, finalizedVendorId: number, deviationData?: any) {
    const response = await apiClient.put(`/api/cost-sheets/line-items/${lineItemId}/select-vendor-and-deviation`, {
      finalizedVendorId,
      deviation: deviationData
    });
    return response.data.data;
  }
};
