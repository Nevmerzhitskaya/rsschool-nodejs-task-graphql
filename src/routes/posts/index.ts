import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return await fastify.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await fastify.db.posts.findOne({key: "id", equals: request.params.id});
      
      if (!post) {
        throw reply.code(404);
      }

      return post;    
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await fastify.db.posts.create(request.body);
      return post;  
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postId = request.params.id;
      let post = await fastify.db.posts.findOne({key: "id", equals: postId});
      
      if (!post) {
        throw reply.code(400);
      }      
      post = await fastify.db.posts.delete(postId);
      return post;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      let post = await fastify.db.posts.findOne({key: "id", equals: request.params.id});

      if (!post) {
        reply.code(400);
      }

      post = await fastify.db.posts.change(request.params.id, request.body);

      return post;
    }
  );
};

export default plugin;
