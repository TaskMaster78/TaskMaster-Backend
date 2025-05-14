import { IUser } from '../types/User';
import { User } from '../models/User';

export const createUser = async (args: IUser) => {
  const user = new User(args);
  return await user.save();
};
