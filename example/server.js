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
      host: 'http://pagedata.dev',
      key: 'c-b884fc0a-a24a-46ac-aa96-f09b6e00f2db',
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
      redirectSlug: 'hapi-pagedata-redirects-redirects'
    }
  }
], err => {
  if (err) {
    throw err;
  }

  server.route({
    path: '/',
    method: 'get',
    handler: (request, reply) => {
      reply({ exists: true });
    }
  });

  server.route({
    path: '/test1',
    method: 'get',
    handler: (request, reply) => {
      reply({ redirect: true });
    }
  });

  server.route({
    path: '/color/{color}',
    method: 'get',
    handler: (request, reply) => {
      reply('This shouldn\'t show up');
    }
  });

  server.route({
    path: '/test/{test}',
    method: 'get',
    handler: (request, reply) => {
      reply('This shouldn\'t show up');
    }
  });

  server.start(startErr => {
    if (startErr) {
      throw startErr;
    }
    console.log('Server started', server.info.uri);
  });
});
