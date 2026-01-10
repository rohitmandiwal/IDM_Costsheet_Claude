const authService = require('../services/authService');
const { RoleAssignment } = require('../models');

const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ success: true, userId: user.id });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { token, user } = await authService.loginUser(req.body);
    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const roles = await RoleAssignment.findAll({ where: { user_id: user.id }});
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        roles: roles.map(r => r.role),
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = (req, res) => {
  // For JWT, logout is primarily client-side by removing the token.
  // This endpoint can be used for server-side session invalidation if implemented in future.
  res.status(200).json({ success: true, message: 'Logged out successfully (client-side token removal expected)' });
};

module.exports = {
    register,
    login,
    getMe,
    logout
}
