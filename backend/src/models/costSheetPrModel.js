const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { CostSheet } = require('./costSheetModel');
const { SapPr } = require('./sapPrModel');

class CostSheetPr extends Model {}

CostSheetPr.init(
  {
    cost_sheet_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'cost_sheets',
        key: 'id',
      },
    },
    pr_number: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      references: {
        model: 'sap_prs',
        key: 'pr_number',
      },
    },
  },
  {
    sequelize,
    tableName: 'cost_sheet_prs',
    timestamps: false,
  }
);

CostSheet.belongsToMany(SapPr, { through: CostSheetPr, foreignKey: 'cost_sheet_id' });
SapPr.belongsToMany(CostSheet, { through: CostSheetPr, foreignKey: 'pr_number' });

module.exports = { CostSheetPr };
