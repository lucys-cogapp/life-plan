import { en } from './en'
import { useLocalStorage } from './useLocalStorage'

export default function App() {
  const [count, setCount, resetCount] = useLocalStorage(`${__APP_KEY__}:count`, 0)

  return (
    <div className="flex min-h-dvh flex-col bg-white text-slate-900">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{en.appName}</h1>
        <p className="text-slate-600">{en.tagline}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCount(count + 1)}
            className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
          >
            {en.counter.label(count)}
          </button>
          <button
            type="button"
            onClick={resetCount}
            className="rounded-md border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100"
          >
            {en.counter.reset}
          </button>
        </div>
        <p className="text-slate-500 text-sm">{en.counter.hint}</p>
      </main>
      <footer className="border-slate-200 border-t px-6 py-4 text-center text-slate-600 text-sm">
        <a className="underline underline-offset-4 hover:text-slate-900" href={__REPO_URL__}>
          {en.footer.repoLink}
        </a>
      </footer>
    </div>
  )
}
