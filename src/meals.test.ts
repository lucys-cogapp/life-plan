import { expect, test } from 'vitest'
import {
  addMeal,
  dayTotal,
  type Meal,
  type MealsByDate,
  removeMeal,
  updateMeal,
  weekTotal,
} from './meals'

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

test('updating a meal keeps its id and its place in the day', () => {
  const meals = addMeal(addMeal({}, '2026-09-15', porridge), '2026-09-15', soup)
  const edited = updateMeal(meals, '2026-09-15', 'a', {
    name: 'Porridge and jam',
    calories: 380,
    type: 'breakfast',
  })
  expect(edited['2026-09-15']).toEqual([
    { id: 'a', name: 'Porridge and jam', calories: 380, type: 'breakfast' },
    soup,
  ])
})

test('a meal can be moved to another type without moving day', () => {
  const meals = addMeal({}, '2026-09-15', porridge)
  const edited = updateMeal(meals, '2026-09-15', 'a', { ...porridge, type: 'snack' })
  expect(edited['2026-09-15'][0].type).toBe('snack')
})

test('updating an id that is not there changes nothing', () => {
  const meals: MealsByDate = addMeal({}, '2026-09-15', porridge)
  expect(updateMeal(meals, '2026-09-15', 'missing', { ...soup })).toEqual(meals)
})
