import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json' with { type: 'json' }

// Routes that need a physical path so crawlers (e.g. Google Play) get 200 instead of 404
const CRAWLABLE_ROUTES = ['privacy', 'about', 'settings', 'feedback', 'levels']

/** After build, copy index.html into each route folder so /privacy etc. return 200 without rewrite rules. */
function copyIndexForRoutes() {
  return {
    name: 'copy-index-for-routes',
    closeBundle() {
      const outDir = join(process.cwd(), 'dist')
      const indexPath = join(outDir, 'index.html')
      if (!existsSync(indexPath)) return
      for (const route of CRAWLABLE_ROUTES) {
        const dir = join(outDir, route)
        mkdirSync(dir, { recursive: true })
        copyFileSync(indexPath, join(dir, 'index.html'))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyIndexForRoutes()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
