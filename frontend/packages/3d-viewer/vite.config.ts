import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '3DViewer',
      fileName: (format) => `index.${format === 'es' ? 'js' : 'umd.js'}`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['@babylonjs/core', '@babylonjs/loaders'],
      output: {
        globals: {
          '@babylonjs/core': 'BABYLON',
          '@babylonjs/loaders': 'BABYLON.LOADERS'
        }
      }
    },
    sourcemap: true,
    target: 'es2020'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
