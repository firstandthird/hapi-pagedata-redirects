const Hapi = require('hapi');
const port = process.env.PORT || 8080;

const server = new Hapi.Server({
  debug: {
    log: ['pagedata', 'error', 'cache'],
    request: ['error']
  }
});

server.connection({ port });

server.register([
  {
    register: require('hapi-pagedata'),
    options: {
      host: process.env.PAGEDATA_HOST || `http://localhost:${port}`,
      key: process.env.PAGEDATA_KEY || 'key',
      status: 'draft',
      enablePageCache: false,
      enableProjectPagesCache: false,
      enableParentPagesCache: false,
      verbose: true
    }
  },
  {
    register: require('../'),
    options: {
      redirectSlug: process.env.PAGEDATA_SLUG || 'redirects'
    }
  }
], err => {
  if (err) {
    throw err;
  }

  server.route({
    path: '/api/pages/{page}',
    method: 'GET',
    handler(request, reply) {
      reply({
        content: {
          '/color/{color}': '/test/{color}',
          '/something-cool': '/test/cool'
        }
      });
    }
  });

  server.route({
    path: '/',
    method: 'get',
    handler: (request, reply) => {
      reply({ exists: true });
    }
  });

  server.route({
    path: '/test/{param}',
    method: 'get',
    handler: (request, reply) => {
      reply({ param: request.params.param });
    }
  });

  server.start(startErr => {
    if (startErr) {
      throw startErr;
    }
    console.log('Server started', server.info.uri);
  });
});
