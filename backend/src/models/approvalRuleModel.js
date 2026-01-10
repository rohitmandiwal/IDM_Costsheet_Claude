const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { ValueBand } = require('./valueBandModel');

const categoryTypes = ['technical', 'non_technical'];

class ApprovalRule extends Model {}

ApprovalRule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    value_band_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'value_bands',
        key: 'id',
      },
    },
    category: {
      type: 'category_type', // Use the native PostgreSQL enum type
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
    tableName: 'approval_rules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

ApprovalRule.belongsTo(ValueBand, { foreignKey: 'value_band_id' });
ValueBand.hasMany(ApprovalRule, { foreignKey: 'value_band_id' });

module.exports = { ApprovalRule, categoryTypes };
