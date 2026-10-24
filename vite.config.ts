import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

/** GitHub Pages などサブパス配下に置く場合は PAGES_BASE_PATH を設定する（例: /jouhou） */
const basePath = process.env.PAGES_BASE_PATH || '/'

export default defineConfig({
  base: basePath.endsWith('/') ? basePath : `${basePath}/`,
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
