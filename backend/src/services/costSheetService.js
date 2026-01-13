const { fetchPRsFromSAP, createPoInSap } = require('./sapService');
const {
    createCostSheet: createCostSheetRepo,
    addPrToCostSheet,
    addLineItemToCostSheet,
    findCostSheetById: findCostSheetByIdRepo,
    findLineItemsByCostSheetId,
    findOrCreateSapPr,
    findOrCreateSapPrLineItem,
    updateCostSheetDetails,
    updateCostSheetLineItem,
    createVendorQuotation: createVendorQuotationRepo,
    updateVendorQuotation: updateVendorQuotationRepo,
    deleteVendorQuotation: deleteVendorQuotationRepo,
    createDeviation,
    updateDeviation,
    findDeviationByLineItemId,
} = require('../repositories/costSheetRepository');
const {
    SapPr,
    SapPrLineItem,
    sequelize, // Import sequelize for transactions
    Approval, // Import Approval model for submission
    AuditLog, // Import AuditLog model for logging
    PoRequest,
} = require('../models');
const logger = require('../utils/logger');
const approvalService = require('./approvalService'); // Import approval service

const createCostSheetFromPRs = async (request) => {
    const { prNumbers, requirementType } = request;

    logger.info(`Fetching and persisting PR data for PRs: ${prNumbers.join(', ')}`);

    const sapPrData = await fetchPRsFromSAP(prNumbers);
    const prSummaries = [];
    const sapPrLineItemIds = [];

    const invalidPrs = sapPrData.filter(pr => {
        return pr.category !== requirementType;
    });

    if (invalidPrs.length > 0) {
        const invalidPrNumbers = invalidPrs.map(pr => pr.prNumber).join(', ');
        // Assuming binary choice for now: if not technical, it's non_technical, and vice versa.
        const suggestedType = requirementType === 'technical' ? 'commercial (non-technical)' : 'technical';
        throw new Error(`The following PRs do not match the requirement type '${requirementType}': ${invalidPrNumbers}. Try with ${suggestedType} requirement.`);
    }

    const t = await sequelize.transaction();
    try {
        for (const pr of sapPrData) {
            const [sapPr] = await findOrCreateSapPr({
                pr_number: pr.prNumber,
                release_date: pr.releaseDate || null,
                accepted_date: pr.acceptedDate || null,
                requester: pr.requester,
                plant_code: pr.plant,
                description: pr.description,
                est_value: pr.estimatedValue,
                currency: pr.currency || 'INR',
                category: requirementType, // Assuming category is derived from requirementType
            }, t);

            prSummaries.push({
                prNumber: sapPr.pr_number,
                description: sapPr.description,
                plant: sapPr.plant_code,
                requester: sapPr.requester,
                lineItemCount: pr.lineItems.length,
                estimatedValue: sapPr.est_value,
                lineItems: [] // Will populate in inner loop
            });

            const currentPrSummary = prSummaries[prSummaries.length - 1];

            for (const lineItem of pr.lineItems) {
                const [sapPrLineItem] = await findOrCreateSapPrLineItem({
                    pr_number: sapPr.pr_number,
                    line_item_number: lineItem.lineNumber,
                    part_code: lineItem.partCode,
                    description: lineItem.description,
                    qty: lineItem.quantity,
                    uom: lineItem.uom,
                    plant_code: lineItem.plant,
                    pr_price: lineItem.prPrice,
                    currency: lineItem.currency || 'INR',
                    earlier_po_est: lineItem.lastYearPrice || null,
                }, t);

                sapPrLineItemIds.push(sapPrLineItem.id);

                currentPrSummary.lineItems.push({
                    id: sapPrLineItem.id,
                    prNumber: sapPrLineItem.pr_number,
                    lineNumber: sapPrLineItem.line_item_number,
                    partCode: sapPrLineItem.part_code,
                    description: sapPrLineItem.description,
                    quantity: parseFloat(sapPrLineItem.qty),
                    uom: sapPrLineItem.uom,
                    plant: sapPrLineItem.plant_code,
                    prPrice: parseFloat(sapPrLineItem.pr_price),
                    lastYearPrice: sapPrLineItem.earlier_po_est ? parseFloat(sapPrLineItem.earlier_po_est) : null
                });
            }
        }
        await t.commit();
    } catch (error) {
        await t.rollback();
        logger.error(`Error in createCostSheetFromPRs (persisting SAP data): ${error.message}`);
        throw error;
    }

    return { prSummaries, sapPrLineItemIds };
};

