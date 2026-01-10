const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./userModel');

const roleTypes = [
    'initiator',
    'approver_l1',
    'approver_l2',
    'approver_l3',
    'approver_l4',
    'approver_l5',
    'approver_l6',
    'admin'
];

class RoleAssignment extends Model {}

RoleAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    role: {
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
    tableName: 'role_assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

RoleAssignment.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(RoleAssignment, { foreignKey: 'user_id' });

module.exports = { RoleAssignment, roleTypes };
