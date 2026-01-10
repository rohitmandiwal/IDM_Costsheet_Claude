const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById: findUserRepoById, createUser } = require('../repositories/userRepository');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const registerUser = async (userData) => {
  const { email } = userData;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const user = await createUser(userData);

  return user;
};

const loginUser = async (loginData) => {
  const { email, okta_id } = loginData; // Assuming okta_id is passed for authentication

  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Here you would typically verify the okta_id or perform other checks
  // For now, we'll assume if the user exists, login is successful
  
  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      department: user.department,
    },
  };
};

const findUserById = async (id) => {
  return findUserRepoById(id);
};

module.exports = {
    registerUser,
    loginUser,
    findUserById,
    generateToken
}
