const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { CostSheetLineItem } = require('./costSheetLineItemModel');
const { Vendor } = require('./vendorModel');

class VendorQuotation extends Model {}

VendorQuotation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    line_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cost_sheet_line_items',
        key: 'id',
      },
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id',
      },
    },
    r0_quoted_per_unit: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    r0_value: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    r1_negotiated_per_unit: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    r1_value: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    gst: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    freight: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    other_charges: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    total_value: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    tax_code: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    payment_terms: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    delivery_terms: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    exchange_rate: {
        type: DataTypes.DECIMAL,
        defaultValue: 1.0,
    },
    quote_validity_date: {
        type: DataTypes.DATEONLY,
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
    tableName: 'vendor_quotations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

VendorQuotation.belongsTo(CostSheetLineItem, { foreignKey: 'line_item_id' });
CostSheetLineItem.hasMany(VendorQuotation, { foreignKey: 'line_item_id' });

VendorQuotation.belongsTo(Vendor, { foreignKey: 'vendor_id' });
Vendor.hasMany(VendorQuotation, { foreignKey: 'vendor_id' });

module.exports = { VendorQuotation };
