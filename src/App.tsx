import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { DayPanel } from './DayPanel'
import { en } from './en'
import { addMeal, dayTotal, type MealsByDate, mealsOn, removeMeal, weekTotal } from './meals'
import { useLocalStorage } from './useLocalStorage'
import { WeekOverview } from './WeekOverview'
import { WeekStrip } from './WeekStrip'
import { addDays, formatWeekRange, isSameDay, startOfWeek, toDateKey, weekDays } from './week'

const defaultTarget = 14000

export default function App() {
  const ids = useId()
  const [meals, setMeals] = useLocalStorage<MealsByDate>(`${__APP_KEY__}:meals`, {})
  const [target, setTarget] = useLocalStorage(`${__APP_KEY__}:target`, defaultTarget)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const track = useRef<HTMLDivElement>(null)

  const days = weekDays(weekStart)
  const dateKeys = days.map(toDateKey)
  const today = new Date()
  const todayIndex = days.findIndex((day) => isSameDay(day, today))
  const onCurrentWeek = isSameDay(weekStart, startOfWeek(today))

  const [activeIndex, setActiveIndex] = useState(() => (todayIndex >= 0 ? todayIndex : 0))

  // scrollIntoView rather than a scrollTo of clientWidth * index: on the first
  // paint the track has not been laid out, so that arithmetic is 0 * index and
  // the view stays on Monday however the strip is set. It also jumps rather than
  // animating, because a smooth scroll fires a scroll event for every day it
  // passes and drags the strip highlight across all of them.
  const scrollToPanel = useCallback((index: number) => {
    const panel = track.current?.children[index]
    // jsdom implements no scrolling. Every panel is in the DOM either way, so
    // without it the strip still selects, it just does not move.
    if (!(panel instanceof HTMLElement) || typeof panel.scrollIntoView !== 'function') return
    panel.scrollIntoView({ inline: 'start', block: 'nearest' })
  }, [])

  // Open on today, the day being logged nine times out of ten. Paging away from
  // the week that holds today opens on its Monday instead.
  useEffect(() => {
    const index = todayIndex >= 0 ? todayIndex : 0
    setActiveIndex(index)
    scrollToPanel(index)
  }, [todayIndex, scrollToPanel])

  function selectPanel(index: number) {
    setActiveIndex(index)
    scrollToPanel(index)
  }

  function onTrackScroll() {
    const element = track.current
    if (!element || element.clientWidth === 0) return
    const index = Math.round(element.scrollLeft / element.clientWidth)
    setActiveIndex((current) => (current === index ? current : index))
  }

  function goToWeek(offset: number) {
    setWeekStart((current) => addDays(current, offset * 7))
  }

  const eaten = weekTotal(meals, dateKeys)
  const remaining = target - eaten
  const dailyBudget = Math.round(target / 7)
  const filled = target > 0 ? Math.min(100, (eaten / target) * 100) : 0

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white text-slate-900 lg:h-auto lg:min-h-dvh lg:overflow-visible">
      <header className="shrink-0 border-slate-200 border-b bg-white">
        <div className="flex h-9 items-center justify-between gap-2 px-4 pt-1">
          <h1 className="font-medium text-slate-500 text-sm">{en.appName}</h1>
          {!onCurrentWeek && (
            <button
              type="button"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="min-h-8 rounded-md border border-slate-300 px-3 font-medium text-sm hover:bg-slate-100"
            >
              {en.week.thisWeek}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 px-2 pb-2">
          <button
            type="button"
            onClick={() => goToWeek(-1)}
            aria-label={en.week.previous}
            className="flex size-11 items-center justify-center rounded-md text-2xl text-slate-600 hover:bg-slate-100"
          >
            ‹
          </button>
          <p className="flex-1 text-center font-semibold text-slate-900 text-xl tracking-tight">
            {formatWeekRange(weekStart)}
          </p>
          <button
            type="button"
            onClick={() => goToWeek(1)}
            aria-label={en.week.next}
            className="flex size-11 items-center justify-center rounded-md text-2xl text-slate-600 hover:bg-slate-100"
          >
            ›
          </button>
        </div>

        <WeekStrip
          days={days}
          totals={dateKeys.map((key) => dayTotal(meals, key))}
          activeIndex={activeIndex}
          todayIndex={todayIndex}
          onSelect={selectPanel}
        />
      </header>

      <main
        ref={track}
        onScroll={onTrackScroll}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] lg:grid lg:grid-cols-7 lg:overflow-x-visible [&::-webkit-scrollbar]:hidden"
      >
        {days.map((day, index) => (
          <DayPanel
            key={dateKeys[index]}
            date={day}
            meals={mealsOn(meals, dateKeys[index])}
            dailyBudget={dailyBudget}
            isToday={index === todayIndex}
            headingId={`${ids}-day-${index}`}
            onAdd={(meal) => setMeals((current) => addMeal(current, dateKeys[index], meal))}
            onRemove={(mealId) =>
              setMeals((current) => removeMeal(current, dateKeys[index], mealId))
            }
          />
        ))}
        {/* The overview rides at the end of the day panels, so reaching it is one
            more swipe rather than a separate screen. */}
        <WeekOverview
          days={days}
          meals={meals}
          target={target}
          headingId={`${ids}-overview`}
          onTargetChange={setTarget}
          onSelectDay={selectPanel}
        />
      </main>

      <footer className="shrink-0 border-slate-200 border-t bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${remaining < 0 ? 'bg-rose-600' : 'bg-emerald-600'}`}
            style={{ width: `${filled}%` }}
          />
        </div>
        <p
          aria-live="polite"
          className="mt-2 flex flex-wrap items-baseline justify-between gap-x-2"
        >
          <span
            className={`font-bold text-2xl tabular-nums ${
              remaining < 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {remaining >= 0 ? en.totals.left(remaining) : en.totals.over(Math.abs(remaining))}
          </span>
          <span className="text-slate-600 text-sm">{en.totals.ofTarget(target)}</span>
        </p>
      </footer>
    </div>
  )
}
