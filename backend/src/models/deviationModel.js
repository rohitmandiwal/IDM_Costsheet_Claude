const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

const deviationTypes = [
    'single_source',
    'l2_supplier',
    'l3_supplier',
    'sob'
];

class Deviation extends Model {}

Deviation.init(
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
    deviation_type: {
        type: 'deviation_type', // Use the native PostgreSQL enum type
        allowNull: false,
    },
    raised_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    remarks: {
        type: DataTypes.TEXT,
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
    tableName: 'deviations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = { Deviation, deviationTypes };
