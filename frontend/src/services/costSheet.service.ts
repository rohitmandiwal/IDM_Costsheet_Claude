import { apiClient } from '../lib/api-client';
import type { FetchPRRequest, FetchPRResponse, FetchPRLineItemsResponse, DemoPRsResponse, PRSummary, PRLineItem } from '../types/costSheet.types';

export const costSheetService = {
  async fetchPRs(requirementType: 'Technical' | 'Commercial', prNumbers: string[]): Promise<{ costSheetId: number; prSummaries: PRSummary[] }> {
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

  async getDemoPRs(): Promise<string[]> {
    const response = await apiClient.get<DemoPRsResponse>('/api/cost-sheets/demo-prs');
    return response.data.data.demoPRs;
  },
};
