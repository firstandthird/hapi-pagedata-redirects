const useragent = require('useragent');

module.exports = (server, options, next) => {
  server.ext('onPreResponse', (request, reply) => {
    if (request.response.statusCode !== 404) {
      return reply.continue();
    }

    server.methods.pagedata.getPageContent(options.redirectSlug, (err, content) => {
      if (err) {
        server.log(['hapi-pagedata-redirect', 'error'], err);
        return reply.continue();
      }

      const slug = request.route.path;

      const logData = {
        remoteAddress: `${request.info.remoteAddress}:${request.info.remotePort}`,
        host: request.info.host,
        userAgent: request.headers['user-agent'],
        browser: useragent.parse(request.headers['user-agent']).toString(),
        referrer: request.info.referrer,
        routePath: slug,
        from: request.path
      };

      if (!content || !content[slug]) {
        server.log(['hapi-pagedata-redirect', 'not-found', 'info'], logData);

        return reply.continue();
      }

      logData.to = content[slug];

      server.log(['hapi-pagedata-redirect', 'redirect', 'info'], logData);

      reply.redirect(content[slug]);
    });
  });
};

module.exports.attributes = {
  name: 'hapi-pagedata-redirects',
  pkg: require('./package.json'),
  dependencies: 'hapi-pagedata'
};
