const { AuditLog, ChangeRequest, CostSheet, User, Approval, RoleAssignment } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const getCostSheetHistory = async (costSheetId, filters = {}) => {
    try {
        const whereClause = { cost_sheet_id: costSheetId };

        if (filters.activityType) {
            whereClause.activity_type = filters.activityType;
        }

        if (filters.userRole) {
            whereClause.user_role = filters.userRole;
        }

        if (filters.startDate && filters.endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)],
            };
        } else if (filters.startDate) {
            whereClause.created_at = {
                [Op.gte]: new Date(filters.startDate),
            };
        } else if (filters.endDate) {
            whereClause.created_at = {
                [Op.lte]: new Date(filters.endDate),
            };
        }

        const history = await AuditLog.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['id', 'full_name', 'email'],
                },
                {
                    model: CostSheet,
                    attributes: ['id', 'cost_sheet_number', 'status'],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        return history.map(log => ({
            id: log.id,
            costSheetNumber: log.CostSheet?.cost_sheet_number,
            actionType: log.activity_type,
            currentStatus: log.resulting_status || log.CostSheet?.status,
            userRole: log.user_role,
            approvalLevel: log.approval_level,
            performedBy: log.User?.full_name,
            performedByEmail: log.User?.email,
            timestamp: log.created_at,
            description: log.description,
            comments: log.comments,
        }));
    } catch (error) {
        logger.error(`Error fetching cost sheet history: ${error.message}`);
        throw error;
    }
};

const createChangeRequest = async (costSheetId, requestData, requestedByUserId) => {
    try {
        const costSheet = await CostSheet.findByPk(costSheetId);
        if (!costSheet) {
            throw new Error('Cost Sheet not found');
        }

        const userRoles = await RoleAssignment.findAll({
            where: { user_id: requestedByUserId },
            attributes: ['role'],
            raw: true,
        });

        const primaryRole = userRoles.find(r => r.role === 'admin')
            || userRoles.find(r => r.role.startsWith('approver_'))
            || userRoles[0];

        const changeRequest = await ChangeRequest.create({
            cost_sheet_id: costSheetId,
            requested_by: requestedByUserId,
            requested_by_role: primaryRole?.role || 'unknown',
            request_type: requestData.requestType,
            affected_fields: requestData.affectedFields || [],
            change_reason: requestData.changeReason,
            detailed_comments: requestData.detailedComments,
            priority: requestData.priority || 'medium',
            status: 'pending',
        });

        await costSheet.update({ status: 'change_requested' });

        await AuditLog.create({
            user_id: requestedByUserId,
            cost_sheet_id: costSheetId,
            activity_type: 'CHANGE_REQUESTED',
            description: `Change request created: ${requestData.changeReason}`,
            comments: requestData.detailedComments,
            user_role: primaryRole?.role,
            resulting_status: 'change_requested',
        });

        logger.info(`Change request created for cost sheet ${costSheetId} by user ${requestedByUserId}`);
        return changeRequest;
    } catch (error) {
        logger.error(`Error creating change request: ${error.message}`);
        throw error;
    }
};

