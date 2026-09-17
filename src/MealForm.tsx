import { useId, useState } from 'react'
import { en } from './en'
import { type Meal, type MealType, mealTypes, newMealId } from './meals'

type Props = {
  onAdd: (meal: Meal) => void
}

export function MealForm({ onAdd }: Props) {
  const ids = useId()
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  // The type carries over between entries: logging three snacks in a row should
  // not mean picking "snack" three times.
  const [type, setType] = useState<MealType>('breakfast')

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const parsed = Number(calories)
    if (!Number.isFinite(parsed) || parsed < 0 || calories.trim() === '') return
    onAdd({
      id: newMealId(),
      name: name.trim() === '' ? en.meal.types[type] : name.trim(),
      calories: Math.round(parsed),
      type,
    })
    setName('')
    setCalories('')
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${ids}-name`} className="font-medium text-slate-700 text-sm">
          {en.meal.name}
        </label>
        <input
          id={`${ids}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={en.meal.namePlaceholder}
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
      <button
        type="submit"
        className="mt-3 min-h-11 w-full rounded-md bg-slate-900 px-4 font-medium text-white hover:bg-slate-700"
      >
        {en.meal.add}
      </button>
    </form>
  )
}
