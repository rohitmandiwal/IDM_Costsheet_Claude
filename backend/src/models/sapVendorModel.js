const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class SapVendor extends Model {}

SapVendor.init(
  {
    vendor_code: {
      type: DataTypes.STRING(20),
      primaryKey: true,
    },
    vendor_name: {
      type: DataTypes.STRING(255),
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
    tableName: 'sap_vendors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = { SapVendor };
