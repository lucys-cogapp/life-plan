import { useEffect, useId, useState } from 'react'
import { toCsv } from './csv'
import { en } from './en'
import type { MealsByDate } from './meals'
import { dayTotal } from './meals'
import { toDateKey } from './week'

function downloadCsv(meals: MealsByDate) {
  // The BOM is what stops Excel reading a UTF-8 meal name as mojibake.
  const blob = new Blob([`\ufeff${toCsv(meals)}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = en.csv.filename(toDateKey(new Date()))
  link.click()
  // Revoked a tick later: Safari cancels a download whose object URL goes out
  // from under it in the same task.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

type Props = {
  days: Date[]
  meals: MealsByDate
  target: number
  headingId: string
  onTargetChange: (target: number) => void
  onSelectDay: (index: number) => void
}

export function WeekOverview({
  days,
  meals,
  target,
  headingId,
  onTargetChange,
  onSelectDay,
}: Props) {
  const ids = useId()
  const [draft, setDraft] = useState(String(target))

  // The stored target also changes when another tab writes it, so the field
  // follows the saved value rather than only its own edits.
  useEffect(() => setDraft(String(target)), [target])

  const totals = days.map((day) => dayTotal(meals, toDateKey(day)))
  const eaten = totals.reduce((sum, total) => sum + total, 0)
  const busiest = Math.max(target / 7, ...totals)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const parsed = Number(draft)
    if (!Number.isFinite(parsed) || parsed < 0) return
    onTargetChange(Math.round(parsed))
  }

  return (
    <section
      aria-labelledby={headingId}
      className="h-full w-full shrink-0 snap-center overflow-y-auto px-4 py-4 lg:h-auto lg:overflow-visible lg:col-span-7 lg:border-slate-200 lg:border-t"
    >
      <h2 id={headingId} className="font-semibold text-lg text-slate-900">
        {en.week.overview}
      </h2>

      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-200 p-3">
          <dt className="text-slate-600 text-sm">{en.totals.weekTotal}</dt>
          <dd className="font-semibold text-slate-900 text-xl tabular-nums">
            {en.totals.kcal(eaten)}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <dt className="text-slate-600 text-sm">{en.totals.average}</dt>
          <dd className="font-semibold text-slate-900 text-xl tabular-nums">
            {en.totals.kcal(Math.round(eaten / 7))}
          </dd>
        </div>
      </dl>

      <ul className="mt-4 flex flex-col gap-1">
        {days.map((day, index) => {
          const total = totals[index]
          return (
            <li key={toDateKey(day)}>
              <button
                type="button"
                onClick={() => onSelectDay(index)}
                className="flex min-h-11 w-full items-center gap-3 rounded-md px-2 text-left hover:bg-slate-100"
              >
                <span className="w-10 shrink-0 text-slate-600 text-sm">{en.days.short[index]}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <span
                    className="block h-full rounded-full bg-emerald-600"
                    style={{
                      width: `${busiest > 0 ? Math.min(100, (total / busiest) * 100) : 0}%`,
                    }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right text-slate-900 tabular-nums">
                  {total.toLocaleString('en-GB')}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <form onSubmit={submit} className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <h3 className="font-semibold text-slate-900">{en.target.heading}</h3>
        <label htmlFor={`${ids}-target`} className="mt-2 block font-medium text-slate-700 text-sm">
          {en.target.label}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id={`${ids}-target`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            type="number"
            inputMode="numeric"
            min="0"
            step="50"
            className="min-h-11 w-full min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-base"
          />
          <button
            type="submit"
            className="min-h-11 shrink-0 whitespace-nowrap rounded-md bg-slate-900 px-4 font-medium text-white hover:bg-slate-700"
          >
            {en.target.save}
          </button>
        </div>
        {target > 0 && (
          <p className="mt-2 text-slate-600 text-sm">{en.target.hint(Math.round(target / 7))}</p>
        )}
      </form>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <h3 className="font-semibold text-slate-900">{en.csv.heading}</h3>
        <p className="mt-1 text-slate-600 text-sm">{en.csv.hint}</p>
        <button
          type="button"
          onClick={() => downloadCsv(meals)}
          className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-4 font-medium hover:bg-slate-100"
        >
          {en.csv.button}
        </button>
      </div>

      <p className="mt-5 text-center text-slate-500 text-sm">
        <a className="underline underline-offset-4 hover:text-slate-900" href={__REPO_URL__}>
          {en.repoLink}
        </a>
      </p>
    </section>
  )
}
