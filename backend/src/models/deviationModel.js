const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { CostSheetLineItem } = require('./costSheetLineItemModel');
const { User } = require('./userModel');

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
        type: DataTypes.ENUM(...deviationTypes),
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

Deviation.belongsTo(CostSheetLineItem, { foreignKey: 'line_item_id' });
CostSheetLineItem.hasMany(Deviation, { foreignKey: 'line_item_id' });

Deviation.belongsTo(User, { as: 'raisedByUser', foreignKey: 'raised_by' });
Deviation.belongsTo(User, { as: 'approvedByUser', foreignKey: 'approved_by' });

module.exports = { Deviation, deviationTypes };
