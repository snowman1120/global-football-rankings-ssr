import path, { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue'

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '~/': `${path.resolve(__dirname, 'src')}/`,
      },
    },
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${process.env.VITE_PORT}`,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  });
}
