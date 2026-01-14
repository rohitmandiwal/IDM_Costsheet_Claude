const FinalizedDeal = require('../models/finalizedDealModel');
const { Vendor, VendorQuotation, CostSheetLineItem } = require('../models');

/**
 * Create or update a finalized deal
 */
const upsertFinalizedDeal = async (data, transaction) => {
    const { line_item_id } = data;

    const existingDeal = await FinalizedDeal.findOne({
        where: { line_item_id },
        transaction
    });

    if (existingDeal) {
        return await existingDeal.update(data, { transaction });
    } else {
        return await FinalizedDeal.create(data, { transaction });
    }
};

/**
 * Get finalized deal by line item ID
 */
const getFinalizedDealByLineItemId = async (lineItemId, transaction) => {
    return await FinalizedDeal.findOne({
        where: { line_item_id: lineItemId },
        include: [
            {
                model: Vendor,
                as: 'vendor',
            },
            {
                model: VendorQuotation,
                as: 'quotation',
            }
        ],
        transaction
    });
};

/**
 * Update finalized deal
 */
const updateFinalizedDeal = async (id, data, transaction) => {
    const deal = await FinalizedDeal.findByPk(id, { transaction });
    if (!deal) {
        throw new Error('Finalized deal not found');
    }
    return await deal.update(data, { transaction });
};

/**
 * Delete finalized deal
 */
const deleteFinalizedDeal = async (lineItemId, transaction) => {
    const deal = await FinalizedDeal.findOne({
        where: { line_item_id: lineItemId },
        transaction
    });

    if (deal) {
        return await deal.destroy({ transaction });
    }
    return null;
};

module.exports = {
    upsertFinalizedDeal,
    getFinalizedDealByLineItemId,
    updateFinalizedDeal,
    deleteFinalizedDeal,
};
