const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { SapPrLineItem } = require('./sapPrLineItemModel');

class SapPrQuotation extends Model { }

SapPrQuotation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        sap_line_item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sap_pr_line_items',
                key: 'id',
            },
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
            allowNull: true,
        },
        quote_per_unit: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        tax_code: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        gst_rate: {
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
        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'INR',
        },
        quote_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        valid_until: {
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
        tableName: 'sap_pr_quotations',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

SapPrQuotation.belongsTo(SapPrLineItem, { foreignKey: 'sap_line_item_id' });
SapPrLineItem.hasMany(SapPrQuotation, { foreignKey: 'sap_line_item_id' });

module.exports = { SapPrQuotation };
