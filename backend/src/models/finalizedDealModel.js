const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinalizedDeal = sequelize.define('FinalizedDeal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    line_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'cost_sheet_line_items',
            key: 'id',
        },
    },
    vendor_quotation_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'vendor_quotations',
            key: 'id',
        },
    },
    vendor_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'vendors',
            key: 'id',
        },
    },
    final_unit_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    final_total_value: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    payment_terms: {
        type: DataTypes.TEXT,
    },
    delivery_terms: {
        type: DataTypes.TEXT,
    },
    exchange_rate: {
        type: DataTypes.DECIMAL,
        defaultValue: 1.0,
    },
    quote_validity_date: {
        type: DataTypes.DATEONLY,
    },
    contract_number: {
        type: DataTypes.STRING(50),
    },
    contract_date: {
        type: DataTypes.DATEONLY,
    },
    delivery_date: {
        type: DataTypes.DATEONLY,
    },
    warranty_terms: {
        type: DataTypes.TEXT,
    },
    special_conditions: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'finalized_deals',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = FinalizedDeal;
