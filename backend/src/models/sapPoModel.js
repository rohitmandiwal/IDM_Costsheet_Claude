const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class SapPo extends Model { }

SapPo.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        po_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        vendor_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        vendor_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        part_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        qty: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        unit_price: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'INR',
        },
        po_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        plant_code: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'sap_pos',
        timestamps: false,
        createdAt: 'created_at',
    }
);

module.exports = { SapPo };
