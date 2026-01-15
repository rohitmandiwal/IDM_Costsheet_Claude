import { apiClient } from '../lib/api-client';

export const historyService = {
    getCostSheetHistory: async (costSheetId: string, filters?: {
        activityType?: string;
        userRole?: string;
        startDate?: string;
        endDate?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters?.activityType) params.append('activityType', filters.activityType);
        if (filters?.userRole) params.append('userRole', filters.userRole);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await apiClient.get(`/api/history/cost-sheet/${costSheetId}/history?${params.toString()}`);
        return response.data.data;
    },

    getHistoryTimeline: async (costSheetId: string) => {
        const response = await apiClient.get(`/api/history/cost-sheet/${costSheetId}/timeline`);
        return response.data.data;
    },

    createChangeRequest: async (costSheetId: string, requestData: {
        requestType: string;
        affectedFields?: string[];
        changeReason: string;
        detailedComments: string;
        priority?: string;
    }) => {
        const response = await apiClient.post(`/api/history/cost-sheet/${costSheetId}/change-request`, requestData);
        return response.data.data;
    },

    getChangeRequests: async (costSheetId: string) => {
        const response = await apiClient.get(`/api/history/cost-sheet/${costSheetId}/change-requests`);
        return response.data.data;
    },

    resolveChangeRequest: async (changeRequestId: number, resolution: string) => {
        const response = await apiClient.put(`/api/history/change-request/${changeRequestId}/resolve`, { resolution });
        return response.data.data;
    },
};
