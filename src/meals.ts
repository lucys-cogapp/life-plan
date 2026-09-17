export const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export type MealType = (typeof mealTypes)[number]

export type Meal = {
  id: string
  name: string
  calories: number
  type: MealType
}

// Meals are keyed by date rather than grouped into weeks, so a week is just a
// range of keys and past weeks stay readable however the week boundary moves.
export type MealsByDate = Record<string, Meal[]>

export function newMealId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function mealsOn(meals: MealsByDate, dateKey: string): Meal[] {
  return meals[dateKey] ?? []
}

export function dayTotal(meals: MealsByDate, dateKey: string): number {
  return mealsOn(meals, dateKey).reduce((total, meal) => total + meal.calories, 0)
}

export function weekTotal(meals: MealsByDate, dateKeys: string[]): number {
  return dateKeys.reduce((total, key) => total + dayTotal(meals, key), 0)
}

export function addMeal(meals: MealsByDate, dateKey: string, meal: Meal): MealsByDate {
  return { ...meals, [dateKey]: [...mealsOn(meals, dateKey), meal] }
}

// Dropping the key rather than leaving an empty array keeps storage from growing
// a entry for every day the user ever opened.
export function removeMeal(meals: MealsByDate, dateKey: string, mealId: string): MealsByDate {
  const remaining = mealsOn(meals, dateKey).filter((meal) => meal.id !== mealId)
  if (remaining.length > 0) return { ...meals, [dateKey]: remaining }
  const { [dateKey]: _dropped, ...rest } = meals
  return rest
}
