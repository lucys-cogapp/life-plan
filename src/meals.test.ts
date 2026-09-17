import { expect, test } from 'vitest'
import { addMeal, dayTotal, type Meal, type MealsByDate, removeMeal, weekTotal } from './meals'

const porridge: Meal = { id: 'a', name: 'Porridge', calories: 320, type: 'breakfast' }
const soup: Meal = { id: 'b', name: 'Soup', calories: 280, type: 'lunch' }

test('a day with nothing logged totals zero', () => {
  expect(dayTotal({}, '2026-09-15')).toBe(0)
})

test('a day totals every meal on it, whatever their type', () => {
  const meals = addMeal(addMeal({}, '2026-09-15', porridge), '2026-09-15', soup)
  expect(dayTotal(meals, '2026-09-15')).toBe(600)
})

test('a week totals only the days in it', () => {
  const meals = addMeal(addMeal({}, '2026-09-15', porridge), '2026-09-22', soup)
  expect(weekTotal(meals, ['2026-09-14', '2026-09-15', '2026-09-16'])).toBe(320)
})

test('removing a meal leaves the others', () => {
  const meals = addMeal(addMeal({}, '2026-09-15', porridge), '2026-09-15', soup)
  expect(removeMeal(meals, '2026-09-15', 'a')['2026-09-15']).toEqual([soup])
})

test('removing the last meal drops the day rather than storing an empty one', () => {
  const meals: MealsByDate = addMeal({}, '2026-09-15', porridge)
  expect(removeMeal(meals, '2026-09-15', 'a')).toEqual({})
})
