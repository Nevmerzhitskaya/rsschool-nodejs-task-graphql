import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    ProfileEntity[]
  > {
    return await fastify.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({key: "id", equals: request.params.id});
      
      if (!profile) {
        throw reply.code(404);
      }

      return profile;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const memberTypes = await fastify.db.memberTypes.findMany();
      const memberTypeId = request.body.memberTypeId;
      const userProfile = await fastify.db.profiles.findOne({key: "userId", equals: request.body.userId});

      if (typeof memberTypeId != "string" || memberTypes.find(memberType => memberType.id === memberTypeId) === undefined || userProfile) {
        throw reply.code(400);
      }

      const profile =  await fastify.db.profiles.create(request.body);

      return profile;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profileId = request.params.id;
      let profile = await fastify.db.profiles.findOne({key: "id", equals: profileId});
      
      if (!profile) {
        throw reply.code(400);
      }
      
      profile = await fastify.db.profiles.delete(profileId);
      return profile;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      let profile = await fastify.db.profiles.findOne({key: "id", equals: request.params.id});

      if (!profile) {
        reply.code(400);
      }

      profile = await fastify.db.profiles.change(request.params.id, request.body);

      return profile;
    }
  );
};

export default plugin;
