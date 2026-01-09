import { User, UserCreationAttributes } from '../models/userModel';

export const findUserByUsername = async (username: string): Promise<User | null> => {
  return User.findOne({ where: { username } });
};

export const findUserById = async (id: number): Promise<User | null> => {
  const user = await User.findByPk(id);
  if (user) {
      }
  return user;
};

export const createUser = async (userData: UserCreationAttributes): Promise<User> => {
  return User.create(userData);
};
