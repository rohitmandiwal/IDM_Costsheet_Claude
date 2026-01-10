const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { CostSheet } = require('./costSheetModel');
const { CostSheetLineItem } = require('./costSheetLineItemModel');

class Attachment extends Model {}

Attachment.init(
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
    file_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    file_path: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
    tableName: 'attachments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Attachment.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id' });
CostSheet.hasMany(Attachment, { foreignKey: 'cost_sheet_id' });

Attachment.belongsTo(CostSheetLineItem, { foreignKey: 'line_item_id' });
CostSheetLineItem.hasMany(Attachment, { foreignKey: 'line_item_id' });

module.exports = { Attachment };
