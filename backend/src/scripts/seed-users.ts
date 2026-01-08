import bcrypt from 'bcrypt';
import { sequelize } from '../config/database';
import { User } from '../models/userModel';

interface SeedUser {
  username: string;
  password: string;
  full_name: string;
  email: string;
  role: string[];
  department: string;
  status: 'Active' | 'Inactive';
}

const dummyUsers: SeedUser[] = [
  {
    username: 'initiator',
    password: 'password123',
    full_name: 'Test Initiator',
    email: 'initiator@royalenfield.com',
    role: ['Initiator'],
    department: 'Procurement',
    status: 'Active',
  },
  {
    username: 'approver',
    password: 'password123',
    full_name: 'Test Approver',
    email: 'approver@royalenfield.com',
    role: ['Approver-L1'],
    department: 'Finance',
    status: 'Active',
  },
  {
    username: 'admin',
    password: 'password123',
    full_name: 'System Admin',
    email: 'admin@royalenfield.com',
    role: ['Admin'],
    department: 'IT',
    status: 'Active',
  },
];

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const seedUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    await sequelize.sync();
    console.log('Database synchronized.');

    console.log('\n--- Starting User Seed ---\n');

    for (const userData of dummyUsers) {
      const existingUser = await User.findOne({
        where: { username: userData.username },
      });

      if (existingUser) {
        console.log(`[SKIP] User "${userData.username}" already exists.`);
        continue;
      }

      const password_hash = await hashPassword(userData.password);

      await User.create({
        username: userData.username,
        password_hash,
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        status: userData.status,
      });

      console.log(`[SUCCESS] User "${userData.username}" created successfully.`);
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
