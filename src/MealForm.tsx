import { useId, useState } from 'react'
import { en } from './en'
import { type Meal, type MealDraft, type MealType, mealTypes } from './meals'

type Props = {
  onSubmit: (draft: MealDraft) => void
  // Present when editing an existing meal, absent when adding a new one.
  meal?: Meal
  onCancel?: () => void
  // What the type starts on when adding. `DayPanel` passes the type last used on
  // that day, so logging three snacks does not mean picking "snack" three times.
  initialType?: MealType
}

export function MealForm({ onSubmit, meal, onCancel, initialType }: Props) {
  const ids = useId()
  const editing = meal !== undefined
  const [name, setName] = useState(meal?.name ?? '')
  const [calories, setCalories] = useState(meal ? String(meal.calories) : '')
  const [type, setType] = useState<MealType>(meal?.type ?? initialType ?? 'breakfast')

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const parsed = Number(calories)
    if (!Number.isFinite(parsed) || parsed < 0 || calories.trim() === '') return
    onSubmit({
      name: name.trim() === '' ? en.meal.types[type] : name.trim(),
      calories: Math.round(parsed),
      type,
    })
  }

  return (
    <form
      onSubmit={submit}
      aria-label={editing ? en.meal.editForm(meal.name) : en.meal.addForm}
      className={`rounded-lg border p-3 ${
        editing ? 'border-slate-400 bg-white' : 'mt-4 border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor={`${ids}-name`} className="font-medium text-slate-700 text-sm">
          {en.meal.name}
        </label>
        <input
          id={`${ids}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={en.meal.namePlaceholder}
          // Neither form is on screen until a button is tapped to open it, so
          // reaching this field means the keyboard is wanted.
          // biome-ignore lint/a11y/noAutofocus: only on the form the user opened
          autoFocus
          className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-base"
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-1">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${ids}-type`} className="font-medium text-slate-700 text-sm">
            {en.meal.type}
          </label>
          <select
            id={`${ids}-type`}
            value={type}
            onChange={(event) => setType(event.target.value as MealType)}
            className="min-h-11 rounded-md border border-slate-300 bg-white px-2 text-base"
          >
            {mealTypes.map((option) => (
              <option key={option} value={option}>
                {en.meal.types[option]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${ids}-calories`} className="font-medium text-slate-700 text-sm">
            {en.meal.calories}
          </label>
          <input
            id={`${ids}-calories`}
            value={calories}
            onChange={(event) => setCalories(event.target.value)}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            required
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-base"
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          className="min-h-11 flex-1 rounded-md bg-slate-900 px-4 font-medium text-white hover:bg-slate-700"
        >
          {editing ? en.meal.save : en.meal.add}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 shrink-0 rounded-md border border-slate-300 px-4 font-medium hover:bg-slate-100"
          >
            {en.meal.cancel}
          </button>
        )}
      </div>
    </form>
  )
}
