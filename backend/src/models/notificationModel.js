const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { CostSheet } = require('./costSheetModel');
const { User } = require('./userModel');

class Notification extends Model {}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cost_sheet_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'cost_sheets',
            key: 'id',
        },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    trigger_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: false,
  }
);

Notification.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { Notification };
