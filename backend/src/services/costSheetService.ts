import { fetchPRsFromSAP } from './sapService';
import {
  createCostSheet,
  createPRSummary,
  createPRLineItem,
  findPRSummariesByCostSheetId,
  findPRLineItemsByCostSheetId
} from '../repositories/costSheetRepository';
import logger from '../utils/logger';

interface CreateCostSheetFromPRsRequest {
  initiatorId: number;
  requirementType: 'Technical' | 'Non-Technical';
  prNumbers: string[];
}

interface PRSummaryResponse {
  prNumber: string;
  description: string;
  plant: string;
  requester: string;
  lineItemCount: number;
  estimatedValue: number;
}

interface CreateCostSheetResponse {
  costSheetId: number;
  prSummaries: PRSummaryResponse[];
}

export const createCostSheetFromPRs = async (request: CreateCostSheetFromPRsRequest): Promise<CreateCostSheetResponse> => {
  const { initiatorId, requirementType, prNumbers } = request;

  logger.info(`Creating cost sheet for initiator ${initiatorId}, requirement type: ${requirementType}`);

  const prData = await fetchPRsFromSAP(prNumbers);

  const costSheet = await createCostSheet({
    initiator_id: initiatorId,
    requirement_type: requirementType,
    status: 'Draft',
    total_value: 0,
    currency: 'INR',
    entry_type: 'New Request',
  });

  logger.info(`Cost sheet created with ID: ${costSheet.id}`);

  const prSummaries: PRSummaryResponse[] = [];

  for (const pr of prData) {
    await createPRSummary({
      cost_sheet_id: costSheet.id,
      pr_number: pr.prNumber,
      description: pr.description,
      plant: pr.plant,
      requester: pr.requester,
      line_item_count: pr.lineItemCount,
      estimated_value: pr.estimatedValue,
    });

    prSummaries.push({
      prNumber: pr.prNumber,
      description: pr.description,
      plant: pr.plant,
      requester: pr.requester,
      lineItemCount: pr.lineItemCount,
      estimatedValue: pr.estimatedValue,
    });

    for (const lineItem of pr.lineItems) {
      await createPRLineItem({
        cost_sheet_id: costSheet.id,
        pr_number: lineItem.prNumber,
        line_number: lineItem.lineNumber,
        part_code: lineItem.partCode,
        description: lineItem.description,
        quantity: lineItem.quantity,
        uom: lineItem.uom,
        plant: lineItem.plant,
        pr_price: lineItem.prPrice,
        last_year_price: lineItem.lastYearPrice,
        is_selected: true,
        specifications: lineItem.specifications,
      });
    }
  }

  logger.info(`Successfully created cost sheet with ${prSummaries.length} PRs and line items`);

  return {
    costSheetId: costSheet.id,
    prSummaries,
  };
};
