import { expect, test } from 'vitest'
import { toCsv } from './csv'
import { en } from './en'
import { addMeal, type Meal } from './meals'

const porridge: Meal = { id: 'a', name: 'Porridge', calories: 320, type: 'breakfast' }
const soup: Meal = { id: 'b', name: 'Soup', calories: 280, type: 'lunch' }

const header = en.csv.columns.join(',')

test('an empty log still exports its header', () => {
  expect(toCsv({})).toBe(`${header}\r\n`)
})

test('a meal exports its date, day, name, type and calories', () => {
  expect(toCsv(addMeal({}, '2026-09-17', porridge))).toBe(
    `${header}\r\n2026-09-17,Thursday,Porridge,Breakfast,320\r\n`,
  )
})

test('days come out oldest first however they went in', () => {
  const meals = addMeal(addMeal({}, '2026-09-22', soup), '2026-09-15', porridge)
  expect(toCsv(meals).split('\r\n').slice(1, 3)).toEqual([
    '2026-09-15,Tuesday,Porridge,Breakfast,320',
    '2026-09-22,Tuesday,Soup,Lunch,280',
  ])
})

test('a name holding a comma stays one column', () => {
  const meals = addMeal({}, '2026-09-17', { ...porridge, name: 'Beans, toast' })
  expect(toCsv(meals)).toContain('"Beans, toast"')
})

test('a name holding a quote doubles it', () => {
  const meals = addMeal({}, '2026-09-17', { ...porridge, name: 'The "big" one' })
  expect(toCsv(meals)).toContain('"The ""big"" one"')
})

test('every meal on a day gets its own row', () => {
  const meals = addMeal(addMeal({}, '2026-09-17', porridge), '2026-09-17', soup)
  expect(toCsv(meals).trimEnd().split('\r\n')).toHaveLength(3)
})
