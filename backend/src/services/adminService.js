const { ApprovalRule, ApproverLevel, User, RoleAssignment, sequelize } = require('../models');
const bcrypt = require('bcrypt');

// Approval Rules & Levels
const createApprovalRule = async (ruleData) => {
  const { min_value, max_value, category, approvers } = ruleData;

  // Basic validation
  // Note: min_value can be 0, so check for undefined/null, but 0 is falsey in JS
  if (min_value === undefined || min_value === null || !category || !approvers || !Array.isArray(approvers)) {
    throw new Error('Missing required fields for approval rule (min_value, category, approvers).');
  }

  // Use a transaction to ensure atomicity
  const t = await sequelize.transaction();
  try {
    const rule = await ApprovalRule.create({ min_value, max_value, category }, { transaction: t });

    for (const approver of approvers) {
      if (approver.level && approver.approver_role) {
        await ApproverLevel.create({
          rule_id: rule.id,
          level: approver.level,
          approver_role: approver.approver_role,
        }, { transaction: t });
      }
    }

    await t.commit();

    // Refetch the rule with its levels to return the full object
    return ApprovalRule.findByPk(rule.id, {
      include: [{ model: ApproverLevel, as: 'approver_levels' }]
    });

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getApprovalRules = async () => {
  return ApprovalRule.findAll({
    include: [{
      model: ApproverLevel,
      as: 'approver_levels',
      order: [['level', 'ASC']]
    }],
    order: [['min_value', 'ASC'], ['category', 'ASC']]
  });
};

const updateApprovalRule = async (id, ruleData) => {
  const { approvers, min_value, max_value, category } = ruleData;

  const t = await sequelize.transaction();
  try {
    const rule = await ApprovalRule.findByPk(id);
    if (!rule) {
      throw new Error('Approval rule not found');
    }

    // Update rule properties
    await rule.update({
      category: category !== undefined ? category : rule.category,
      min_value: min_value !== undefined ? min_value : rule.min_value,
      max_value: max_value // Allow setting to null or new value
    }, { transaction: t });

    // Update Approvers if provided
    if (approvers && Array.isArray(approvers)) {
      // Remove existing approver levels for this rule
      await ApproverLevel.destroy({ where: { rule_id: id }, transaction: t });

      for (const approver of approvers) {
        if (approver.level && approver.approver_role) {
          await ApproverLevel.create({
            rule_id: rule.id,
            level: approver.level,
            approver_role: approver.approver_role,
          }, { transaction: t });
        }
      }
    }

    await t.commit();

    return ApprovalRule.findByPk(id, {
      include: [{ model: ApproverLevel, as: 'approver_levels' }]
    });

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const deleteApprovalRule = async (id) => {
  const rule = await ApprovalRule.findByPk(id);
  if (!rule) {
    throw new Error('Approval rule not found');
  }
  // Deleting a rule will also delete associated approver levels due to cascading
  return rule.destroy();
};

// User Management
const getAllUsers = async () => {
  return User.findAll({
    include: [{
      model: RoleAssignment,
      as: 'role_assignments',
      attributes: ['role']
    }],
    attributes: {
      exclude: ['password_hash']
    }
  });
};

const getUserById = async (id) => {
  return User.findByPk(id, {
    include: [{
      model: RoleAssignment,
      as: 'role_assignments',
      attributes: ['role']
    }],
    attributes: {
      exclude: ['password_hash']
    }
  });
};

const updateUser = async (id, userData) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(id, { transaction: t });
    if (!user) {
      throw new Error('User not found');
    }

    const { roles, ...updateData } = userData;

    // Validate department if provided
    const allowedDepartments = ['Sourcing', 'Procurement', 'Technology', 'Supply Chain', 'Finance', 'Operations', 'Executive', 'IT'];
    if (updateData.department && !allowedDepartments.includes(updateData.department)) {
      throw new Error(`Invalid department. Allowed values: ${allowedDepartments.join(', ')}`);
    }

    // Update user basic details
    await user.update(updateData, { transaction: t });

    // Handle role updates - exactly one role required
    if (roles && Array.isArray(roles)) {
      if (roles.length === 0) {
        throw new Error('Exactly one role must be assigned');
      }
      if (roles.length > 1) {
        throw new Error('Only one role can be assigned per user');
      }

      // Auto-populate designation based on new role
      const ROLE_TO_DESIGNATION = {
        'initiator': 'IDM - Team',
        'approver_l1': 'IDM - Team',
        'approver_l2': 'IDM - Lead',
        'approver_l3': 'Head Sourcing',
        'approver_l4': 'GTO - COO',
        'approver_l5': 'GCO - CFO',
        'approver_l6': 'CEO',
        'admin': 'System Administrator',
      };

      const designation = ROLE_TO_DESIGNATION[roles[0]];

      // Update designation to match new role
      await user.update({ designation }, { transaction: t });

      // Remove existing roles
      await RoleAssignment.destroy({ where: { user_id: id }, transaction: t });
      // Add the single new role
      await RoleAssignment.create({ user_id: id, role: roles[0] }, { transaction: t });
    }

    await t.commit();

    // Fetch and return the updated user with roles
    return User.findByPk(id, {
      include: [{
        model: RoleAssignment,
        as: 'role_assignments',
        attributes: ['role']
      }],
      attributes: {
        exclude: ['password_hash']
      }
    });

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const createUser = async (userData) => {
  const t = await sequelize.transaction();
  try {
    const { roles, password, ...userDetails } = userData;

    // Validate required fields
    if (!userDetails.username || !userDetails.full_name || !userDetails.email || !password) {
      throw new Error('Username, full name, email, and password are required');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: userDetails.email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ where: { username: userDetails.username } });
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // Validate roles - exactly one role required
    if (!roles || !Array.isArray(roles)) {
      throw new Error('Roles must be provided as an array');
    }
    if (roles.length === 0) {
      throw new Error('Exactly one role must be assigned');
    }
    if (roles.length > 1) {
      throw new Error('Only one role can be assigned per user');
    }

    // Validate department if provided
    const allowedDepartments = ['Sourcing', 'Procurement', 'Technology', 'Supply Chain', 'Finance', 'Operations', 'Executive', 'IT'];
    if (userDetails.department && !allowedDepartments.includes(userDetails.department)) {
      throw new Error(`Invalid department. Allowed values: ${allowedDepartments.join(', ')}`);
    }

    // Auto-populate designation based on role
    const ROLE_TO_DESIGNATION = {
      'initiator': 'IDM - Team',
      'approver_l1': 'IDM - Team',
      'approver_l2': 'IDM - Lead',
      'approver_l3': 'Head Sourcing',
      'approver_l4': 'GTO - COO',
      'approver_l5': 'GCO - CFO',
      'approver_l6': 'CEO',
      'admin': 'System Administrator',
    };

    const designation = ROLE_TO_DESIGNATION[roles[0]];

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user with hashed password and auto-populated designation
    const user = await User.create({
      ...userDetails,
      designation,  // Auto-set based on role
      password_hash,
      is_active: userDetails.is_active !== undefined ? userDetails.is_active : true,
    }, { transaction: t });

    // Assign the single role
    await RoleAssignment.create({
      user_id: user.id,
      role: roles[0]  // Only one role allowed
    }, { transaction: t });

    await t.commit();

    // Fetch and return the created user with roles
    return User.findByPk(user.id, {
      include: [{
        model: RoleAssignment,
        as: 'role_assignments',
        attributes: ['role']
      }],
      attributes: {
        exclude: ['password_hash']
      }
    });

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const deleteUser = async (id) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(id, { transaction: t });
    if (!user) {
      await t.rollback();
      throw new Error('User not found');
    }

    // Check if user has any cost sheets as initiator
    const costSheetCount = await sequelize.models.CostSheet.count({
      where: { initiator_id: id },
      transaction: t
    });

    if (costSheetCount > 0) {
      await t.rollback();
      throw new Error('Cannot delete user who has created cost sheets. Please reassign or archive cost sheets first.');
    }

    // Manually delete role_assignments first to avoid foreign key constraint
    await RoleAssignment.destroy({
      where: { user_id: id },
      transaction: t
    });

    // Now delete the user
    await user.destroy({ transaction: t });

    await t.commit();
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  createApprovalRule,
  getApprovalRules,
  updateApprovalRule,
  deleteApprovalRule,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
