import { useState } from 'react'
import { en } from './en'
import { MealForm } from './MealForm'
import { type Meal, type MealDraft, type MealType, mealTypes, newMealId } from './meals'
import { formatDayHeading } from './week'

type Props = {
  date: Date
  meals: Meal[]
  dailyBudget: number
  isToday: boolean
  headingId: string
  onAdd: (meal: Meal) => void
  onUpdate: (mealId: string, draft: MealDraft) => void
  onRemove: (mealId: string) => void
}

export function DayPanel({
  date,
  meals,
  dailyBudget,
  isToday,
  headingId,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [lastType, setLastType] = useState<MealType>('breakfast')
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

      {adding ? (
        <MealForm
          initialType={lastType}
          onSubmit={(draft) => {
            onAdd({ id: newMealId(), ...draft })
            setLastType(draft.type)
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 border-dashed font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
          {en.meal.add}
        </button>
      )}

      {meals.length === 0 ? (
        <p className="mt-4 text-slate-500 text-sm">{en.meal.empty}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {mealTypes.map((type) => {
            const ofType = meals.filter((meal) => meal.type === type)
            if (ofType.length === 0) return null
            const typeTotal = ofType.reduce((sum, meal) => sum + meal.calories, 0)
            return (
              <div key={type}>
                <h3 className="flex items-baseline justify-between gap-2 text-slate-500 text-xs">
                  <span className="font-medium uppercase tracking-wide">{en.meal.types[type]}</span>
                  <span className="tabular-nums">{en.meal.value(typeTotal)}</span>
                </h3>
                <ul className="mt-1 divide-y divide-slate-200 border-slate-200 border-y">
                  {ofType.map((meal) =>
                    meal.id === editingId ? (
                      <li key={meal.id} className="py-2">
                        <MealForm
                          meal={meal}
                          onSubmit={(draft) => {
                            onUpdate(meal.id, draft)
                            setEditingId(null)
                          }}
                          onCancel={() => setEditingId(null)}
                        />
                      </li>
                    ) : (
                      <li key={meal.id} className="flex min-h-11 items-center gap-1 px-1">
                        <span className="flex-1 text-slate-900">{meal.name}</span>
                        <span className="text-slate-600 tabular-nums">
                          {en.meal.value(meal.calories)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingId(meal.id)}
                          aria-label={en.meal.edit(meal.name)}
                          className="ml-1 flex size-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(meal.id)}
                          aria-label={en.meal.remove(meal.name)}
                          className="flex size-9 shrink-0 items-center justify-center rounded-md text-lg text-slate-400 hover:bg-slate-100 hover:text-rose-700"
                        >
                          ×
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function PencilIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}
