import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    server: {
      port: 8080,
      host: '0.0.0.0'
    },
    build: {
      target: 'es2020',
      minify: isProduction ? 'terser' : false,
      sourcemap: !isProduction,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.debug'] : []
        }
      },
      rollupOptions: {
        output: {
          // Code splitting strategy
          manualChunks: (id) => {
            // Three.js in separate chunk
            if (id.includes('node_modules/three')) {
              return 'three';
            }
            // Map assets dynamically imported
            if (id.includes('/scene/maps/')) {
              const match = id.match(/maps\/([^/]+)/);
              return match ? `map-${match[1]}` : 'map';
            }
            // Rendering system
            if (id.includes('/rendering/')) {
              return 'rendering';
            }
            // Networking
            if (id.includes('/networking/')) {
              return 'networking';
            }
            // Core game logic
            if (id.includes('/gameplay/') || id.includes('/mechanics/')) {
              return 'gameplay';
            }
            // Weapons system
            if (id.includes('/weapons/')) {
              return 'weapons';
            }
          },
          // Optimize chunk names
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      // Build performance
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: true
    },
    plugins: [
      // Brotli compression
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false
      }),
      // Gzip compression
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false
      }),
      // Bundle analyzer (production only)
      isProduction && visualizer({
        filename: './dist/stats.html',
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    // Optimize dependencies
    optimizeDeps: {
      include: ['three', 'msgpackr'],
      exclude: []
    },
    // Performance optimizations
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
  };
});
