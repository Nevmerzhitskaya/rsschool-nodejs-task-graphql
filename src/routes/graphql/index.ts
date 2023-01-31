import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql } from 'graphql';
import { GraphQLSchema } from 'graphql/type';
import { graphqlBodySchema, query } from './schema';




const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
 
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
        graphiql: true
      }, 
    },
    async function (request, reply) {

      const schema = new GraphQLSchema({query});
      return await graphql({schema, source: request.body.query || '', variableValues: request.body.variables, contextValue: fastify});

    }
  );
};

export default plugin;