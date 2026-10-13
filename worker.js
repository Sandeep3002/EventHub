// Cloudflare Worker entry point
// Routes /api/* requests to the API handler, everything else to static assets
import { onRequest } from './functions/api/[[path]].js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route all /api/* requests to the API handler
    if (url.pathname.startsWith('/api')) {
      return onRequest({ request, env });
    }

    // For everything else, fall through to static assets (handled by Cloudflare Assets)
    return env.ASSETS.fetch(request);
  },
};
