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

      if (!content || !content[slug]) {
        server.log(['hapi-pagedata-redirect', 'not-found', 'info'], { slug });
        return reply.continue();
      }

      server.log(['hapi-pagedata-redirect', 'redirect', 'info'], { slug, url: content[slug] });

      reply.redirect(content[slug]);
    })
  });
};

module.exports.attributes = {
  name: 'hapi-pagedata-redirects',
  pkg: require('package.json'),
  dependencies: 'hapi-pagedata'
}
