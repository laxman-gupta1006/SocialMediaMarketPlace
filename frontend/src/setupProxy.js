const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://localhost:3000', // Local Express backend
      changeOrigin: true,
      secure: false, // Accept self-signed certs (for https://localhost)
    })
  );

  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'https://localhost:3000', // WebSocket endpoint
      changeOrigin: true,
      ws: true,
      secure: false,
    })
  );
};
