import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { IUser } from "../types/User";
import { User } from "../models/User";
import { Project } from "../models/Project";
import mongoose from "mongoose";

type CreateProjectArgs = {
  title: string;
  description?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  selectedStudents: string[];
};

export const createUser = async (args: IUser) => {
  const hashedPassword = await bcrypt.hash(args.password, 10);
  const user = new User({ ...args, password: hashedPassword });
  return await user.save();
};

export const loginUser = async (
  username: string,
  password: string
): Promise<{ token: string; role: "student" | "admin" }> => {
  const user = await User.findOne({ username });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid password");

  const payload = {
    id: user._id,
    username: user.username,
    role: user.role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h"
  });

  return { token, role: user.role };
};

const createProject = async (
  _: any,
  args: CreateProjectArgs,
  context: { user: { id: string; role: string } }
) => {
  const user = context.user;
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const selectedStudents = args.selectedStudents.map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const project = new Project({
    ...args,
    selectedStudents // override with converted ObjectIds
  });

  return await project.save();
};
export const getUserProjects = async (currentUser: IUser) => {
  if (currentUser.role === "admin") {
    return await Project.find();
  }
  return await Project.find({ assignedTo: currentUser.id });
};
