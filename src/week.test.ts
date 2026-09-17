import { expect, test } from 'vitest'
import { addDays, formatWeekRange, isSameDay, startOfWeek, toDateKey, weekDays } from './week'

test('a date key uses local parts, not UTC', () => {
  // 23:30 on the 15th is still the 15th, however far the timezone is from UTC.
  expect(toDateKey(new Date(2026, 8, 15, 23, 30))).toBe('2026-09-15')
})

test('the week starts on Monday', () => {
  const wednesday = new Date(2026, 8, 16)
  expect(toDateKey(startOfWeek(wednesday))).toBe('2026-09-14')
})

test('Sunday belongs to the week that has already begun', () => {
  const sunday = new Date(2026, 8, 20)
  expect(toDateKey(startOfWeek(sunday))).toBe('2026-09-14')
})

test('a week is seven consecutive days', () => {
  const days = weekDays(startOfWeek(new Date(2026, 8, 16)))
  expect(days.map(toDateKey)).toEqual([
    '2026-09-14',
    '2026-09-15',
    '2026-09-16',
    '2026-09-17',
    '2026-09-18',
    '2026-09-19',
    '2026-09-20',
  ])
})

test('adding days crosses a month boundary', () => {
  expect(toDateKey(addDays(new Date(2026, 8, 30), 2))).toBe('2026-10-02')
})

test('isSameDay ignores the time of day', () => {
  expect(isSameDay(new Date(2026, 8, 15, 1), new Date(2026, 8, 15, 22))).toBe(true)
  expect(isSameDay(new Date(2026, 8, 15), new Date(2026, 8, 16))).toBe(false)
})

test('a week range names one month when it does not straddle two', () => {
  expect(formatWeekRange(new Date(2026, 8, 14))).toBe('14–20 Sep 2026')
})

test('a week range names both months when it straddles them', () => {
  expect(formatWeekRange(new Date(2026, 8, 28))).toBe('28 Sep – 4 Oct 2026')
})
