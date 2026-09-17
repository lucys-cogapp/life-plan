import { en } from './en'

type Props = {
  days: Date[]
  totals: number[]
  activeIndex: number
  todayIndex: number
  onSelect: (index: number) => void
}

const base =
  'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 border-b-2 px-1 text-xs'

export function WeekStrip({ days, totals, activeIndex, todayIndex, onSelect }: Props) {
  return (
    <nav aria-label={en.week.strip} className="flex border-slate-200 border-b bg-white lg:hidden">
      {days.map((day, index) => {
        const active = index === activeIndex
        return (
          <button
            key={day.toDateString()}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={active ? 'true' : undefined}
            aria-label={en.week.jumpTo(en.days.long[index])}
            className={`${base} ${
              active ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'
            }`}
          >
            <span aria-hidden="true" className={index === todayIndex ? 'font-bold' : 'font-medium'}>
              {en.days.short[index].slice(0, 1)}
            </span>
            <span aria-hidden="true" className="tabular-nums">
              {totals[index] > 0 ? totals[index] : '·'}
            </span>
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => onSelect(7)}
        aria-current={activeIndex === 7 ? 'true' : undefined}
        className={`${base} ${
          activeIndex === 7
            ? 'border-slate-900 text-slate-900'
            : 'border-transparent text-slate-500'
        } border-slate-200 border-l font-medium`}
      >
        {en.week.tab}
      </button>
    </nav>
  )
}
