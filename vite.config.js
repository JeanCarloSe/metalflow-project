import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    // Otimizações de bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separar bibliotecas pesadas em chunks
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/dxf')) return 'dxf';
          if (id.includes('node_modules/dxf-parser')) return 'dxf';
          if (id.includes('node_modules/recharts')) return 'recharts';
          if (id.includes('node_modules/html2pdf')) return 'html2pdf';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
          if (id.includes('node_modules/framer-motion')) return 'motion';
        }
      }
    },
    // Aumentar limite de chunk size warning
    chunkSizeWarningLimit: 1500,
    // Otimizações CSS
    cssCodeSplit: true,
    // Source maps apenas em desenvolvimento
    sourcemap: false
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
    exclude: ['three', 'dxf', 'dxf-parser']
  }
})
