const dashboardService = require('../services/dashboardService');

const getUnifiedDashboard = async (req, res) => {
  try {
    const user = req.user;
    const metrics = await dashboardService.getUnifiedDashboardMetrics(user.id, user.roles);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInitiatorDashboard = async (req, res) => {
  try {
    const user = req.user;
    const metrics = await dashboardService.getInitiatorDashboardMetrics(user.id);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApproverDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRoles = req.user?.roles;
    const metrics = await dashboardService.getApproverDashboardMetrics(userId, userRoles);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const metrics = await dashboardService.getAdminDashboardMetrics();
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const filters = req.query;
    const auditLogs = await dashboardService.getAuditLogs(filters);
    res.status(200).json({ success: true, data: auditLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
    getUnifiedDashboard,
    getInitiatorDashboard,
    getApproverDashboard,
    getAdminDashboard,
    getAuditLogs
}
