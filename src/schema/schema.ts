import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema
} from 'graphql';
import { IUser } from '../types/User';
import { createUser } from './resolvers';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id:       { type: GraphQLString },
    username: { type: GraphQLString },
    email:    { type: GraphQLString }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    hello: {
      type: GraphQLString,
      resolve: () => 'Hello from TypeScript GraphQL backend!'
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    signup: {
      type: UserType,
      args: {
        username: { type: GraphQLString },
        email:    { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve: async (_, { username, email, password }) => {
        return await createUser({ username, email, password });
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
