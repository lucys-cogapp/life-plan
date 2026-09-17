# meal-tracker

A weekly meal and calorie planner. Log any number of meals a day, see a daily and a
weekly tally, and count a weekly calorie target down as you go. Built for a phone and
installable to a home screen.

**<https://lucys-cogapp.github.io/life-plan/>**

Vite, TypeScript (strict), Tailwind v4, Biome, Vitest, Lefthook, GitHub Actions CI and
GitHub Pages deploy.

## Use

```sh
npm install   # also installs the Lefthook pre-commit hooks
npm run dev
```

## How it works

The week runs Monday to Sunday. On a phone it fills the screen exactly: the week
controls pinned at the top, the countdown pinned at the bottom, and the days as a
swipeable track between them. The strip along the top jumps to a day and shows each
day's running total. An eighth panel sits after Sunday, the week overview, holding the
day-by-day bars, the week's total and average, and the target itself. On a wide screen
the same panels lay out as seven columns with the overview beneath.

A meal is a name, a calorie figure and one of breakfast, lunch, dinner or snack. There
is no limit on how many a day takes, and the day panel groups them under those four
headings. Leaving the name blank falls back to the meal type. The add form sits above
the list so it stays where it is as the day fills up.

The weekly target is one figure that applies to every week. The bar at the foot counts
it down as meals are added and switches to counting up, in red, once the week goes over.
Each day shows its own total against the target divided by seven, as a guide rather than
a limit.

Weeks are kept rather than reset: the arrows page back and forward, and past weeks keep
whatever was logged in them.

**Download CSV**, at the foot of the week overview, writes every meal ever logged to a
spreadsheet: date, day, meal, type, calories. Nothing is stored anywhere but the
browser, so that file is the only backup there is.

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

## Layout

| File | Holds |
| --- | --- |
| `src/App.tsx` | State, the header countdown, week paging and the swipe track |
| `src/WeekStrip.tsx` | The Mon-Sun strip and the week tab |
| `src/DayPanel.tsx` | One day: total, meals grouped by type, the add form |
| `src/WeekOverview.tsx` | The eighth panel: day bars, totals, the target field |
| `src/MealForm.tsx` | Name, type and calorie fields |
| `src/meals.ts` | The meal types and the totalling and editing helpers |
| `src/csv.ts` | The CSV export |
| `src/week.ts` | Monday-anchored week maths and date formatting |
| `src/en.ts` | Every string in the UI |

## Storage

Everything is in `localStorage` under two keys, both namespaced with the package name
because every GitHub Pages project site under one account shares an origin:

- `meal-tracker:meals`, meals keyed by local date (`2026-09-17`)
- `meal-tracker:target`, the weekly calorie target

Nothing leaves the device and there is no account. Clearing the browser's site data
clears the log with it, which is what the CSV export is for.

## Deploying

Pushing to `main` builds and deploys to <https://lucys-cogapp.github.io/life-plan/>.
Enable it once per repo: **Settings → Pages → Build and deployment → Source: GitHub
Actions**.

The workflow sets Vite's `base` from the repo name, so a project site at
`/<repo>/` and a `<user>.github.io` site at `/` both work without edits. It also
copies `index.html` to `404.html` so client-side routes survive a page refresh.

There is no service worker, so the app needs a connection to load.
