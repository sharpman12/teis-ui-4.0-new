/**
 * proxy.conf.js
 *
 * Intercepts the Keycloak OIDC discovery document and rewrites all absolute
 * backend URLs (port 8083) to the local dev-server URL (port 4200).
 *
 * Why this is needed:
 *   keycloak-js reads token_endpoint / userinfo_endpoint / etc. from the
 *   discovery document.  Those URLs point to http://w5cg0270zrh:8083 which
 *   is a *different origin* from the Angular dev-server (port 4200).
 *   Browsers block those cross-origin XHR calls (CORS).
 *   By rewriting the discovery doc so every endpoint says port 4200, every
 *   subsequent keycloak-js XHR routes through the Angular proxy and the
 *   CORS problem disappears completely.
 */

const { responseInterceptor } = require('http-proxy-middleware');

const KC_BACKEND = 'http://w5cg0270zrh:8083';
const KC_PROXY   = 'http://w5cg0270zrh:4200';

/** Replace all occurrences of the backend origin with the proxy origin. */
function rewriteDiscovery(body) {
  // Match both lower-case and the ALLCAPS hostname Keycloak sometimes emits.
  return body
    .replace(/http:\/\/w5cg0270zrh:8083/gi, KC_PROXY)
    .replace(/http:\/\/W5CG0270ZRH:8083/gi,  KC_PROXY);
}

module.exports = {
  '/api': {
    target: KC_BACKEND,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/api': '/rest/1.6/secure',
    },
  },

  '/auth': {
    target: KC_BACKEND,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    // selfHandleResponse is required by responseInterceptor (http-proxy-middleware v2.x)
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req) => {
      // Only rewrite the OIDC discovery document
      if (req.url && req.url.includes('.well-known/openid-configuration')) {
        const body = responseBuffer.toString('utf8');
        console.log('[proxy] Rewriting OIDC discovery URLs for:', req.url);
        return rewriteDiscovery(body);
      }
      // All other /auth responses are passed through unchanged
      return responseBuffer;
    }),
  },

  '/client/rest/1.6': {
    target: KC_BACKEND,
    secure: false,
    logLevel: 'debug',
    changeOrigin: true,
  },

  '/winwrap': {
    target: KC_BACKEND,
    secure: false,
    logLevel: 'debug',
    changeOrigin: true,
  },
};
