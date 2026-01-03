import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/stores': path.resolve(__dirname, './src/stores'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/utils': path.resolve(__dirname, './src/utils'),
      },
    },
    server: {
      port: 5175,
      // Proxy API requests to backend server (CORS workaround)
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true, // Enable WebSocket proxying
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('[Proxy Error]', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('[Proxy Request]', req.method, req.url, '→', proxyReq.path);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('[Proxy Response]', req.url, '←', proxyRes.statusCode);
            });
          },
        },
        // WebSocket proxy for Socket.IO
        '/socket.io': {
          target: env.VITE_WS_URL || 'http://localhost:3001',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
