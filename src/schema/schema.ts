import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLNonNull
} from "graphql";
import { createUser } from "./resolvers";
import { loginUser } from "./resolvers";

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
    }
  }
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    hello: {
      type: GraphQLString,
      resolve: () => "GraphQL API working!"
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
