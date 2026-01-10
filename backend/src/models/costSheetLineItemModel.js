const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { CostSheet } = require('./costSheetModel');
const { SapPrLineItem } = require('./sapPrLineItemModel');
const { approvalStatuses } = require('./costSheetModel');

class CostSheetLineItem extends Model {}

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
    status: {
      type: DataTypes.ENUM(...approvalStatuses),
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

CostSheetLineItem.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id' });
CostSheet.hasMany(CostSheetLineItem, { foreignKey: 'cost_sheet_id' });

CostSheetLineItem.belongsTo(SapPrLineItem, { foreignKey: 'sap_line_item_id' });
SapPrLineItem.hasMany(CostSheetLineItem, { foreignKey: 'sap_line_item_id' });

module.exports = { CostSheetLineItem };
