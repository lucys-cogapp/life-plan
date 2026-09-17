import { en } from './en'

// Keys are built from local date parts rather than toISOString, which reports UTC
// and would file an evening meal under the previous day for anywhere west of
// Greenwich, and under the next day during British Summer Time.
export function toDateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  next.setDate(next.getDate() + days)
  return next
}

// getDay() counts from Sunday, so Sunday sits at the end of the week that began
// six days earlier rather than starting one of its own.
export function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return addDays(start, -((start.getDay() + 6) % 7))
}

export function weekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b)
}

export function formatDayHeading(date: Date): string {
  const day = en.days.long[(date.getDay() + 6) % 7]
  return `${day} ${date.getDate()} ${en.months.long[date.getMonth()]}`
}

export function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6)
  const endLabel = `${end.getDate()} ${en.months.short[end.getMonth()]} ${end.getFullYear()}`
  if (weekStart.getMonth() === end.getMonth()) {
    return `${weekStart.getDate()}–${endLabel}`
  }
  return `${weekStart.getDate()} ${en.months.short[weekStart.getMonth()]} – ${endLabel}`
}
