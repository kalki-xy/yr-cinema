import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { PROVIDERS_LIST } from '@consumet/extensions';
import mangapill from './mangapill';
import managreader from './managreader';
import mangadex from './mangadex';
import mangahere from './mangahere';
import mangakakalot from './mangakakalot';
import mangapark from './mangapark';
import mangasee123 from './mangasee123';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  // MangaDex is the primary source because it exposes a stable public API.
  await fastify.register(mangadex, { prefix: '/mangadex' });

  // Additional live sources provide fallback coverage when one provider is unavailable.
  await fastify.register(mangasee123, { prefix: '/mangasee123' });
  await fastify.register(mangapark, { prefix: '/mangapark' });
  await fastify.register(mangahere, { prefix: '/mangahere' });
  await fastify.register(mangakakalot, { prefix: '/mangakakalot' });
  await fastify.register(mangapill, { prefix: '/mangapill' });

  // Keep the legacy provider available for existing clients.
  await fastify.register(managreader, { prefix: '/managreader' });

  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.status(200).send({
      message: 'Manga providers',
      primary: 'mangadex',
      providers: [
        'mangadex',
        'mangasee123',
        'mangapark',
        'mangahere',
        'mangakakalot',
        'mangapill',
        'managreader',
      ],
      usage: '/manga/{provider}/{query}',
    });
  });

  fastify.get('/:mangaProvider', async (request: FastifyRequest, reply: FastifyReply) => {
    const mangaProvider = decodeURIComponent(
      (request.params as { mangaProvider: string }).mangaProvider,
    );
    const provider = PROVIDERS_LIST.MANGA.find(
      (entry: any) => entry.toString.name === mangaProvider,
    );

    if (!provider) {
      return reply.status(404).send({
        message: 'Provider not found. Use GET /manga for the available providers.',
      });
    }

    return reply.redirect(`/manga/${provider.toString.name}`);
  });
};

export default routes;
