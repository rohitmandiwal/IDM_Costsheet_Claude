const { sequelize } = require('../config/database');
const { User, RoleAssignment } = require('../models');

const dummyUsers = [
  {
    okta_id: 'initiator_okta_id',
    full_name: 'Test Initiator',
    email: 'initiator@royalenfield.com',
    roles: ['initiator'],
    department: 'Procurement',
    is_active: true,
  },
  {
    okta_id: 'approver_okta_id',
    full_name: 'Test Approver',
    email: 'approver@royalenfield.com',
    roles: ['approver_l1'],
    department: 'Finance',
    is_active: true,
  },
  {
    okta_id: 'admin_okta_id',
    full_name: 'System Admin',
    email: 'admin@royalenfield.com',
    roles: ['admin'],
    department: 'IT',
    is_active: true,
  },
];

const seedUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    await sequelize.sync({ alter: true }); // Use alter to be safe
    console.log('Database synchronized.');

    console.log('\n--- Starting User Seed ---\n');

    for (const userData of dummyUsers) {
      const existingUser = await User.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`[SKIP] User with email "${userData.email}" already exists.`);
        continue;
      }

      const user = await User.create({
        okta_id: userData.okta_id,
        full_name: userData.full_name,
        email: userData.email,
        department: userData.department,
        is_active: userData.is_active,
      });

      for(const role of userData.roles) {
          await RoleAssignment.create({
              user_id: user.id,
              role: role
          })
      }

      console.log(`[SUCCESS] User with email "${userData.email}" created successfully.`);
    }

    console.log('\n--- User Seed Completed ---\n');
  } catch (error) {
    console.error('[ERROR] Failed to seed users:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

seedUsers();
