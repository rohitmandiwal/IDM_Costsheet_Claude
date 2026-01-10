const { User } = require('../models/userModel');

const findUserByEmail = async (email) => {
  return User.findOne({ where: { email } });
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
    findUserByEmail,
    findUserById,
    createUser
}
