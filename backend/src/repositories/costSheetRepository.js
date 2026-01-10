const { CostSheet, CostSheetPr, CostSheetLineItem } = require('../models');

const createCostSheet = async (costSheetData) => {
  return await CostSheet.create(costSheetData);
};

const addPrToCostSheet = async (costSheetId, prNumber) => {
    return await CostSheetPr.create({
        cost_sheet_id: costSheetId,
        pr_number: prNumber,
    });
};

const addLineItemToCostSheet = async (lineItemData) => {
    return await CostSheetLineItem.create(lineItemData);
};

const findCostSheetById = async (costSheetId) => {
  return await CostSheet.findByPk(costSheetId, {
      include: [
          { model: CostSheetLineItem, include: [/* other models */] }
      ]
  });
};

const findLineItemsByCostSheetId = async (costSheetId) => {
  return await CostSheetLineItem.findAll({ where: { cost_sheet_id: costSheetId } });
};

module.exports = {
    createCostSheet,
    addPrToCostSheet,
    addLineItemToCostSheet,
    findCostSheetById,
    findLineItemsByCostSheetId
}
