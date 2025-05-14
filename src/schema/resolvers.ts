import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { IUser } from "../types/User";
import { User } from "../models/User";

export const createUser = async (args: IUser) => {
  const hashedPassword = await bcrypt.hash(args.password, 10);
  const user = new User({ ...args, password: hashedPassword });
  return await user.save();
};

export const loginUser = async (
  username: string,
  password: string
): Promise<{ token: string; role: 'student' | 'admin' }> => {
  const user = await User.findOne({ username });
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid password');

  const payload = {
    id: user._id,
    username: user.username,
    role: user.role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });

  return { token, role: user.role };
};
