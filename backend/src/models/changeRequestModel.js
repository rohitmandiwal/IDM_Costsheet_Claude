const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./userModel');
const { CostSheet } = require('./costSheetModel');

const requestTypes = [
    'price_revision',
    'vendor_change',
    'terms_modification',
    'specification_update',
    'general_revision'
];

const requestStatuses = [
    'pending',
    'in_progress',
    'resolved',
    'cancelled'
];

const priorityLevels = [
    'low',
    'medium',
    'high',
    'critical'
];

class ChangeRequest extends Model { }

ChangeRequest.init(
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
        requested_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        requested_by_role: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        request_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        affected_fields: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true,
        },
        change_reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        detailed_comments: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        priority: {
            type: DataTypes.STRING(20),
            defaultValue: 'medium',
        },
        status: {
            type: DataTypes.STRING(20),
            defaultValue: 'pending',
        },
        resolved_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        resolved_at: {
            type: DataTypes.DATE,
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
        tableName: 'change_requests',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = { ChangeRequest, requestTypes, requestStatuses, priorityLevels };
