import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  css: { postcss: './postcss.config.js' },
  resolve: {
    alias: { '@': '/src' },
    extensions: ['.jsx', '.js', '.tsx', '.ts'],
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: { port: 3001, open: false },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.env.PUBLIC_URL': JSON.stringify(''),
  },
});
