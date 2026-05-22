const PROXY_CONFIG = {
  "/api/*": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "onProxyReq": function(proxyReq, req, res) {
      console.log("Proxying request to:", proxyReq.path);
      // Ajouter des en-têtes nécessaires
      proxyReq.setHeader('Access-Control-Allow-Origin', '*');
    },
    "onProxyRes": function(proxyRes, req, res) {
      console.log("Proxy response from:", req.originalUrl);
      // Ajouter les en-têtes CORS à la réponse
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    },
    "onError": function(err, req, res) {
      console.error("Proxy error:", err);
    }
  }
};

module.exports = PROXY_CONFIG;
