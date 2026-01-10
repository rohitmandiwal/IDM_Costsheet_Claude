const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { categoryTypes } = require('./approvalRuleModel');

class SapPr extends Model {}

SapPr.init(
  {
    pr_number: {
      type: DataTypes.STRING(20),
      primaryKey: true,
    },
    release_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    accepted_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    requester: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    plant_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    est_value: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'INR',
    },
    category: {
      type: DataTypes.ENUM(...categoryTypes),
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
    tableName: 'sap_prs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = { SapPr };
