// src/services/FastifyServer.ts
import Fastify, { HTTPMethods, FastifyInstance as ServerApplication, FastifyRequest as Request, FastifyReply as Response } from 'fastify';
import { AbstractServer, ServerOptions } from './AbstractServer';

export class FastifyServer extends AbstractServer {
  private app: ServerApplication;

  constructor(options: ServerOptions) {
    super(options);
    this.app = Fastify({});
  }

  start(): Promise<void> {
    this.app.listen(this.options.port);
  }

  stop(): Promise<void> {
    console.error('Implement STOP');
    return Promise.resolve();
  }

  addRoute(method: HTTPMethods, path: string, handler: Function): void {
    this.app.route({
      method,
      url: path,
      handler: async (request: Request, response: Response) => handler(request, response),
    });
  }
}
