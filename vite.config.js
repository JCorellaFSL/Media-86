import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },

  // Performance optimizations
  build: {
    // Enable tree-shaking and minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Separate chunks for better caching
        manualChunks: {
          // Vendor libraries
          'react-vendor': ['react', 'react-dom'],
          'icons': ['react-icons/md'],
          'tauri': ['@tauri-apps/api/core', '@tauri-apps/plugin-dialog', '@tauri-apps/plugin-cli'],
          'utils': ['react-hot-toast'],
        },
        // Optimize chunk names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Chunk size optimization
    chunkSizeWarningLimit: 1000,
    
    // Source maps for debugging (disabled in production for smaller bundle)
    sourcemap: process.env.NODE_ENV === 'development',
  },

  // Optimizations for dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-hot-toast',
      '@tauri-apps/api/core',
      '@tauri-apps/plugin-dialog',
      '@tauri-apps/plugin-cli',
    ],
    exclude: [
      '@tauri-apps/api/event', // Dynamically imported
    ],
  },

  // CSS optimizations
  css: {
    devSourcemap: process.env.NODE_ENV === 'development',
  },
}));
