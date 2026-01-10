const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { SapPr } = require('./sapPrModel');

class SapPrLineItem extends Model {}

SapPrLineItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pr_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'sap_prs',
        key: 'pr_number',
      },
    },
    line_item_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    part_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    qty: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    uom: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    plant_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    pr_price: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'INR',
    },
    earlier_po_est: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    total_inwarding_last_year: {
      type: DataTypes.DECIMAL,
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
    tableName: 'sap_pr_line_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

SapPrLineItem.belongsTo(SapPr, { foreignKey: 'pr_number' });
SapPr.hasMany(SapPrLineItem, { foreignKey: 'pr_number' });

module.exports = { SapPrLineItem };