const createCostSheet = async (initiatorId, prNumbers, selectedSapPrLineItemIds, requirementType) => {
    const t = await sequelize.transaction();
    try {
        const costSheetNumber = `CS-${Date.now()}`;
        const newCostSheet = await createCostSheetRepo({
            cost_sheet_number: costSheetNumber,
            requirement_type: requirementType,
            initiator_id: initiatorId,
            status: 'draft', // Initial status
        }, t);

        // Link PRs to Cost Sheet
        for (const prNumber of prNumbers) {
            await addPrToCostSheet(newCostSheet.id, prNumber, t);
        }

        // Add selected line items to Cost Sheet
        for (const sapLineItemId of selectedSapPrLineItemIds) {
            await addLineItemToCostSheet({
                cost_sheet_id: newCostSheet.id,
                sap_line_item_id: sapLineItemId,
                status: 'pending',
            }, t);
        }

        await t.commit();
        return findCostSheetByIdRepo(newCostSheet.id);
    } catch (error) {
        await t.rollback();
        logger.error(`Error creating cost sheet: ${error.message}`);
        throw error;
    }
};

const getCostSheetById = async (id) => {
    const costSheet = await findCostSheetByIdRepo(id);
    if (!costSheet) {
        return null;
    }

    // Fetch approval chain with statuses
    const { getApprovalChainForCostSheet } = require('./approvalService');
    try {
        const approvalChain = await getApprovalChainForCostSheet(costSheet.id);
        // Add approval chain to the cost sheet object
        return {
            ...costSheet.toJSON(),
            approval_chain: approvalChain
        };
    } catch (error) {
        logger.error(`Error fetching approval chain for cost sheet ${id}: ${error.message}`);
        // Return cost sheet without approval chain if there's an error
        return costSheet;
    }
};

const updateCostSheet = async (id, updateData) => {
    const t = await sequelize.transaction();
    try {
        // Update main CostSheet details
        if (updateData.costSheetDetails) {
            await updateCostSheetDetails(id, updateData.costSheetDetails, t);
        }

        // Update line items and their quotations
        if (updateData.lineItems && Array.isArray(updateData.lineItems)) {
            for (const lineItemData of updateData.lineItems) {
                const { id: lineItemId, vendor_quotations, deviation, ...lineItemDetails } = lineItemData;
                await updateCostSheetLineItem(lineItemId, lineItemDetails, t);

                if (vendor_quotations && Array.isArray(vendor_quotations)) {
                    for (const quotationData of vendor_quotations) {
                        if (quotationData.id) {
                            // Update existing quotation
                            await updateVendorQuotationRepo(quotationData.id, quotationData, t);
                        } else {
                            // Create new quotation
                            await createVendorQuotationRepo({ ...quotationData, line_item_id: lineItemId }, t);
                        }
                    }
                }
                // TODO: Handle deletions of vendor quotations if needed

                // Handle deviation updates for the line item
                if (deviation) {
                    const { id: deviationId, ...deviationDetails } = deviation;
                    if (deviationId) {
                        await updateDeviation(deviationId, deviationDetails, t);
                    } else {
                        await createDeviation({ ...deviationDetails, line_item_id: lineItemId }, t);
                    }
                }
            }
        }

        await t.commit();
        return findCostSheetByIdRepo(id);
    } catch (error) {
        await t.rollback();
        logger.error(`Error updating cost sheet: ${error.message}`);
        throw error;
    }
};

const createVendorQuotation = async (lineItemId, quotationData) => {
    const t = await sequelize.transaction();
    try {
        const newQuotation = await createVendorQuotationRepo({ ...quotationData, line_item_id: lineItemId }, t);
        await t.commit();
        return newQuotation;
    } catch (error) {
        await t.rollback();
        logger.error(`Error creating vendor quotation: ${error.message}`);
        throw error;
    }
};

