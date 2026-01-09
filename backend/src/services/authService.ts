import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserCreationAttributes } from '../models/userModel';
import { findUserByUsername, findUserById as findUserRepoById, createUser } from '../repositories/userRepository';

const generateToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });
};

export const registerUser = async (userData: UserCreationAttributes): Promise<User> => {
  const { username, password } = userData;

  if (!password) {
    throw new Error('Password is required');
  }

  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { password: _password, ...userToCreate } = userData;

  const user = await createUser({
    ...userToCreate,
    password_hash: hashedPassword,
  });

  return user;
};

export const loginUser = async (loginData: Pick<UserCreationAttributes, 'username' | 'password'>) => {
  const { username, password } = loginData;

  if (!password) {
    throw new Error('Password is required');
  }

  const user = await findUserByUsername(username);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      role: Array.isArray(user.role) ? user.role[0] : user.role,
      department: user.department,
    },
  };
};

export const findUserById = async (id: number): Promise<User | null> => {
  return findUserRepoById(id);
};
