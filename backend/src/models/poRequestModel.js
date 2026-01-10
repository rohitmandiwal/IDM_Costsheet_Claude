const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { CostSheet } = require('./costSheetModel');

class PoRequest extends Model {}

PoRequest.init(
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
    po_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    po_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    creation_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    api_response: {
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
    tableName: 'po_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

PoRequest.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id' });
CostSheet.hasMany(PoRequest, { foreignKey: 'cost_sheet_id' });

module.exports = { PoRequest };
