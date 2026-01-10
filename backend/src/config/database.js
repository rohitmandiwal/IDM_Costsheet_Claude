const { Sequelize } = require('sequelize');
require('dotenv').config();

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'postgres',
  logging: false, // Set to true to see SQL queries in console
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Synchronize models (create tables if they don't exist)
    // In a production environment, you would use migrations instead of `sync({ force: true })` or `sync()`
    // For development, `sync()` is acceptable. `sync({ force: true })` will drop existing tables.
    await sequelize.sync();
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
