/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { respondWithContributions } from './api/github-contributions';

/**
 * Answers the contribution graph's route while developing, with the same code
 * Vercel runs once deployed. The token comes from .env without a VITE_ prefix,
 * so it stays in this process and never reaches the page.
 */
function contributionsRoute(token: string | undefined): Plugin {
  return {
    name: 'contributions-route',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/github-contributions', (_request, response) => {
        void respondWithContributions({ token, fetch }).then(async (answer) => {
          response.statusCode = answer.status;
          answer.headers.forEach((value, name) => response.setHeader(name, value));
          response.end(await answer.text());
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), contributionsRoute(loadEnv(mode, process.cwd(), '').GITHUB_TOKEN)],
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
