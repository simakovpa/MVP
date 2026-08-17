import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/measures/', // nochange — требуется для встраивания в портал
  build: {
    outDir: 'dist',
  },
})
