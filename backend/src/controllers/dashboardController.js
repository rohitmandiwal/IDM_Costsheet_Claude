const dashboardService = require('../services/dashboardService');

const getUnifiedDashboard = async (req, res) => {
  try {
    const user = req.user;
    const metrics = await dashboardService.getInitiatorDashboardMetrics(user.id);
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
    const metrics = await dashboardService.getApproverDashboardMetrics();
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

module.exports = {
    getUnifiedDashboard,
    getInitiatorDashboard,
    getApproverDashboard,
    getAdminDashboard
}
