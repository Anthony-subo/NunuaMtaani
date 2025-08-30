import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.', // make sure root is current folder
  build: {
    outDir: 'dist', // where build goes
    rollupOptions: {
      input: resolve(__dirname, 'index.html'), // tell Vite where index.html is
    },
  },
})
