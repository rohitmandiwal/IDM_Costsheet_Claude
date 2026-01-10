const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { ApprovalRule } = require('./approvalRuleModel');
const { roleTypes } = require('./roleAssignmentModel');

class ApproverLevel extends Model {}

ApproverLevel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'approval_rules',
        key: 'id',
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    approver_role: {
      type: DataTypes.ENUM(...roleTypes),
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
    tableName: 'approver_levels',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

ApproverLevel.belongsTo(ApprovalRule, { foreignKey: 'rule_id' });
ApprovalRule.hasMany(ApproverLevel, { foreignKey: 'rule_id' });

module.exports = { ApproverLevel };
