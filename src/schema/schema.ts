import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInt
} from "graphql";
import { createUser } from "./resolvers";
import { loginUser } from "./resolvers";
import { Project } from "../models/Project";
import { User } from "../models/User";
import { Task } from "../models/Task";
import mongoose from "mongoose";

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    username: { type: GraphQLString },
    role: { type: GraphQLString },
    name: { type: GraphQLString },
    universityId: { type: GraphQLString }
    // password is omitted from public output
  })
});

const LoginResponseType = new GraphQLObjectType({
  name: "LoginResponse",
  fields: () => ({
    token: { type: GraphQLString },
    role: { type: GraphQLString }
  })
});

const RoleEnum = new GraphQLEnumType({
  name: "Role",
  values: {
    student: { value: "student" },
    admin: { value: "admin" }
  }
});

const ProjectType = new GraphQLObjectType({
  name: "Project",
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    category: { type: GraphQLString },
    status: { type: GraphQLString },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString },
    selectedStudents: { type: new GraphQLList(GraphQLString) },
    createdAt: { type: GraphQLString }
  })
});

const TaskType = new GraphQLObjectType({
  name: "Task",
  fields: () => ({
    id: { type: GraphQLString },
    projectId: { type: GraphQLString },
    projectTitle: { type: GraphQLString },
    taskName: { type: GraphQLString },
    description: { type: GraphQLString },
    assignedStudent: { type: GraphQLString },
    status: { type: GraphQLString },
    dueDate: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  })
});

const StudentType = new GraphQLObjectType({
  name: "Student",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString }
  })
});

const TaskByIdType = new GraphQLObjectType({
  name: "TaskById",
  fields: () => ({
    id: { type: GraphQLString },
    taskName: { type: GraphQLString },
    description: { type: GraphQLString },
    assignedStudent: { type: GraphQLString },
    assignedStudentDetails: {
      type: new GraphQLList(StudentType),
      resolve: async (parent) => {
        const student = await User.find({ _id: parent.assignedStudent }); // Assuming assignedStudent is an ID
        return student;
      }
    },
    status: { type: GraphQLString },
    dueDate: { type: GraphQLString }
  })
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    signup: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: RoleEnum },
        name: { type: new GraphQLNonNull(GraphQLString) },
        universityId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { username, password, role, name, universityId }) => {
        return await createUser({
          username,
          password,
          role,
          name,
          universityId
        });
      }
    },
    login: {
      type: LoginResponseType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_: any, { username, password }) => {
        return await loginUser(username, password);
      }
    },
    createProject: {
      type: ProjectType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        category: { type: GraphQLString },
        status: { type: GraphQLString },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
        selectedStudents: { type: new GraphQLList(GraphQLString) }
      },
      resolve: async (_: any, args, context) => {
        const user = context.user;
        if (!user || user.role !== "admin") throw new Error("Unauthorized");

        const project = new Project(args);
        return await project.save();
      }
    },
    createTask: {
      type: TaskType,
      args: {
        projectId: { type: new GraphQLNonNull(GraphQLString) },
        projectTitle: { type: new GraphQLNonNull(GraphQLString) },
        taskName: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        assignedStudent: { type: new GraphQLNonNull(GraphQLString) },
        status: { type: GraphQLString },
        dueDate: { type: GraphQLString }
      },
      resolve: async (_, args, context) => {
        if (!context.user) throw new Error("Unauthorized");

        const task = new Task({
          ...args,
          projectId: new mongoose.Types.ObjectId(args.projectId),
          assignedStudent: new mongoose.Types.ObjectId(args.assignedStudent)
        });

        return await task.save();
      }
    },
    updateTask: {
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        projectId: { type: GraphQLString },
        projectTitle: { type: GraphQLString },
        taskName: { type: GraphQLString },
        description: { type: GraphQLString },
        assignedStudent: { type: GraphQLString },
        status: { type: GraphQLString },
        dueDate: { type: GraphQLString }
      },
      resolve: async (_, args, context) => {
        if (!context.user) throw new Error("Unauthorized");

        const updateData = {
          ...args,
          ...(args.projectId && {
            projectId: new mongoose.Types.ObjectId(args.projectId)
          }),
          ...(args.assignedStudent && {
            assignedStudent: new mongoose.Types.ObjectId(args.assignedStudent)
          })
        };

        delete updateData.id; // remove id from update fields

        return await Task.findByIdAndUpdate(args.id, updateData, { new: true });
      }
    }
  }
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    hello: {
      type: GraphQLString,
      resolve: () => "GraphQL API working!"
    },
    students: {
      type: new GraphQLList(UserType),
      resolve: async () => {
        return await User.find({ role: "student" });
      }
    },
    allProjects: {
      type: new GraphQLList(ProjectType),
      resolve: async (_: any, __, context) => {
        const user = context.user;
        if (!user || user.role !== "admin") throw new Error("Unauthorized");
        return await Project.find();
      }
    },
    myProjects: {
      type: new GraphQLList(ProjectType),
      resolve: async (_: any, __, context) => {
        const user = context.user;
        if (!user || user.role !== "student") throw new Error("Unauthorized");
        return await Project.find({ selectedStudents: user.id });
      }
    },
    tasks: {
      type: new GraphQLList(TaskType),
      resolve: async (_, __, context) => {
        const user = context.user;
        if (!user) throw new Error("Unauthorized");

        if (user.role === "admin") {
          return await Task.find();
        } else if (user.role === "student") {
          return await Task.find({ assignedStudent: user.id });
        } else {
          throw new Error("Invalid role");
        }
      }
    },
    tasksByProject: {
      type: new GraphQLList(TaskByIdType),
      args: {
        projectId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { projectId }, context) => {
        if (!context.user) throw new Error("Unauthorized");
        return await Task.find({ projectId });
      }
    },
    otherUsers: {
      type: new GraphQLList(UserType),
      resolve: async (_: any, __: any, context) => {
        if (!context.user) throw new Error("Unauthorized");
        return await User.find({ _id: { $ne: context.user.id } });
      }
    },
    dashboardStats: {
      type: new GraphQLObjectType({
        name: "DashboardStats",
        fields: () => ({
          totalProjects: { type: GraphQLInt },
          totalStudents: { type: GraphQLInt },
          totalTasks: { type: GraphQLInt },
          finishedProjects: { type: GraphQLInt }
        })
      }),
      resolve: async () => {
        const [totalProjects, totalStudents, totalTasks, finishedProjects] =
          await Promise.all([
            Project.countDocuments(),
            User.countDocuments({ role: "student" }),
            Task.countDocuments(),
            Project.countDocuments({ status: "finished" })
          ]);

        return {
          totalProjects,
          totalStudents,
          totalTasks,
          finishedProjects
        };
      }
    },
    me: {
      type: UserType,
      resolve: async (_: any, __: any, context) => {
        if (!context.user) throw new Error("Unauthorized");

        const user = await User.findById(context.user.id);
        return user;
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
