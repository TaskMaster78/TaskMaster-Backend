import { IUser } from "../types/User";
import { User } from "../models/User";
import bcrypt from "bcrypt";

export const createUser = async (args: IUser) => {
  const hashedPassword = await bcrypt.hash(args.password, 10);
  const user = new User({
    ...args,
    password: hashedPassword
  });
  return await user.save();
};
