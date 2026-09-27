/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { respondWithContributions } from './api/github-contributions';
import { respondWithApk } from './api/streamcaption-apk';

/**
 * Answers the site's own routes while developing, with the same code Vercel
 * runs once deployed. The token comes from .env without a VITE_ prefix, so it
 * stays in this process and never reaches the page.
 */
function apiRoutes(token: string | undefined): Plugin {
  const routes = {
    '/api/github-contributions': respondWithContributions,
    '/api/streamcaption-apk': respondWithApk,
  };

  return {
    name: 'api-routes',
    apply: 'serve',
    configureServer(server) {
      for (const [path, handler] of Object.entries(routes)) {
        server.middlewares.use(path, (_request, response) => {
          void handler({ token, fetch }).then(async (answer) => {
            response.statusCode = answer.status;
            answer.headers.forEach((value, name) => response.setHeader(name, value));
            // A redirect carries no body, and reading one would hang.
            response.end(answer.status === 302 ? undefined : await answer.text());
          });
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), apiRoutes(loadEnv(mode, process.cwd(), '').GITHUB_TOKEN)],
  assetsInclude: ['**/*.glb'],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
  },
}));
