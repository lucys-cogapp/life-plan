import { en } from './en'
import { MealForm } from './MealForm'
import { type Meal, mealTypes } from './meals'
import { formatDayHeading } from './week'

type Props = {
  date: Date
  meals: Meal[]
  dailyBudget: number
  isToday: boolean
  headingId: string
  onAdd: (meal: Meal) => void
  onRemove: (mealId: string) => void
}

export function DayPanel({ date, meals, dailyBudget, isToday, headingId, onAdd, onRemove }: Props) {
  const total = meals.reduce((sum, meal) => sum + meal.calories, 0)
  const filled = dailyBudget > 0 ? Math.min(100, (total / dailyBudget) * 100) : 0
  const overBudget = dailyBudget > 0 && total > dailyBudget

  return (
    <section
      aria-labelledby={headingId}
      className="h-full w-full shrink-0 snap-center overflow-y-auto px-4 py-4 lg:h-auto lg:w-auto lg:overflow-visible lg:px-2"
    >
      <h2 id={headingId} className="font-semibold text-lg text-slate-900">
        {formatDayHeading(date)}
        {isToday && (
          <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 align-middle text-white text-xs">
            {en.today}
          </span>
        )}
      </h2>

      <p className="mt-1 text-slate-600 text-sm">
        <span
          className={`font-semibold text-base ${overBudget ? 'text-rose-700' : 'text-slate-900'}`}
        >
          {en.totals.kcal(total)}
        </span>
        {dailyBudget > 0 && <> {en.totals.dayBudget(dailyBudget)}</>}
      </p>
      {dailyBudget > 0 && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${overBudget ? 'bg-rose-600' : 'bg-emerald-600'}`}
            style={{ width: `${filled}%` }}
          />
        </div>
      )}

      <MealForm onAdd={onAdd} />

      {meals.length === 0 ? (
        <p className="mt-4 text-slate-500 text-sm">{en.meal.empty}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {mealTypes.map((type) => {
            const ofType = meals.filter((meal) => meal.type === type)
            if (ofType.length === 0) return null
            return (
              <div key={type}>
                <h3 className="font-medium text-slate-500 text-xs uppercase tracking-wide">
                  {en.meal.types[type]}
                </h3>
                <ul className="mt-1 divide-y divide-slate-200 border-slate-200 border-y">
                  {ofType.map((meal) => (
                    <li key={meal.id} className="flex items-center gap-2 py-1">
                      <span className="flex-1 text-slate-900">{meal.name}</span>
                      <span className="text-slate-600 tabular-nums">
                        {en.meal.value(meal.calories)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemove(meal.id)}
                        aria-label={en.meal.remove(meal.name)}
                        className="flex size-9 items-center justify-center rounded-md text-slate-500 text-lg hover:bg-slate-100 hover:text-rose-700"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
