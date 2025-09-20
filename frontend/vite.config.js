import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-contract-config',
      buildEnd: () => {
        const src = resolve(__dirname, 'contract-config.html')
        const dest = resolve(__dirname, 'dist/contract-config.html')
        
        if (existsSync(src)) {
          copyFileSync(src, dest)
          console.log('Contract config file copied to dist directory')
        }
      }
    }
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
