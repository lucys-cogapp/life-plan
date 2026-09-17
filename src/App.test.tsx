import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App'
import { en } from './en'
import { formatDayHeading, toDateKey } from './week'

afterEach(() => localStorage.clear())

const today = new Date()

function todayPanel() {
  return within(screen.getByRole('region', { name: new RegExp(formatDayHeading(today)) }))
}

async function logMeal(name: string, calories: string) {
  const user = userEvent.setup()
  const panel = todayPanel()
  await user.type(panel.getByLabelText(en.meal.name), name)
  await user.type(panel.getByLabelText(en.meal.calories), calories)
  await user.click(panel.getByRole('button', { name: en.meal.add }))
}

test('renders the app name', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: en.appName })).toBeInTheDocument()
})

test('the week runs Monday to Sunday with the overview after it', () => {
  render(<App />)
  const strip = within(screen.getByRole('navigation', { name: en.week.strip }))
  for (const day of en.days.long) {
    expect(strip.getByRole('button', { name: en.week.jumpTo(day) })).toBeInTheDocument()
  }
  expect(strip.getByRole('button', { name: en.week.tab })).toBeInTheDocument()
})

test('the countdown starts at the full weekly target', () => {
  render(<App />)
  expect(screen.getByText(en.totals.left(14000))).toBeInTheDocument()
})

test('a logged meal counts down the weekly target', async () => {
  render(<App />)
  await logMeal('Porridge', '320')
  expect(screen.getByText(en.totals.left(13680))).toBeInTheDocument()
})

test('a logged meal lands on its day and is stored', async () => {
  render(<App />)
  await logMeal('Porridge', '320')
  const panel = todayPanel()
  expect(panel.getByText('Porridge')).toBeInTheDocument()
  expect(panel.getByText(en.meal.value(320))).toBeInTheDocument()
  expect(panel.getByText(en.totals.kcal(320))).toBeInTheDocument()
  expect(localStorage.getItem('meal-tracker:meals')).toContain(toDateKey(today))
})

test('a day holds as many meals as you log', async () => {
  render(<App />)
  await logMeal('Porridge', '320')
  await logMeal('Soup', '280')
  await logMeal('Apple', '95')
  expect(todayPanel().getByText(en.totals.kcal(695))).toBeInTheDocument()
  expect(screen.getByText(en.totals.left(13305))).toBeInTheDocument()
})

test('removing a meal gives the calories back', async () => {
  const user = userEvent.setup()
  render(<App />)
  await logMeal('Porridge', '320')
  await user.click(todayPanel().getByRole('button', { name: en.meal.remove('Porridge') }))
  expect(screen.getByText(en.totals.left(14000))).toBeInTheDocument()
})

test('the weekly target can be changed and the countdown follows', async () => {
  const user = userEvent.setup()
  render(<App />)
  const overview = within(screen.getByRole('region', { name: en.week.overview }))
  await user.clear(overview.getByLabelText(en.target.label))
  await user.type(overview.getByLabelText(en.target.label), '10500')
  await user.click(overview.getByRole('button', { name: en.target.save }))
  expect(screen.getByText(en.totals.left(10500))).toBeInTheDocument()
  expect(localStorage.getItem('meal-tracker:target')).toBe('10500')
})

test('going over the target counts up instead of down', async () => {
  render(<App />)
  await logMeal('Feast', '15000')
  expect(screen.getByText(en.totals.over(1000))).toBeInTheDocument()
})

test('exporting hands over every meal logged', async () => {
  const user = userEvent.setup()
  render(<App />)
  await logMeal('Beans, toast', '410')

  // jsdom implements none of this, so the download is observed through the blob
  // handed to createObjectURL and the anchor the button builds. Stubbing the
  // click also keeps jsdom from logging a failed navigation to the blob URL.
  const blobs: Blob[] = []
  URL.createObjectURL = vi.fn((blob: Blob) => {
    blobs.push(blob)
    return 'blob:test'
  })
  URL.revokeObjectURL = vi.fn()
  const anchors: HTMLAnchorElement[] = []
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    anchors.push(this)
  })

  const overview = within(screen.getByRole('region', { name: en.week.overview }))
  await user.click(overview.getByRole('button', { name: en.csv.button }))
  click.mockRestore()

  expect(anchors[0].download).toBe(en.csv.filename(toDateKey(today)))
  const csv = await blobs[0].text()
  expect(csv).toContain(en.csv.columns.join(','))
  expect(csv).toContain(`${toDateKey(today)},${en.days.long[(today.getDay() + 6) % 7]}`)
  expect(csv).toContain('"Beans, toast",Breakfast,410')
})

test('footer links to the repo', () => {
  render(<App />)
  expect(screen.getByRole('link', { name: en.repoLink })).toHaveAttribute('href', __REPO_URL__)
})
