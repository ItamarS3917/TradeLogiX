import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress "use client" directive warnings from Material-UI
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled'
          ],
          'charts-vendor': [
            'recharts',
            'chart.js',
            'react-chartjs-2',
            '@nivo/bar',
            '@nivo/core',
            '@nivo/heatmap'
          ],
          'firebase-vendor': [
            'firebase/app',
            'firebase/firestore',
            'firebase/analytics'
          ],
          'date-vendor': ['date-fns', 'react-datepicker'],
          'form-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'yup'
          ],
          'grid-vendor': [
            'react-grid-layout',
            'react-resizable',
            'react-virtualized-auto-sizer',
            'react-window'
          ]
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    sourcemap: true,
    chunkSizeWarningLimit: 1000 // Increase warning limit to 1MB
  },
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
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Add aliases for contexts to help with import resolution
      '@contexts': '/app/src/contexts',
      '@components': '/app/src/components'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.{test,spec}.{js,jsx}',
        'src/main.jsx',
        'dist/'
      ]
    }
  }
});
