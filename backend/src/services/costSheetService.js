const { fetchPRsFromSAP } = require('./sapService');
const {
  createCostSheet,
  addPrToCostSheet,
  addLineItemToCostSheet,
  findCostSheetById,
  findLineItemsByCostSheetId
} = require('../repositories/costSheetRepository');
const logger = require('../utils/logger');

const createCostSheetFromPRs = async (request) => {
  const { initiatorId, requirementType, prNumbers } = request;

  logger.info(`Creating cost sheet for initiator ${initiatorId}, requirement type: ${requirementType}`);

  const prData = await fetchPRsFromSAP(prNumbers);

  const costSheet = await createCostSheet({
    initiator_id: initiatorId,
    requirement_type: requirementType,
    status: 'Draft',
    cost_sheet_number: `CS-${Date.now()}` // Example number
  });

  logger.info(`Cost sheet created with ID: ${costSheet.id}`);

  for (const pr of prData) {
    await addPrToCostSheet(costSheet.id, pr.prNumber);

    for (const lineItem of pr.lineItems) {
      await addLineItemToCostSheet({
        cost_sheet_id: costSheet.id,
        sap_line_item_id: lineItem.sap_line_item_id, // This assumes sapService provides this
        s_no: lineItem.lineNumber,
        buyer_remarks: '',
        status: 'pending',
      });
    }
  }

  logger.info(`Successfully created cost sheet with ${prData.length} PRs and line items`);

  return {
    costSheetId: costSheet.id,
    prSummaries: prData.map(pr => ({
        prNumber: pr.prNumber,
        description: pr.description,
        plant: pr.plant,
        requester: pr.requester,
        lineItemCount: pr.lineItems.length,
        estimatedValue: pr.est_value
    }))
  };
};

module.exports = {
    createCostSheetFromPRs
}
