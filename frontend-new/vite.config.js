import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      clientPort: 3000,
      protocol: 'ws',
    },
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'firebase/app',
      'firebase/firestore',
      'firebase/analytics'
    ],
    force: true
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    sourcemap: true
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Add aliases for contexts to help with import resolution
      '@contexts': '/app/src/contexts',
      '@components': '/app/src/components'
    }
  }
});
