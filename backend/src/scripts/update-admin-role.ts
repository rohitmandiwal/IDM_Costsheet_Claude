import { sequelize } from '../config/database';
import { User } from '../models/userModel';

const updateAdminRole = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    const adminUser = await User.findOne({
      where: { username: 'admin' },
    });

    if (!adminUser) {
      console.log('[ERROR] Admin user not found.');
      process.exit(1);
    }

    await adminUser.update({
      role: ['Admin'],
    });

    console.log('[SUCCESS] Admin user role updated to ["Admin"] only.');
  } catch (error) {
    console.error('[ERROR] Failed to update admin role:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

updateAdminRole();
