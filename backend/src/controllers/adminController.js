const adminService = require('../services/adminService');



// Approval Rules
const createApprovalRule = async (req, res) => {
  try {
    const approvalRule = await adminService.createApprovalRule(req.body);
    res.status(201).json({ success: true, data: approvalRule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getApprovalRules = async (req, res) => {
  try {
    const approvalRules = await adminService.getApprovalRules();
    res.status(200).json({ success: true, data: approvalRules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateApprovalRule = async (req, res) => {
  try {
    const approvalRule = await adminService.updateApprovalRule(req.params.id, req.body);
    res.status(200).json({ success: true, data: approvalRule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteApprovalRule = async (req, res) => {
  try {
    await adminService.deleteApprovalRule(req.params.id);
    res.status(200).json({ success: true, message: 'Approval rule deleted successfully.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// User Management
const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {

  createApprovalRule,
  getApprovalRules,
  updateApprovalRule,
  deleteApprovalRule,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

