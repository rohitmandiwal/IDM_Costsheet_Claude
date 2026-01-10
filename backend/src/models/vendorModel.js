const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { SapVendor } = require('./sapVendorModel');

const vendorTypes = ['new', 'existing'];

class Vendor extends Model {}

Vendor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vendor_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'sap_vendors',
        key: 'vendor_code',
      },
    },
    vendor_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    vendor_type: {
      type: 'vendor_type', // Use the native PostgreSQL enum type
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
    tableName: 'vendors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Vendor.belongsTo(SapVendor, { foreignKey: 'vendor_code' });
SapVendor.hasMany(Vendor, { foreignKey: 'vendor_code' });

module.exports = { Vendor, vendorTypes };
