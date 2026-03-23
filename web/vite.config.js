import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { codeInspectorPlugin } from 'code-inspector-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

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

          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          });
        },
      },
      react(),
    ],
    // 【关键修改 1】优化依赖配置
    optimizeDeps: {
      force: true,
      // 将 lottie-web 排除在预构建之外，防止 Vite 尝试分析它导致死锁
      exclude: ['lottie-web'], 
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.json': 'json',
        },
      },
    },
    build: {
      // 【关键修改 2】关闭 Sourcemap 以大幅减少内存占用（生产环境建议关闭，调试时可开启）
      sourcemap: false,
      // 【关键修改 3】限制构建 worker 数量，防止并发过高撑爆内存
      worker: {
        maxWorkers: 1, 
      },
      rollupOptions: {
        // 【关键修改 4】忽略 lottie-web 的 eval 警告，防止构建器过度处理
        onwarn(warning, warn) {
          if (warning.code === 'EVAL') return;
          if (warning.message.includes('lottie-web')) return;
          warn(warning);
        },
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
            // 【关键修改 5】将 lottie-web 单独拆分到一个 chunk，避免与其他代码混合混淆
            'lottie-player': ['lottie-web'],
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