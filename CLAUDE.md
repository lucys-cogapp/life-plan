# CLAUDE.md

A weekly meal and calorie tracker, built on a React SPA template. Vite, TypeScript
strict, Tailwind v4, Biome, Vitest, Lefthook, deployed to GitHub Pages by Actions.

## What the app is

Log any number of meals a day against a weekly calorie target. Phone first: that is
where it is used, so a change that reads well on a laptop and badly on a 375px screen
is a change that has not landed yet.

- The week is Monday to Sunday, anchored in `src/week.ts`. `getDay()` counts from
  Sunday, so every week calculation goes through `startOfWeek` rather than open-coding
  the offset.
- Eight panels, not seven: Monday to Sunday, then the week overview. The overview is a
  panel in the same swipe track rather than a separate screen, which is why the index
  `7` means the overview throughout `App.tsx`.
- Below `lg` the shell is exactly one viewport tall (`h-dvh`, `overflow-hidden`) with
  the week controls fixed at the top and the weekly countdown fixed at the bottom. The
  panels scroll inside themselves, so neither piece of chrome moves while a long day is
  read. Above `lg` that fixed height is dropped and the page scrolls normally, because
  a seven-column grid cannot be squeezed into one screen.
- The countdown is at the bottom, by the thumb, not in the header. The add-meal form is
  at the top of each day, above the list, so it stays put as the day fills up.
- Panels are moved with `scrollIntoView` on the child, never `scrollTo` of
  `clientWidth * index`: on the first paint the track is not laid out, that arithmetic
  is zero, and the view sticks on Monday while the strip says otherwise.
- Panels live in one horizontally scrolling track using CSS scroll snap, no carousel
  library. The `lg:` breakpoint turns that same track into a seven-column grid with the
  overview spanning the row beneath, so there is one DOM tree for both layouts. Keep it
  that way: rendering the panels twice behind `hidden`/`lg:hidden` duplicates every
  form control.
- Every panel stays mounted whatever is on screen, because the track scrolls through
  them. Tests therefore have to scope queries with `within(...)`, or they match seven
  identical add-meal forms at once.
- The strip is `<nav>` with `aria-current`, not ARIA tabs. On a wide screen all the
  panels are visible at once, which a tablist would misdescribe.

## Data

- A meal is `{ id, name, calories, type }`, type being breakfast, lunch, dinner or
  snack. A blank name falls back to the meal type label. A meal row writes its figure
  as `420kcals`; the day and week totals read `1,875 kcal`.
- Meals are keyed by local date (`2026-09-17`) in one flat object, not grouped into
  weeks. A week is then just a range of keys, so paging back through past weeks needs
  no migration when the week boundary or the target changes.
- Date keys are built from local date parts. `toISOString` reports UTC and would file
  an evening meal under the wrong day during British Summer Time.
- One weekly target applies to every week, stored on its own. The header counts it
  down and switches to counting up once the week goes over. Each day shows the target
  divided by seven as a guide; there is no separate daily target and adding one was
  considered and declined.
- Removing the last meal of a day drops the key rather than leaving `[]`, so storage
  does not grow an entry for every day the app was opened.

## Setup

```sh
npm install   # the prepare script runs `lefthook install` and wires the git hooks
```

Lefthook is an npm devDependency here because this is a JS repo, so `npm install` is
all it takes. Install it with `brew install lefthook` only in a repo that has no
`package.json` (a Python project, say), and run `lefthook install` by hand there.

If a commit ever runs without the hooks firing, the hooks are not installed: run
`npx lefthook install`.

## Commands

```sh
npm run dev         # dev server (the user runs this, not Claude)
npm test            # vitest run
npm run lint        # biome check .
npm run format      # biome check --write .
npm run typecheck   # tsc -b --noEmit
npm run build       # tsc -b && vite build
```

After significant work run `npm run format`, `npm run typecheck` and `npm test`.

## Conventions

- Biome for lint and format. Never ESLint or Prettier.
- Tailwind v4 configures itself in CSS. `src/index.css` holds `@import 'tailwindcss'`;
  there is no `tailwind.config.js` and adding one is not the v4 way. Put theme
  customisation in an `@theme` block in that file.
- UI copy lives in `src/en.ts`, not in components. Tests assert against `en` too, so
  rewording a string does not break them. Day and month names count as copy and live
  there as arrays rather than coming from `Intl`.
- The app is light only. There is no dark mode and no `dark:` variant anywhere; adding
  one means adding the whole theme layer, not a stray class.
- Tests sit next to the code as `*.test.tsx`, using Testing Library. Query by role
  and accessible name, not by test id.
- `src/test/setup.ts` registers the jest-dom matchers and cleans up after each test.
- Vitest config lives in the `test` key of `vite.config.ts`, which is why that file
  imports `defineConfig` from `vitest/config` rather than from `vite`.