const updateVendorQuotation = async (id, updateData) => {
    const t = await sequelize.transaction();
    try {
        const updatedQuotation = await updateVendorQuotationRepo(id, updateData, t);
        await t.commit();
        return updatedQuotation;
    } catch (error) {
        await t.rollback();
        logger.error(`Error updating vendor quotation: ${error.message}`);
        throw error;
    }
};

const deleteVendorQuotation = async (id) => {
    const t = await sequelize.transaction();
    try {
        await deleteVendorQuotationRepo(id, t);
        await t.commit();
        return { message: 'Vendor quotation deleted successfully.' };
    } catch (error) {
        await t.rollback();
        logger.error(`Error deleting vendor quotation: ${error.message}`);
        throw error;
    }
};

const selectVendorAndDeviation = async (lineItemId, finalizedVendorId, deviationData, initiatorId) => {
    const t = await sequelize.transaction();
    try {
        // Update the CostSheetLineItem with the finalized vendor
        await updateCostSheetLineItem(lineItemId, { finalized_vendor_id: finalizedVendorId }, t);

        // Handle deviation if provided
        if (deviationData) {
            const existingDeviation = await findDeviationByLineItemId(lineItemId);
            if (existingDeviation) {
                await updateDeviation(existingDeviation.id, { ...deviationData, raised_by: initiatorId }, t);
            } else {
                await createDeviation({ ...deviationData, line_item_id: lineItemId, raised_by: initiatorId }, t);
            }
        }

        // --- Recalculate and Update Final Order Value for the Cost Sheet ---
        // 1. Fetch all line items for this cost sheet to calculate sum
        const currentLineItem = await findLineItemsByCostSheetId(lineItemId);
        if (currentLineItem && currentLineItem.length > 0) {
            const costSheetId = currentLineItem[0].cost_sheet_id;

            // Need full details including quotations to calculate value
            const fullCostSheet = await findCostSheetByIdRepo(costSheetId);

            let totalValue = 0;
            if (fullCostSheet && fullCostSheet.cost_sheet_line_items) {
                for (const item of fullCostSheet.cost_sheet_line_items) {
                    // Use the newly set finalized_vendor_id for the current item if not reflected yet? 
                    // findCostSheetByIdRepo might check DB. We just updated DB in this transaction. 
                    // BUT findCostSheetByIdRepo might not use the transaction `t`? 
                    // If repo doesn't accept transaction, we might read stale data OR lock issues.
                    // Ideally pass transaction to repo, but standard repo might not support it easily.
                    // Assuming read-after-write within transaction behaves or we calc manually.

                    const vendorId = (item.id === parseInt(lineItemId)) ? finalizedVendorId : item.finalized_vendor_id;

                    if (vendorId) {
                        const selectedQuote = item.vendor_quotations.find(vq => vq.vendor_id === parseInt(vendorId));
                        if (selectedQuote) {
                            let quoteValue = parseFloat(selectedQuote.total_value || 0);

                            // If total_value is missing, calculate it manually
                            if (quoteValue <= 0) {
                                const qty = parseFloat(item.SapPrLineItem?.qty || item.s_no || 0); // s_no is likely not qty, check model
                                // Actually item.SapPrLineItem is usually where qty is. Or item might have seeded qty if manual?
                                // Let's check item.SapPrLineItem.qty
                                const actualQty = parseFloat(item.SapPrLineItem?.qty || 0);
                                const price = parseFloat(selectedQuote.r1_negotiated_per_unit || 0);
                                const gst = parseFloat(selectedQuote.gst || 18); // Default 18 if missing?
                                const freight = parseFloat(selectedQuote.freight || 0);
                                const other = parseFloat(selectedQuote.other_charges || 0);

                                const base = price * actualQty;
                                const tax = base * (gst / 100);
                                quoteValue = base + tax + freight + other;
                            }

                            totalValue += quoteValue;
                        }
                    }
                }

                // Update Cost Sheet Header
                await updateCostSheetDetails(costSheetId, { final_order_value: totalValue }, t);
            }
        }
        // -------------------------------------------------------------------

        await t.commit();
        // After updating, return the entire cost sheet for a comprehensive view
        const lineItem = await findLineItemsByCostSheetId(lineItemId);
        if (lineItem && lineItem.length > 0) {
            return findCostSheetByIdRepo(lineItem[0].cost_sheet_id);
        }
        return null;

    } catch (error) {
        await t.rollback();
        logger.error(`Error in selectVendorAndDeviation: ${error.message}`);
        throw error;
    }
};

