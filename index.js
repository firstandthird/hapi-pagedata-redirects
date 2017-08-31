const paramReplacer = require('./param-replacer');
const useragent = require('useragent');
const Call = require('call');

module.exports = (server, options, next) => {
  server.ext('onPreResponse', (request, reply) => {
    if ((request.response.statusCode && request.response.statusCode !== 404) || (request.response.isBoom && request.response.output.statusCode !== 404)) {
      return reply.continue();
    }

    server.methods.pagedata.getPageContent(options.redirectSlug, (err, content) => {
      if (err) {
        server.log(['hapi-pagedata-redirect', 'error'], err);
        return reply.continue();
      }

      const router = new Call.Router();
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

      Object.entries(content).forEach(([paramName, param]) => {
        router.add({ method: 'get', path: paramName });
      });

      const match = router.route('get', path, request.host);

      if (!match.route) {
        server.log(['hapi-pagedata-redirect', 'not-found', 'info'], logData);
        return reply.continue();
      }

      const redirectTo = paramReplacer(content[match.route], match.params);

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
