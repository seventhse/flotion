import path from 'node:path'
import tailwindPostcss from '@tailwindcss/postcss'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  css: {
    postcss: {
      plugins: [
        tailwindPostcss(),
      ],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})
