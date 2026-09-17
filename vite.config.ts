import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vitest/config'

// Read here rather than importing package.json into a component: that would inline
// the whole manifest, devDependency names and all, into the client bundle.
const { name: pkgName, repository } = JSON.parse(readFileSync('./package.json', 'utf8'))

// npm accepts a bare "user/repo" shorthand as well as the { url } object, and the
// field is the first thing a repo made from this template edits.
function resolveRepoUrl(field: unknown): string {
  const raw = typeof field === 'string' ? field : ((field as { url?: string })?.url ?? '')
  if (!raw) {
    throw new Error('package.json needs a "repository" field; the footer link reads from it.')
  }
  const url = raw.replace(/^git\+/, '').replace(/\.git$/, '')
  return /^https?:\/\//.test(url) ? url : `https://github.com/${url.replace(/^github:/, '')}`
}

const repoUrl = resolveRepoUrl(repository)

// configure-pages reports base_path without a trailing slash, and the manifest and
// index.html concatenate this directly onto filenames.
const base = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '/')

// start_url and scope have to carry the same prefix as the assets, so the manifest
// is generated from the base rather than committed as a static file. It is served in
// dev too, otherwise index.html's manifest link 404s on every dev load.
function manifestJson(): string {
  return JSON.stringify(
    {
      name: 'Starter App',
      short_name: 'Starter',
      description: 'React SPA starter.',
      start_url: base,
      scope: base,
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#ffffff',
      icons: [
        { src: `${base}icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png' },
        { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  )
}

function webManifest(): Plugin {
  return {
    name: 'web-manifest',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.endsWith('/manifest.webmanifest')) return next()
        res.setHeader('Content-Type', 'application/manifest+json')
        res.end(manifestJson())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: manifestJson() })
    },
  }
}

// GitHub Pages serves project sites from /<repo>/, so assets need that prefix.
// CI sets BASE_PATH from the repo name; local dev and user/org sites stay at /.
export default defineConfig({
  base,
  define: { __REPO_URL__: JSON.stringify(repoUrl), __APP_KEY__: JSON.stringify(pkgName) },
  plugins: [react(), tailwindcss(), webManifest()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
