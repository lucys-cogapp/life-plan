import { en } from './en'
import type { MealsByDate } from './meals'
import { fromDateKey } from './week'

// RFC 4180: a field needs quoting once it holds a delimiter, a quote or a line
// break, and an inner quote is written twice. Meal names are free text, so
// "Beans, toast" would otherwise arrive as two columns.
function field(value: string | number): string {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function row(values: (string | number)[]): string {
  return values.map(field).join(',')
}

// Every meal ever logged, oldest first. Date keys are zero-padded, so sorting
// them as strings sorts them as dates.
export function toCsv(meals: MealsByDate): string {
  const rows = Object.keys(meals)
    .sort()
    .flatMap((dateKey) => {
      const date = fromDateKey(dateKey)
      const day = en.days.long[(date.getDay() + 6) % 7]
      return meals[dateKey].map((meal) =>
        row([dateKey, day, meal.name, en.meal.types[meal.type], meal.calories]),
      )
    })
  // Trailing newline: a file without one reads as truncated to some tools.
  return `${[row([...en.csv.columns]), ...rows].join('\r\n')}\r\n`
}
