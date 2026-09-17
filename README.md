# starter-app

React SPA template: Vite, TypeScript (strict), Tailwind v4, Biome, Vitest, Lefthook,
GitHub Actions CI and GitHub Pages deploy. Installable to a phone home screen.

## Use

Click **Use this template** on GitHub, then:

```sh
npm install   # also installs the Lefthook pre-commit hooks
npm run dev
```

### Renaming

Update these, then `npm test` to confirm nothing still points at the template:

| Where | What |
| --- | --- |
| `package.json` | `name` (also namespaces the localStorage keys) and `repository` (the footer link) |
| `index.html` | `<title>` and `apple-mobile-web-app-title` |
| `vite.config.ts` | the manifest `name`, `short_name` and `description` |
| `src/en.ts` | `appName` and the rest of the UI copy |
| `public/` | the icons and `favicon.svg` |

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm test` | Run tests once |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:coverage` | Tests with a v8 coverage report |
| `npm run lint` | Biome check |
| `npm run format` | Biome check with fixes applied |
| `npm run typecheck` | `tsc -b --noEmit` |

## What's included

- **`src/en.ts`** holds the UI copy, so strings are changed in one place.
- **`useLocalStorage`** is a typed hook returning `[value, setValue, remove]`. It
  survives storage being blocked or full, and syncs across open tabs. The counter on
  the page is the worked example.
- **A web app manifest and icons**, so the site installs to an Android or iOS home
  screen and opens without browser chrome. There is no service worker, so it needs a
  connection.

## Deploying

Pushing to `main` builds and deploys to GitHub Pages. Enable it once per repo:
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

The workflow sets Vite's `base` from the repo name, so a project site at
`/<repo>/` and a `<user>.github.io` site at `/` both work without edits. It also
copies `index.html` to `404.html` so client-side routes survive a page refresh.
