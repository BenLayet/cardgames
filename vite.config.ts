import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// what was deployed, shown in the About window: the version of package.json and the build date,
// and the commit, which the About link to the source code points to
const commitOf = (): string => {
  // AWS Amplify gives the commit it builds; otherwise ask git
  if (process.env.AWS_COMMIT_ID) return process.env.AWS_COMMIT_ID.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}
const appVersion = {
  version: (JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string }).version,
  commit: commitOf(),
  builtAt: new Date().toISOString(),
}

// version.json, next to the application: the installed application reads it on the server to show
// the number of a newer version (it is not precached by the service worker, which only keeps js, css, html…)
const versionFile = (): Plugin => ({
  name: 'version-file',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify(appVersion) })
  },
})

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    react(),
    versionFile(),
    // makes the game installable on phones and playable offline;
    // a newer version waits until the player chooses to switch to it (About, or the banner)
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'favicon.svg', 'favicon-32x32.png', 'apple-touch-icon.png'],
      manifest: {
        // English by default, French for a device in French (browsers without localized manifests use the default)
        name: 'Card Games',
        short_name: 'Card Games',
        description: 'Card games: Battle, Spider',
        lang: 'en',
        name_localized: {fr: 'Jeux de cartes'},
        short_name_localized: {fr: 'Jeux de cartes'},
        description_localized: {fr: 'Des jeux de cartes : bataille, Spider'},
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0f3b2c',
        theme_color: '#0f3b2c',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // cards, sounds and music are precached so the game works offline
        globPatterns: ['**/*.{js,css,html,svg,png,mp3}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
