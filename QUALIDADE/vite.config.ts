// VERSION: v1.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Base path para deploy
  server: {
    port: 3005, // Porta para desenvolvimento local
    strictPort: false, // Flexível para deploy
    host: true, // Permite acesso externo
    open: false, // Não abre automaticamente em iframe
    cors: true, // Habilita CORS
    hmr: {
      port: 3005 // HMR na mesma porta
    }
  },
  preview: {
    port: 3005, // Porta para preview
    strictPort: false // Flexível para deploy
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Desabilitar sourcemap para produção
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material']
        }
      }
    }
  }
})