const submitCostSheet = async (costSheetId, initiatorId, comments) => {
    const t = await sequelize.transaction();
    try {
        const costSheet = await findCostSheetByIdRepo(costSheetId);
        if (!costSheet) {
            throw new Error('Cost Sheet not found.');
        }

        if (costSheet.status !== 'draft' && costSheet.status !== 'sent_back') {
            throw new Error(`Cost Sheet cannot be submitted in status: ${costSheet.status}`);
        }

        // Determine approval chain
        const approvalChain = await approvalService.determineApprovalChain(costSheetId);
        if (!approvalChain || approvalChain.length === 0) {
            throw new Error('No approval chain found for this cost sheet.');
        }

        // Update CostSheet status and set next approver level
        const firstApproverLevel = approvalChain[0];
        await updateCostSheetDetails(costSheetId, {
            status: 'pending',
            current_approval_level: firstApproverLevel.level, // Assuming a column `current_approval_level` exists in cost_sheets
            // You might need to add `current_approver_role` or similar if needed for direct assignment
        }, t);

        // Create initial Approval record
        await Approval.create({
            cost_sheet_id: costSheetId,
            level: firstApproverLevel.level,
            approver_id: null, // This will be set by the actual approver action, for now just pending
            status: 'pending',
            comments: comments || 'Cost sheet submitted for approval.',
        }, { transaction: t });

        // Create Audit Log entry
        await AuditLog.create({
            user_id: initiatorId,
            cost_sheet_id: costSheetId,
            activity_type: 'SUBMIT_FOR_APPROVAL',
            description: `Cost sheet ${costSheet.cost_sheet_number} submitted for approval by initiator.`,
        }, { transaction: t });

        await t.commit();
        return findCostSheetByIdRepo(costSheetId);

    } catch (error) {
        await t.rollback();
        logger.error(`Error submitting cost sheet ${costSheetId}: ${error.message}`);
        throw error;
    }
};

const performApprovalAction = async (costSheetId, approverId, action, comments, justification = null) => {
    const t = await sequelize.transaction();
    try {
        const costSheet = await findCostSheetByIdRepo(costSheetId);
        if (!costSheet) {
            throw new Error('Cost Sheet not found.');
        }

        if (costSheet.status === 'approved' || costSheet.status === 'rejected') {
            throw new Error(`Cannot perform action on a ${costSheet.status} cost sheet.`);
        }

        const currentApproval = await Approval.findOne({
            where: {
                cost_sheet_id: costSheetId,
                level: costSheet.current_approval_level,
                status: 'pending',
            },
            transaction: t,
        });

        if (!currentApproval) {
            throw new Error('No pending approval found for this level or cost sheet.');
        }

        // TODO: Implement more robust role validation here to ensure approverId has the correct role
        // For now, we assume if they can access this API, they are authorized for the level.

        const statusMap = {
            approve: 'approved',
            reject: 'rejected',
            send_back: 'sent_back'
        };

        await currentApproval.update({
            approver_id: approverId,
            status: statusMap[action] || action,
            comments: comments || `${action.charAt(0).toUpperCase() + action.slice(1)}ed by approver.`, // Default comment
        }, { transaction: t });

        let newCostSheetStatus = costSheet.status;
        let nextApprovalLevel = null;
        let auditDescription = '';

        if (action === 'approve') {
            const nextApproverInChain = await approvalService.getNextApprover(costSheetId, costSheet.current_approval_level);

            if (nextApproverInChain) {
                newCostSheetStatus = 'pending'; // Still pending, moved to next level
                nextApprovalLevel = nextApproverInChain.level;
                await Approval.create({
                    cost_sheet_id: costSheetId,
                    level: nextApprovalLevel,
                    status: 'pending',
                    comments: `Pending approval for Level ${nextApprovalLevel}`,
                }, { transaction: t });
                auditDescription = `Cost sheet ${costSheet.cost_sheet_number} approved by Level ${costSheet.current_approval_level} and forwarded to Level ${nextApprovalLevel}.`;
            } else {
                newCostSheetStatus = 'approved'; // Final approval
                auditDescription = `Cost sheet ${costSheet.cost_sheet_number} fully approved.`;
            }
        } else if (action === 'reject') {
            newCostSheetStatus = 'rejected';
            auditDescription = `Cost sheet ${costSheet.cost_sheet_number} rejected by Level ${costSheet.current_approval_level}.`;
        } else if (action === 'send_back') {
            newCostSheetStatus = 'sent_back'; // Sent back to initiator for rework
            auditDescription = `Cost sheet ${costSheet.cost_sheet_number} sent back for rework by Level ${costSheet.current_approval_level}.`;
        } else {
            throw new Error('Invalid approval action.');
        }

        await updateCostSheetDetails(costSheetId, {
            status: newCostSheetStatus,
            current_approval_level: nextApprovalLevel, // Null if fully approved, rejected, or sent back
            // You might want to store justification in CostSheet if applicable
        }, t);

        await AuditLog.create({
            user_id: approverId,
            cost_sheet_id: costSheetId,
            activity_type: `Cost Sheet ${action.charAt(0).toUpperCase() + action.slice(1)}`, // e.g., 'Cost Sheet Approved'
            description: auditDescription,
            comments: comments,
        }, t);

        await t.commit();
        return findCostSheetByIdRepo(costSheetId);

    } catch (error) {
        await t.rollback();
        logger.error(`Error performing approval action for cost sheet ${costSheetId}: ${error.message}`);
        throw error;
    }
};

