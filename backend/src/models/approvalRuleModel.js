const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');


const categoryTypes = ['technical', 'non_technical'];

class ApprovalRule extends Model { }

ApprovalRule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    min_value: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    max_value: {
      type: DataTypes.DECIMAL,
      allowNull: true,
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



module.exports = { ApprovalRule, categoryTypes };
