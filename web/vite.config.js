import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import path from 'path';
import fs from 'fs';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { vitePluginSemiFixed } from './vite/semiPluginFixed.js';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const resolvePackageAlias = (packageName) => {
  const candidates = [
    path.resolve(__dirname, 'node_modules', packageName),
    path.resolve(__dirname, 'node_modules/.pnpm/node_modules', packageName),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const serverUrl = trimTrailingSlash(
    env.VITE_REACT_APP_SERVER_URL || '',
  );
  const proxyTarget = trimTrailingSlash(
    env.VITE_DEV_PROXY_TARGET || serverUrl || 'http://localhost:3000',
  );

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        ...(resolvePackageAlias('@douyinfe/semi-illustrations')
          ? {
              '@douyinfe/semi-illustrations': resolvePackageAlias(
                '@douyinfe/semi-illustrations',
              ),
            }
          : {}),
        ...(resolvePackageAlias('highlight.js')
          ? {
              'highlight.js': resolvePackageAlias('highlight.js'),
            }
          : {}),
        ...(resolvePackageAlias('prop-types')
          ? {
              'prop-types': resolvePackageAlias('prop-types'),
            }
          : {}),
      },
    },
    plugins: [
      codeInspectorPlugin({
        bundler: 'vite',
      }),
      {
        name: 'treat-js-files-as-jsx',
        async transform(code, id) {
          if (!/src\/.*\.js$/.test(id)) {
            return null;
          }

          // Use the exposed transform from vite, instead of directly
          // transforming with esbuild
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          });
        },
      },
      react(),
      vitePluginSemiFixed({
        cssLayer: true,
      }),
    ],
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.json': 'json',
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-core': ['react', 'react-dom', 'react-router-dom'],
            'semi-ui': ['@douyinfe/semi-icons', '@douyinfe/semi-ui'],
            tools: ['axios', 'history', 'marked'],
            'react-components': [
              'react-dropzone',
              'react-fireworks',
              'react-telegram-login',
              'react-toastify',
              'react-turnstile',
            ],
            i18n: [
              'i18next',
              'react-i18next',
              'i18next-browser-languagedetector',
            ],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/mj': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/pg': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