## Storage

Two keys hold everything: `<name>:meals` and `<name>:target`. There is no account and
nothing leaves the device, so clearing site data clears the log.

**What is in localStorage is the only copy.** The app is deployed and in use, so those
two keys are a live data format, not an implementation detail. There is no server, no
backup and no export, which means a change that makes existing data unreadable loses
meals the user actually logged, silently, with nothing to restore from.

So never, in one step:

- rename or renamespace a key, including by changing `name` in `package.json`, which
  feeds `__APP_KEY__`
- change the shape of a stored value: the `Meal` fields, the `MealsByDate` map, the
  `2026-09-17` date key format, or the target being a bare number
- change what a stored value means, such as reading the target as daily rather than
  weekly

If a shape genuinely has to change, migrate rather than cut over: read the old shape,
convert it, write the new one, and keep the old key readable until there is reason to
think nothing is still on it. Adding a new optional field to `Meal` is safe as long as
code copes with it being absent on everything already stored. When in doubt, ask rather
than guess: the cost of asking is a question, the cost of guessing is the user's log.

`useLocalStorage(key, initial)` returns `[value, setValue, remove]`. Every access is
wrapped because storage throws, rather than returning null, in Safari private mode and
wherever a site is blocked from storing data.

Writes happen inside the setters, not in an effect. An effect cannot tell a write apart
from a removal that restores the initial value, so an effect-based version either fails
to remove or swallows the write that follows a removal.

Keys are namespaced with `__APP_KEY__` (the package name). Every project site under one
GitHub user shares the `<user>.github.io` origin and therefore one localStorage, so an
unprefixed key collides with every other app deployed from that account.

## The repo URL

The repo link comes from `__REPO_URL__`, a Vite `define` fed by the `repository` field
in `package.json`. Importing `package.json` into a component instead would inline the
whole manifest, devDependency names included, into the client bundle. The link sits at
the end of the week overview rather than in the `<footer>`, which the countdown took.

The package `name` is also `__APP_KEY__`, which namespaces the storage keys. Renaming
the package orphans every meal already logged in a browser, so treat it as fixed. See
the rule in Storage.

## Deployment and installing to a home screen

`.github/workflows/deploy.yml` builds on push to `main`. It sets `BASE_PATH` from the
repo name because a project site is served from `/<repo>/`, and Vite bakes that prefix
into asset URLs at build time. Hardcoding `base` in `vite.config.ts` would tie the
build to one repo name.

The build also copies `index.html` to `404.html`. Pages has no rewrite rules, so that
copy is what keeps a refreshed client-side route from 404ing. Keep it if you add a
router.

The web manifest is generated by a small plugin in `vite.config.ts` rather than kept in
`public/`, because `start_url` and `scope` need the same base prefix as the assets. iOS
ignores the manifest when installing to a home screen and reads the `apple-` meta tags
in `index.html`, so icon or name changes belong in both places.

There is no service worker, so the app does not work offline. Adding one means taking
on a cache-invalidation cycle on every deploy; do it only when asked.

## Working on this repo

- Use the package manager for dependencies (`npm install` / `npm uninstall`) rather than
  hand-editing `package.json`, so versions resolve properly. Editing scripts, config and
  other fields by hand is fine.
- Don't start the dev server; that is the developer's to run.
- Don't break what is already in localStorage. See the rule in Storage: it is the only
  copy of the user's log.
- After significant work, run `npm run format`, `npm run typecheck` and `npm test`, and
  fix what they report before calling the work done.
- If a pre-commit hook fails, read the output and fix the cause. Don't retry until it
  passes by chance or work around the hook.
- A code change that invalidates the docs (this file, the README, a comment) means
  updating them in the same commit. Pure internal refactors with no observable change are
  the exception.

## Comments

Write the one thing a reader cannot infer from the code, next to the code it governs, and
explain *why*. Default to no comment: write the code first, then add one only where you
can name what a competent reader would otherwise get wrong. No banner rules, no markdown
headings in comments, and no comment that restates the signature.

## Commits

One self-contained change per commit, small enough to review at a glance. Imperative
subject of roughly 50 characters or less, no ticket id in the subject. Add a body only
when the *why* is not obvious, kept to a few sentences: it says why the change exists, not
what the diff already shows. Never add AI or Co-Authored-By attribution.

## Prose

This applies to code comments, docs, commit messages and PR text alike. Name the thing,
say what it does, stop. Plain nouns and verbs, a fact rather than an adjective about the
fact. No em-dashes: use a full stop, a comma, parentheses or a colon. Avoid the marketing
register (seamless, robust, leverage, crucial) and filler intensifiers.
