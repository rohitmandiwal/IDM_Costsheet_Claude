const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById: findUserRepoById, createUser } = require('../repositories/userRepository');

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
  const { email, password } = loginData;

  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
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
