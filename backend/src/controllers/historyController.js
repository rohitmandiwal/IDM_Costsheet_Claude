const historyService = require('../services/historyService');
const logger = require('../utils/logger');

const getCostSheetHistoryController = async (req, res) => {
    try {
        const { costSheetId } = req.params;
        const filters = {
            activityType: req.query.activityType,
            userRole: req.query.userRole,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };

        const history = await historyService.getCostSheetHistory(costSheetId, filters);
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        logger.error(`Error in getCostSheetHistory controller: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getHistoryTimelineController = async (req, res) => {
    try {
        const { costSheetId } = req.params;
        const timeline = await historyService.getHistoryTimeline(costSheetId);
        res.status(200).json({ success: true, data: timeline });
    } catch (error) {
        logger.error(`Error in getHistoryTimeline controller: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createChangeRequestController = async (req, res) => {
    try {
        const { costSheetId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const requestData = {
            requestType: req.body.requestType,
            affectedFields: req.body.affectedFields,
            changeReason: req.body.changeReason,
            detailedComments: req.body.detailedComments,
            priority: req.body.priority,
        };

        const changeRequest = await historyService.createChangeRequest(costSheetId, requestData, userId);
        res.status(201).json({ success: true, data: changeRequest });
    } catch (error) {
        logger.error(`Error in createChangeRequest controller: ${error.message}`);
        res.status(400).json({ success: false, message: error.message });
    }
};

const getChangeRequestsController = async (req, res) => {
    try {
        const { costSheetId } = req.params;
        const changeRequests = await historyService.getChangeRequestsForCostSheet(costSheetId);
        res.status(200).json({ success: true, data: changeRequests });
    } catch (error) {
        logger.error(`Error in getChangeRequests controller: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

const resolveChangeRequestController = async (req, res) => {
    try {
        const { changeRequestId } = req.params;
        const userId = req.user?.id;
        const { resolution } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const changeRequest = await historyService.resolveChangeRequest(changeRequestId, userId, resolution);
        res.status(200).json({ success: true, data: changeRequest });
    } catch (error) {
        logger.error(`Error in resolveChangeRequest controller: ${error.message}`);
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getCostSheetHistoryController,
    getHistoryTimelineController,
    createChangeRequestController,
    getChangeRequestsController,
    resolveChangeRequestController,
};
