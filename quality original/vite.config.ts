import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005, // Porta fixa 3005
    strictPort: true, // Força o uso da porta especificada
    host: true, // Permite acesso externo
    open: true, // Abre o navegador automaticamente
    cors: true, // Habilita CORS
    hmr: {
      port: 3005 // HMR na mesma porta
    }
  },
  preview: {
    port: 3005, // Porta para preview também
    strictPort: true
  }
})
