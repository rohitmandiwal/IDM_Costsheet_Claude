const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { CostSheet } = require('./costSheetModel');
const { CostSheetLineItem } = require('./costSheetLineItemModel');
const { User } = require('./userModel');
const { approvalStatuses } = require('./costSheetModel');

class Approval extends Model {}

Approval.init(
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
    line_item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cost_sheet_line_items',
        key: 'id',
      },
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    approver_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    status: {
        type: DataTypes.ENUM(...approvalStatuses),
        defaultValue: 'pending',
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: false,
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
    tableName: 'approvals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Approval.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id' });
CostSheet.hasMany(Approval, { foreignKey: 'cost_sheet_id' });

Approval.belongsTo(CostSheetLineItem, { foreignKey: 'line_item_id' });
CostSheetLineItem.hasMany(Approval, { foreignKey: 'line_item_id' });

Approval.belongsTo(User, { foreignKey: 'approver_id' });
User.hasMany(Approval, { foreignKey: 'approver_id' });

module.exports = { Approval };
