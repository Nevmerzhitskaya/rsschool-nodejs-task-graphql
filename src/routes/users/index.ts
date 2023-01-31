import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const manyUsers = await fastify.db.users.findMany();
    return manyUsers;
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({key: "id", equals: request.params.id});

      if (!user) {
        throw reply.code(404);
      } 

      return user;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.create(request.body);
      return user;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const usertId = request.params.id;
      let user = await fastify.db.users.findOne({key: "id", equals: usertId});
      
      if (!user) {
        throw reply.code(400);
      }
      
      const subscription = await fastify.db.users.findMany({key: "subscribedToUserIds", inArray: usertId});
      
      if (subscription) {
        subscription.map(async subscr => {
          await fastify.db.users.change(subscr.id, {
            subscribedToUserIds: [...subscr.subscribedToUserIds.filter(el => el != usertId)]
          });
        });
      }

      const profile = await fastify.db.profiles.findOne({key: "userId", equals: usertId});
      
      if (profile) {
        await fastify.db.profiles.delete(profile.id);
      }

      const post = await fastify.db.posts.findOne({key: "userId", equals: usertId});
      
      if (post) {
        await fastify.db.posts.delete(post.id);
      }

      user = await fastify.db.users.delete(usertId);
      return user;
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const targetId = request.params.id;
      const usertId = request.body.userId;
      let user = await fastify.db.users.findOne({key: "id", equals: usertId});
      
      if (!user) {
        throw reply.code(404);
      }

      if (!user.subscribedToUserIds.includes(targetId)) {
        user = await fastify.db.users.change(usertId, {
          subscribedToUserIds: [...user.subscribedToUserIds, targetId]
        });
      }
      
      return user;
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const targetId = request.params.id;
      const usertId = request.body.userId;
      let user = await fastify.db.users.findOne({key: "id", equals: usertId});
      
      if (!user) {
        throw reply.code(404);
      }

      if (user.subscribedToUserIds.includes(targetId)) {
        user = await fastify.db.users.change(usertId, {
          subscribedToUserIds: [...user.subscribedToUserIds.filter(el => el != targetId)]
        });
      } else {
        throw reply.code(400);
      }
      
      return user;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      let user = await fastify.db.users.findOne({key: "id", equals: request.params.id});

      if (!user) {
        reply.code(400);
      }

      user = await fastify.db.users.change(request.params.id, request.body);

      return user;
    }
  );
};

export default plugin;