const generatePoRequest = async (costSheetId, userId, poData) => {
    const t = await sequelize.transaction();
    try {
        const costSheet = await findCostSheetByIdRepo(costSheetId);
        if (!costSheet) {
            throw new Error('Cost Sheet not found.');
        }

        if (costSheet.status !== 'approved') {
            throw new Error(`PO can only be generated for an approved cost sheet. Current status: ${costSheet.status}`);
        }

        const sapPoResponse = await createPoInSap(poData);

        // Create PoRequest record
        const poRequest = await PoRequest.create({
            cost_sheet_id: costSheetId,
            po_type: poData.poType,
            po_number: sapPoResponse.poNumber,
            creation_date: new Date(),
            status: sapPoResponse.sapStatus,
            api_response: JSON.stringify(sapPoResponse),
        }, { transaction: t });

        // Update CostSheet with PO number and status
        await updateCostSheetDetails(costSheetId, {
            status: 'po_created', // Or a more specific status like 'PO_GENERATED'
            po_number: sapPoResponse.poNumber,
        }, t);

        // Create Audit Log entry
        await AuditLog.create({
            user_id: userId,
            cost_sheet_id: costSheetId,
            activity_type: 'PO Generation',
            description: `Purchase Order ${sapPoResponse.poNumber} generated for cost sheet ${costSheet.cost_sheet_number}.`,
        }, t);

        await t.commit();
        return findCostSheetByIdRepo(costSheetId);

    } catch (error) {
        await t.rollback();
        logger.error(`Error generating PO for cost sheet ${costSheetId}: ${error.message}`);
        throw error;
    }
};

const getPreviousPurchaseRecords = async (partCode, vendorCodes) => {
    try {
        const { findSapPosByPartCodeAndVendors } = require('../repositories/costSheetRepository');
        return await findSapPosByPartCodeAndVendors(partCode, vendorCodes);
    } catch (error) {
        logger.error(`Error fetching previous purchase records: ${error.message}`);
        throw error;
    }
};

module.exports = {
    createCostSheetFromPRs,
    createCostSheet,
    getCostSheetById,
    updateCostSheet,
    createVendorQuotation,
    updateVendorQuotation,
    deleteVendorQuotation,
    selectVendorAndDeviation,
    submitCostSheet,
    performApprovalAction,
    generatePoRequest,
    getPreviousPurchaseRecords,
};