const getChangeRequestsForCostSheet = async (costSheetId) => {
    try {
        const changeRequests = await ChangeRequest.findAll({
            where: { cost_sheet_id: costSheetId },
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'full_name', 'email'],
                },
                {
                    model: User,
                    as: 'resolver',
                    attributes: ['id', 'full_name', 'email'],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        return changeRequests.map(cr => ({
            id: cr.id,
            requestType: cr.request_type,
            affectedFields: cr.affected_fields,
            changeReason: cr.change_reason,
            detailedComments: cr.detailed_comments,
            priority: cr.priority,
            status: cr.status,
            requestedBy: cr.requester?.full_name,
            requestedByRole: cr.requested_by_role,
            requestedAt: cr.created_at,
            resolvedBy: cr.resolver?.full_name,
            resolvedAt: cr.resolved_at,
        }));
    } catch (error) {
        logger.error(`Error fetching change requests: ${error.message}`);
        throw error;
    }
};

const resolveChangeRequest = async (changeRequestId, resolvedByUserId, resolution) => {
    try {
        const changeRequest = await ChangeRequest.findByPk(changeRequestId);
        if (!changeRequest) {
            throw new Error('Change request not found');
        }

        await changeRequest.update({
            status: 'resolved',
            resolved_by: resolvedByUserId,
            resolved_at: new Date(),
        });

        const costSheet = await CostSheet.findByPk(changeRequest.cost_sheet_id);
        if (costSheet && resolution === 'resubmit') {
            await costSheet.update({ status: 'pending' });
        }

        await AuditLog.create({
            user_id: resolvedByUserId,
            cost_sheet_id: changeRequest.cost_sheet_id,
            activity_type: 'CHANGE_REQUEST_RESOLVED',
            description: `Change request resolved and cost sheet ${resolution === 'resubmit' ? 'resubmitted' : 'updated'}`,
            user_role: 'initiator',
            resulting_status: resolution === 'resubmit' ? 'pending' : costSheet?.status,
        });

        logger.info(`Change request ${changeRequestId} resolved by user ${resolvedByUserId}`);
        return changeRequest;
    } catch (error) {
        logger.error(`Error resolving change request: ${error.message}`);
        throw error;
    }
};

const getHistoryTimeline = async (costSheetId) => {
    try {
        const [auditLogs, changeRequests, approvals] = await Promise.all([
            AuditLog.findAll({
                where: { cost_sheet_id: costSheetId },
                include: [{ model: User, attributes: ['id', 'full_name', 'email'] }],
            }),
            ChangeRequest.findAll({
                where: { cost_sheet_id: costSheetId },
                include: [
                    { model: User, as: 'requester', attributes: ['id', 'full_name', 'email'] },
                    { model: User, as: 'resolver', attributes: ['id', 'full_name', 'email'] },
                ],
            }),
            Approval.findAll({
                where: { cost_sheet_id: costSheetId },
                include: [{ model: User, as: 'approverUser', attributes: ['id', 'full_name', 'email'] }],
            }),
        ]);

        const timeline = [];

        auditLogs.forEach(log => {
            timeline.push({
                type: 'audit',
                timestamp: log.created_at,
                action: log.activity_type,
                user: log.User?.full_name,
                userRole: log.user_role,
                description: log.description,
                comments: log.comments,
                status: log.resulting_status,
                level: log.approval_level,
            });
        });

        changeRequests.forEach(cr => {
            timeline.push({
                type: 'change_request',
                timestamp: cr.created_at,
                action: 'CHANGE_REQUESTED',
                user: cr.requester?.full_name,
                userRole: cr.requested_by_role,
                description: cr.change_reason,
                comments: cr.detailed_comments,
                affectedFields: cr.affected_fields,
                priority: cr.priority,
                status: cr.status,
            });

            if (cr.resolved_at) {
                timeline.push({
                    type: 'change_request_resolved',
                    timestamp: cr.resolved_at,
                    action: 'CHANGE_REQUEST_RESOLVED',
                    user: cr.resolver?.full_name,
                    description: 'Change request resolved',
                });
            }
        });

        approvals.forEach(approval => {
            if (approval.status !== 'pending') {
                timeline.push({
                    type: 'approval',
                    timestamp: approval.updated_at,
                    action: `APPROVAL_${approval.status.toUpperCase()}`,
                    user: approval.approverUser?.full_name,
                    userRole: `Level ${approval.level}`,
                    description: `Approval ${approval.status} at Level ${approval.level}`,
                    comments: approval.comments,
                    level: approval.level,
                    status: approval.status,
                });
            }
        });

        timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return timeline;
    } catch (error) {
        logger.error(`Error fetching history timeline: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getCostSheetHistory,
    createChangeRequest,
    getChangeRequestsForCostSheet,
    resolveChangeRequest,
    getHistoryTimeline,
};
