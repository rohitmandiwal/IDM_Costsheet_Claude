import { CostSheet, CostSheetCreationAttributes } from '../models/costSheetModel';
import { PRSummary, PRSummaryCreationAttributes } from '../models/prSummaryModel';
import { PRLineItem, PRLineItemCreationAttributes } from '../models/prLineItemModel';

export const createCostSheet = async (costSheetData: CostSheetCreationAttributes): Promise<CostSheet> => {
  return await CostSheet.create(costSheetData);
};

export const createPRSummary = async (prSummaryData: PRSummaryCreationAttributes): Promise<PRSummary> => {
  return await PRSummary.create(prSummaryData);
};

export const createPRLineItem = async (prLineItemData: PRLineItemCreationAttributes): Promise<PRLineItem> => {
  return await PRLineItem.create(prLineItemData);
};

export const findCostSheetById = async (costSheetId: number): Promise<CostSheet | null> => {
  return await CostSheet.findByPk(costSheetId);
};

export const findPRSummariesByCostSheetId = async (costSheetId: number): Promise<PRSummary[]> => {
  return await PRSummary.findAll({ where: { cost_sheet_id: costSheetId } });
};

export const findPRLineItemsByCostSheetId = async (costSheetId: number): Promise<PRLineItem[]> => {
  return await PRLineItem.findAll({ where: { cost_sheet_id: costSheetId } });
};
