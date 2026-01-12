const { User } = require('../models/userModel');

const findUserByUsername = async (username) => {
  // Defensive check: prevent undefined/null from reaching SQL WHERE clause
  if (!username || typeof username !== 'string') {
    return null;
  }
  return User.findOne({ where: { username } });
};

const findUserById = async (id) => {
  const user = await User.findByPk(id);
  if (user) {
      }
  return user;
};

const createUser = async (userData) => {
  return User.create(userData);
};

module.exports = {
    findUserByUsername,
    findUserById,
    createUser
}
