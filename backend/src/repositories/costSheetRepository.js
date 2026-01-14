const { CostSheet, CostSheetPr, CostSheetLineItem, SapPr, SapPrLineItem, VendorQuotation, User, SapVendor, Vendor, Deviation, SapPo, FinalizedDeal } = require('../models');

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
  const isCostSheetNumber = typeof costSheetId === 'string' && costSheetId.startsWith('CS-');
  const whereClause = isCostSheetNumber ? { cost_sheet_number: costSheetId } : { id: costSheetId };

  return await CostSheet.findOne({
    where: whereClause,
    include: [
      {
        model: User, // Initiator
        as: 'initiator', // Alias defined in CostSheet model
        attributes: ['id', 'full_name', 'email', 'department']
      },
      {
        model: CostSheetPr,
        as: 'cost_sheet_prs', // Alias defined in CostSheet model
        include: [{
          model: SapPr,
          // as: 'sap_pr', // Removed alias to use default or defined association alias
        }]
      },
      {
        model: CostSheetLineItem,
        as: 'cost_sheet_line_items', // Alias defined in CostSheet model
        include: [
          {
            model: SapPrLineItem,
            // as: 'sap_pr_line_item',
          },
          {
            model: VendorQuotation,
            as: 'vendor_quotations',
            include: [{
              model: Vendor, // Include vendor details for quotations
              as: 'vendor'
            }]
          },
          {
            model: Deviation,
            as: 'deviations', // Alias for Deviation model
            include: [
              { model: User, as: 'raisedByUser', attributes: ['id', 'full_name'] },
              { model: User, as: 'approvedByUser', attributes: ['id', 'full_name'] }
            ]
          },
          {
            model: FinalizedDeal,
            as: 'finalized_deal',
            include: [{ model: Vendor, as: 'vendor' }]
          }
        ]
      }
    ]
  });
};

const findLineItemsByCostSheetId = async (costSheetId) => {
  return await CostSheetLineItem.findAll({ where: { cost_sheet_id: costSheetId } });
};

const findOrCreateSapPr = async (prData, transaction) => {
  return await SapPr.findOrCreate({
    where: { pr_number: prData.pr_number },
    defaults: prData,
    transaction,
  });
};

const findOrCreateSapPrLineItem = async (lineItemData, transaction) => {
  return await SapPrLineItem.findOrCreate({
    where: {
      pr_number: lineItemData.pr_number,
      line_item_number: lineItemData.line_item_number,
    },
    defaults: lineItemData,
    transaction,
  });
};

const updateCostSheetDetails = async (id, data, transaction) => {
  const costSheet = await CostSheet.findByPk(id, { transaction });
  if (!costSheet) {
    throw new Error('Cost Sheet not found');
  }
  return await costSheet.update(data, { transaction });
};

const updateCostSheetLineItem = async (id, data, transaction) => {
  const lineItem = await CostSheetLineItem.findByPk(id, { transaction });
  if (!lineItem) {
    throw new Error('Cost Sheet Line Item not found');
  }
  return await lineItem.update(data, { transaction });
};

const createVendorQuotation = async (quotationData, transaction) => {
  return await VendorQuotation.create(quotationData, { transaction });
};

const updateVendorQuotation = async (id, data, transaction) => {
  const quotation = await VendorQuotation.findByPk(id, { transaction });
  if (!quotation) {
    throw new Error('Vendor Quotation not found');
  }
  return await quotation.update(data, { transaction });
};

const deleteVendorQuotation = async (id, transaction) => {
  const quotation = await VendorQuotation.findByPk(id, { transaction });
  if (!quotation) {
    throw new Error('Vendor Quotation not found');
  }
  return await quotation.destroy({ transaction });
};

const createDeviation = async (deviationData, transaction) => {
  return await Deviation.create(deviationData, { transaction });
};

const updateDeviation = async (id, data, transaction) => {
  const deviation = await Deviation.findByPk(id, { transaction });
  if (!deviation) {
    throw new Error('Deviation not found');
  }
  return await deviation.update(data, { transaction });
};

const findDeviationByLineItemId = async (lineItemId) => {
  return await Deviation.findOne({
    where: { line_item_id: lineItemId },
    include: [
      { model: User, as: 'raisedByUser', attributes: ['id', 'full_name'] },
      { model: User, as: 'approvedByUser', attributes: ['id', 'full_name'] }
    ]
  });
};

const findSapPosByPartCodeAndVendors = async (partCode, vendorCodes) => {
  const { Op } = require('sequelize');

  const whereClause = {
    part_code: partCode,
  };

  if (vendorCodes && vendorCodes.length > 0) {
    whereClause.vendor_code = {
      [Op.in]: vendorCodes,
    };
  }

  return await SapPo.findAll({
    where: whereClause,
    order: [['po_date', 'DESC']],
    limit: 10, // Limit to recent records
  });
};

module.exports = {
  createCostSheet,
  addPrToCostSheet,
  addLineItemToCostSheet,
  findCostSheetById,
  findLineItemsByCostSheetId,
  findOrCreateSapPr,
  findOrCreateSapPrLineItem,
  updateCostSheetDetails,
  updateCostSheetLineItem,
  createVendorQuotation,
  updateVendorQuotation,
  deleteVendorQuotation,
  createDeviation,
  updateDeviation,
  findDeviationByLineItemId,
  findSapPosByPartCodeAndVendors,
};
