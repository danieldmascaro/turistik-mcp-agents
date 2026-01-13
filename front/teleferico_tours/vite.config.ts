import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Configuración para archivos JS
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        // Configuración para archivos CSS y otros assets
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
})
