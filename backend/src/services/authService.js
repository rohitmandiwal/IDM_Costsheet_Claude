const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { RoleAssignment } = require('../models/roleAssignmentModel');
const { findUserByUsername, findUserById: findUserRepoById, createUser } = require('../repositories/userRepository');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const registerUser = async (userData) => {
  const { email, password } = userData;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  userData.password_hash = hashedPassword; // Add hashed password to userData
  delete userData.password; // Remove plaintext password

  const user = await createUser(userData);

  return user;
};

const loginUser = async (loginData) => {
  const { username, password } = loginData;

  // Validate required fields before database query
  if (!username || typeof username !== 'string' || !username.trim()) {
    throw new Error('Username is required');
  }
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }

  const user = await findUserByUsername(username.trim());
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  // Fetch roles after successful login
  const roles = await RoleAssignment.findAll({ where: { user_id: user.id } });
  const userRoles = roles.map(r => r.role);

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      department: user.department,
      roles: userRoles, // Include roles in the response
    },
  };
};

const findUserById = async (id) => {
  const user = await findUserRepoById(id);
  if (user) {
    const roles = await RoleAssignment.findAll({ where: { user_id: user.id } });
    const userRoles = roles.map(r => r.role);
    // Return a plain object to avoid issues with Sequelize instances
    return { ...user.toJSON(), roles: userRoles };
  }
  return null;
};

module.exports = {
    registerUser,
    loginUser,
    findUserById,
    generateToken
}
