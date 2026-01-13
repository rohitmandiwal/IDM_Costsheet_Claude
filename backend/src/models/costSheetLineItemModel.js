const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { approvalStatuses } = require('./costSheetModel');

class CostSheetLineItem extends Model { }

CostSheetLineItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cost_sheet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cost_sheets',
        key: 'id',
      },
    },
    sap_line_item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sap_pr_line_items',
        key: 'id',
      },
    },
    s_no: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    buyer_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    finalized_vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id',
      },
    },
    status: {
      type: 'approval_status', // Use the native PostgreSQL enum type
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
    tableName: 'cost_sheet_line_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = { CostSheetLineItem };
