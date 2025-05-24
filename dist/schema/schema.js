"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const resolvers_1 = require("./resolvers");
const resolvers_2 = require("./resolvers");
const Project_1 = require("../models/Project");
const User_1 = require("../models/User");
const Task_1 = require("../models/Task");
const mongoose_1 = __importDefault(require("mongoose"));
const UserType = new graphql_1.GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        username: { type: graphql_1.GraphQLString },
        role: { type: graphql_1.GraphQLString },
        name: { type: graphql_1.GraphQLString },
        universityId: { type: graphql_1.GraphQLString }
        // password is omitted from public output
    })
});
const LoginResponseType = new graphql_1.GraphQLObjectType({
    name: "LoginResponse",
    fields: () => ({
        token: { type: graphql_1.GraphQLString },
        role: { type: graphql_1.GraphQLString }
    })
});
const RoleEnum = new graphql_1.GraphQLEnumType({
    name: "Role",
    values: {
        student: { value: "student" },
        admin: { value: "admin" }
    }
});
const ProjectType = new graphql_1.GraphQLObjectType({
    name: "Project",
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        title: { type: graphql_1.GraphQLString },
        description: { type: graphql_1.GraphQLString },
        category: { type: graphql_1.GraphQLString },
        status: { type: graphql_1.GraphQLString },
        startDate: { type: graphql_1.GraphQLString },
        endDate: { type: graphql_1.GraphQLString },
        selectedStudents: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        createdAt: { type: graphql_1.GraphQLString }
    })
});
const TaskType = new graphql_1.GraphQLObjectType({
    name: "Task",
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        projectId: { type: graphql_1.GraphQLString },
        projectTitle: { type: graphql_1.GraphQLString },
        taskName: { type: graphql_1.GraphQLString },
        description: { type: graphql_1.GraphQLString },
        assignedStudent: { type: graphql_1.GraphQLString },
        status: { type: graphql_1.GraphQLString },
        dueDate: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString }
    })
});
const StudentType = new graphql_1.GraphQLObjectType({
    name: "Student",
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        name: { type: graphql_1.GraphQLString }
    })
});
const TaskByIdType = new graphql_1.GraphQLObjectType({
    name: "TaskById",
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        taskName: { type: graphql_1.GraphQLString },
        description: { type: graphql_1.GraphQLString },
        assignedStudent: { type: graphql_1.GraphQLString },
        assignedStudentDetails: {
            type: new graphql_1.GraphQLList(StudentType),
            resolve: async (parent) => {
                const student = await User_1.User.find({ _id: parent.assignedStudent }); // Assuming assignedStudent is an ID
                return student;
            }
        },
        status: { type: graphql_1.GraphQLString },
        dueDate: { type: graphql_1.GraphQLString }
    })
});
const Mutation = new graphql_1.GraphQLObjectType({
    name: "Mutation",
    fields: {
        signup: {
            type: UserType,
            args: {
                username: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                role: { type: RoleEnum },
                name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                universityId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
            },
            resolve: async (_, { username, password, role, name, universityId }) => {
                return await (0, resolvers_1.createUser)({
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
                username: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
            },
            resolve: async (_, { username, password }) => {
                return await (0, resolvers_2.loginUser)(username, password);
            }
        },
        createProject: {
            type: ProjectType,
            args: {
                title: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                description: { type: graphql_1.GraphQLString },
                category: { type: graphql_1.GraphQLString },
                status: { type: graphql_1.GraphQLString },
                startDate: { type: graphql_1.GraphQLString },
                endDate: { type: graphql_1.GraphQLString },
                selectedStudents: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) }
            },
            resolve: async (_, args, context) => {
                const user = context.user;
                if (!user || user.role !== "admin")
                    throw new Error("Unauthorized");
                const project = new Project_1.Project(args);
                return await project.save();
            }
        },
        createTask: {
            type: TaskType,
            args: {
                projectId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                projectTitle: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                taskName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                description: { type: graphql_1.GraphQLString },
                assignedStudent: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                status: { type: graphql_1.GraphQLString },
                dueDate: { type: graphql_1.GraphQLString }
            },
            resolve: async (_, args, context) => {
                if (!context.user)
                    throw new Error("Unauthorized");
                const task = new Task_1.Task({
                    ...args,
                    projectId: new mongoose_1.default.Types.ObjectId(args.projectId),
                    assignedStudent: new mongoose_1.default.Types.ObjectId(args.assignedStudent)
                });
                return await task.save();
            }
        },
        updateTask: {
            type: TaskType,
            args: {
                id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                projectId: { type: graphql_1.GraphQLString },
                projectTitle: { type: graphql_1.GraphQLString },
                taskName: { type: graphql_1.GraphQLString },
                description: { type: graphql_1.GraphQLString },
                assignedStudent: { type: graphql_1.GraphQLString },
                status: { type: graphql_1.GraphQLString },
                dueDate: { type: graphql_1.GraphQLString }
            },
            resolve: async (_, args, context) => {
                if (!context.user)
                    throw new Error("Unauthorized");
                const updateData = {
                    ...args,
                    ...(args.projectId && {
                        projectId: new mongoose_1.default.Types.ObjectId(args.projectId)
                    }),
                    ...(args.assignedStudent && {
                        assignedStudent: new mongoose_1.default.Types.ObjectId(args.assignedStudent)
                    })
                };
                delete updateData.projectId; // remove id from update fields
                return await Task_1.Task.findByIdAndUpdate(args.id, updateData, { new: true });
            }
        },
        updateUser: {
            type: UserType,
            args: {
                name: { type: graphql_1.GraphQLString },
                phone: { type: graphql_1.GraphQLString },
                department: { type: graphql_1.GraphQLString },
                bio: { type: graphql_1.GraphQLString }
            },
            resolve: async (_, args, context) => {
                const user = context.user;
                if (!user)
                    throw new Error("Unauthorized");
                const updatedUser = await User_1.User.findByIdAndUpdate(user.id, { ...args }, { new: true });
                console.log("Updating user with ID:", user.id, "with data:", args);
                return updatedUser;
            }
        }
    }
});
const RootQuery = new graphql_1.GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        hello: {
            type: graphql_1.GraphQLString,
            resolve: () => "GraphQL API working!"
        },
        students: {
            type: new graphql_1.GraphQLList(UserType),
            resolve: async () => {
                return await User_1.User.find({ role: "student" });
            }
        },
        allProjects: {
            type: new graphql_1.GraphQLList(ProjectType),
            resolve: async (_, __, context) => {
                const user = context.user;
                if (!user || user.role !== "admin")
                    throw new Error("Unauthorized");
                return await Project_1.Project.find();
            }
        },
        myProjects: {
            type: new graphql_1.GraphQLList(ProjectType),
            resolve: async (_, __, context) => {
                const user = context.user;
                if (!user || user.role !== "student")
                    throw new Error("Unauthorized");
                return await Project_1.Project.find({ selectedStudents: user.id });
            }
        },
        tasks: {
            type: new graphql_1.GraphQLList(TaskType),
            resolve: async (_, __, context) => {
                const user = context.user;
                if (!user)
                    throw new Error("Unauthorized");
                if (user.role === "admin") {
                    return await Task_1.Task.find();
                }
                else if (user.role === "student") {
                    return await Task_1.Task.find({ assignedStudent: user.id });
                }
                else {
                    throw new Error("Invalid role");
                }
            }
        },
        tasksByProject: {
            type: new graphql_1.GraphQLList(TaskByIdType),
            args: {
                projectId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
            },
            resolve: async (_, { projectId }, context) => {
                if (!context.user)
                    throw new Error("Unauthorized");
                return await Task_1.Task.find({ projectId });
            }
        },
        otherUsers: {
            type: new graphql_1.GraphQLList(UserType),
            resolve: async (_, __, context) => {
                if (!context.user)
                    throw new Error("Unauthorized");
                return await User_1.User.find({ _id: { $ne: context.user.id } });
            }
        },
        dashboardStats: {
            type: new graphql_1.GraphQLObjectType({
                name: "DashboardStats",
                fields: () => ({
                    totalProjects: { type: graphql_1.GraphQLInt },
                    totalStudents: { type: graphql_1.GraphQLInt },
                    totalTasks: { type: graphql_1.GraphQLInt },
                    finishedProjects: { type: graphql_1.GraphQLInt }
                })
            }),
            resolve: async () => {
                const [totalProjects, totalStudents, totalTasks, finishedProjects] = await Promise.all([
                    Project_1.Project.countDocuments(),
                    User_1.User.countDocuments({ role: "student" }),
                    Task_1.Task.countDocuments(),
                    Project_1.Project.countDocuments({ status: "finished" })
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
            resolve: async (_, __, context) => {
                if (!context.user)
                    throw new Error("Unauthorized");
                const user = await User_1.User.findById(context.user.id);
                return user;
            }
        }
    }
});
exports.schema = new graphql_1.GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
