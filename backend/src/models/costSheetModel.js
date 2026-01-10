const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./userModel');
const { categoryTypes } = require('./approvalRuleModel');
const { vendorTypes } = require('./vendorModel');

const rfqTypes = [
    'y',
    'n',
    'oem',
    'authorised',
    'repeat',
    'agreement'
];

const approvalStatuses = [
    'pending',
    'approved',
    'rejected',
    'sent_back'
];

class CostSheet extends Model {}

CostSheet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cost_sheet_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    requirement_type: {
        type: 'category_type', // Use native PostgreSQL enum type
        allowNull: false,
    },
    po_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    validity_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    pgrp: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    no_of_vendors: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    po_annexure: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    proposed_vendor: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    rfq_type: {
        type: 'rfq_type', // Use native PostgreSQL enum type
        allowNull: true,
    },
    proposed_vendor_type: {
        type: 'vendor_type', // Use native PostgreSQL enum type
        allowNull: true,
    },
    final_order_value: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    e_auction_bidded_value_l1: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    quoted_value: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    pr_value: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    payment_terms_deviation: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price_variance_percentage: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    incoterms: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    justification: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    auction_id_date: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    supplier_status: {
        type: DataTypes.STRING(3),
        allowNull: true,
    },
    auction_y_n: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    initiator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
        type: 'approval_status', // Use native PostgreSQL enum type
        defaultValue: 'pending',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'cost_sheets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

CostSheet.belongsTo(User, { foreignKey: 'initiator_id' });
User.hasMany(CostSheet, { foreignKey: 'initiator_id' });

module.exports = { CostSheet, rfqTypes, approvalStatuses };
