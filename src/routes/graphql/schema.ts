import { GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";

export const graphqlBodySchema = {
  type: 'object',
  properties: {
    mutation: { type: 'string' },
    query: { type: 'string' },
    variables: {
      type: 'object',
    },
  },
  oneOf: [
    {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string' },
        variables: {
          type: 'object',
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['mutation'],
      properties: {
        mutation: { type: 'string' },
        variables: {
          type: 'object',
        },
      },
      additionalProperties: false,
    },
  ],
} as const;


export const memberTypesSchema = new GraphQLObjectType({
  name: 'MemberTypes',
  fields: {
    id: { type: GraphQLString },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt }
  },
});

export const usersSchema = new GraphQLObjectType({
  name: 'Users',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) }
  },
});

export const profilesSchema = new GraphQLObjectType({
  name: 'Profiles',
  fields: {
    id: { type: GraphQLString },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    userId: { type: GraphQLString },
  },
});


export const postsSchema = new GraphQLObjectType({
  name: 'Posts',
  fields: {
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLString },
  },
});


export const query = new GraphQLObjectType({
  name: 'query',
  fields: {
    memberTypes: {
      type: new GraphQLList(memberTypesSchema),
      resolve: async (root, args, context, info) => {
        return await context.db.memberTypes.findMany();
      }
    },
    users: {
      type: new GraphQLList(usersSchema),
      resolve: async (root, args, context, info) => {
        return await context.db.users.findMany();
      }
    },
    profiles: {
      type: new GraphQLList(profilesSchema),
      resolve: async (root, args, context, info) => {
        return await context.db.profiles.findMany();
      }
    },
    posts: {
      type: new GraphQLList(postsSchema),
      resolve: async (root, args, context, info) => {
        return await context.db.posts.findMany();
      }
    },
    user: {
      type: usersSchema,
      args: {
        id: { type: GraphQLString }
      },
      resolve: async (root, args, context, info) => {
        const user = await context.db.users.findOne({ key: "id", equals: String(args.id) });
        if (!user) {
          throw new Error('404');
        }         
        return user;
      }
    },
    post: {
      type: postsSchema,
      args: {
        id: { type: GraphQLString }
      },
      resolve: async (root, args, context, info) => {
        return await context.db.posts.findOne({ key: "userId", equals: String(args.id) });
      }
    },
    profile: {
      type: profilesSchema,
      args: {
        id: { type: GraphQLString }
      },
      resolve: async (root, args, context, info) => {
        return await context.db.profiles.findOne({ key: "userId", equals: String(args.id) });
      }
    }
  },
});