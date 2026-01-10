const { sequelize } = require('../config/database');
const { User, RoleAssignment } = require('../models');

const updateAdminRole = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    const adminUser = await User.findOne({
      where: { email: 'admin@royalenfield.com' },
    });

    if (!adminUser) {
      console.log('[ERROR] Admin user not found.');
      process.exit(1);
    }

    // First, remove all existing roles for the admin user
    await RoleAssignment.destroy({
        where: { user_id: adminUser.id }
    });

    // Then, add back only the 'admin' role
    await RoleAssignment.create({
        user_id: adminUser.id,
        role: 'admin'
    });

    console.log('[SUCCESS] Admin user role updated to ["admin"] only.');
  } catch (error) {
    console.error('[ERROR] Failed to update admin role:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

updateAdminRole();
