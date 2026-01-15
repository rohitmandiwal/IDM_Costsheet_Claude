const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./userModel');
const { CostSheet } = require('./costSheetModel');
const { CostSheetLineItem } = require('./costSheetLineItemModel');

class AuditLog extends Model { }

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    cost_sheet_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cost_sheets',
        key: 'id',
      },
    },
    line_item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cost_sheet_line_items',
        key: 'id',
      },
    },
    activity_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_role: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    resulting_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    approval_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: false,
  }
);

// Associations are centrally defined in models/index.js
module.exports = { AuditLog };
