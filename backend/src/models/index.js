const { sequelize } = require('../config/database');
const { User } = require('./userModel');
const { RoleAssignment } = require('./roleAssignmentModel');

const { ApprovalRule } = require('./approvalRuleModel');
const { ApproverLevel } = require('./approverLevelModel');
const { SapPr } = require('./sapPrModel');
const { SapPrLineItem } = require('./sapPrLineItemModel');
const { SapVendor } = require('./sapVendorModel');
const { Vendor } = require('./vendorModel');
const { CostSheet } = require('./costSheetModel');
const { CostSheetPr } = require('./costSheetPrModel');
const { CostSheetLineItem } = require('./costSheetLineItemModel');
const { VendorQuotation } = require('./vendorQuotationModel');
const { Deviation } = require('./deviationModel');
const { Approval } = require('./approvalModel');
const { Attachment } = require('./attachmentModel');
const { PoRequest } = require('./poRequestModel');
const { AuditLog } = require('./auditLogModel');
const { Notification } = require('./notificationModel');
const { SapPo } = require('./sapPoModel');

// Define Associations

// User and RoleAssignment
User.hasMany(RoleAssignment, { foreignKey: 'user_id', as: 'role_assignments' });
RoleAssignment.belongsTo(User, { foreignKey: 'user_id' });

// Approval Matrix


ApprovalRule.hasMany(ApproverLevel, { foreignKey: 'rule_id', as: 'approver_levels' });
ApproverLevel.belongsTo(ApprovalRule, { foreignKey: 'rule_id' });

// SAP PR and CostSheetPr
SapPr.hasMany(CostSheetPr, { foreignKey: 'pr_number' });
CostSheetPr.belongsTo(SapPr, { foreignKey: 'pr_number' });

// CostSheet and CostSheetPr
CostSheet.hasMany(CostSheetPr, { foreignKey: 'cost_sheet_id', as: 'cost_sheet_prs' });
CostSheetPr.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id' });

// CostSheet and User (Initiator)
CostSheet.belongsTo(User, { foreignKey: 'initiator_id', as: 'initiator' });
User.hasMany(CostSheet, { foreignKey: 'initiator_id' });

// CostSheetLineItem and CostSheet
CostSheetLineItem.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id' });
CostSheet.hasMany(CostSheetLineItem, { foreignKey: 'cost_sheet_id', as: 'cost_sheet_line_items' });

// CostSheetLineItem and SapPrLineItem
CostSheetLineItem.belongsTo(SapPrLineItem, { foreignKey: 'sap_line_item_id' });
SapPrLineItem.hasMany(CostSheetLineItem, { foreignKey: 'sap_line_item_id', as: 'cost_sheet_line_items' });

// CostSheetLineItem and VendorQuotation
CostSheetLineItem.hasMany(VendorQuotation, { foreignKey: 'line_item_id', as: 'vendor_quotations' });
VendorQuotation.belongsTo(CostSheetLineItem, { foreignKey: 'line_item_id' });

// CostSheetLineItem and Deviation
CostSheetLineItem.hasMany(Deviation, { foreignKey: 'line_item_id', as: 'deviations' });
Deviation.belongsTo(CostSheetLineItem, { foreignKey: 'line_item_id' });

// VendorQuotation and Vendor
VendorQuotation.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });
Vendor.hasMany(VendorQuotation, { foreignKey: 'vendor_id', as: 'quotations' });

// Vendor and SapVendor
Vendor.belongsTo(SapVendor, { foreignKey: 'vendor_code' });
SapVendor.hasMany(Vendor, { foreignKey: 'vendor_code' });

// Deviation and User
Deviation.belongsTo(User, { as: 'raisedByUser', foreignKey: 'raised_by' });
Deviation.belongsTo(User, { as: 'approvedByUser', foreignKey: 'approved_by' });

// Approval and User
Approval.belongsTo(User, { foreignKey: 'approver_id' });
User.hasMany(Approval, { foreignKey: 'approver_id' });

// CostSheet and Approval
CostSheet.hasMany(Approval, { foreignKey: 'cost_sheet_id', as: 'approvals' });
Approval.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id' });

// AuditLog and User, CostSheet
AuditLog.belongsTo(User, { foreignKey: 'user_id' });
AuditLog.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id' });

// PoRequest and CostSheet
PoRequest.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id' });

module.exports = {
  sequelize,
  User,
  RoleAssignment,

  ApprovalRule,
  ApproverLevel,
  SapPr,
  SapPrLineItem,
  SapVendor,
  Vendor,
  CostSheet,
  CostSheetPr,
  CostSheetLineItem,
  VendorQuotation,
  Deviation,
  Approval,
  Attachment,
  PoRequest,
  AuditLog,
  Notification,
  SapPo,
};