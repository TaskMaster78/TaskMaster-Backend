import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLList
} from "graphql";
import { createProject, createUser, getUserProjects } from "./resolvers";
import { loginUser } from "./resolvers";
import { Project } from "../models/Project";

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
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
