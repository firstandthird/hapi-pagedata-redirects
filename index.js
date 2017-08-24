const paramReplacer = require('./param-replacer');
const useragent = require('useragent');

module.exports = (server, options, next) => {
  server.ext('onPreResponse', (request, reply) => {
    if (request.response.isBoom && request.response.output.statusCode !== 404) {
      return reply.continue();
    }

    server.methods.pagedata.getPageContent(options.redirectSlug, (err, content) => {
      if (err) {
        server.log(['hapi-pagedata-redirect', 'error'], err);
        return reply.continue();
      }

      const route = request.route.path;
      const path = request.path;

      const logData = {
        remoteAddress: `${request.info.remoteAddress}:${request.info.remotePort}`,
        host: request.info.host,
        userAgent: request.headers['user-agent'],
        browser: useragent.parse(request.headers['user-agent']).toString(),
        referrer: request.info.referrer,
        routePath: route,
        from: request.path
      };

      if (!content) {
        server.log(['hapi-pagedata-redirect', 'not-found', 'info'], logData);
        return reply.continue();
      }

      let redirectTo = '';

      // Check if direct path matches first
      if (content[path]) {
        redirectTo = content[path];

      // Check for variable redirects
      } else {
        if (!content[route]) {
          server.log(['hapi-pagedata-redirect', 'not-found', 'info'], logData);
          return reply.continue();
        }

        redirectTo = paramReplacer(content[route], request.params);
      }

      logData.to = redirectTo;

      server.log(['hapi-pagedata-redirect', 'redirect', 'info'], logData);

      reply.redirect(redirectTo);
    });
  });

  next();
};

module.exports.attributes = {
  name: 'hapi-pagedata-redirects',
  pkg: require('./package.json'),
  dependencies: 'hapi-pagedata'
};
