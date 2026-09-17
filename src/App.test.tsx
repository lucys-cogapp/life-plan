import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test } from 'vitest'
import App from './App'
import { en } from './en'

afterEach(() => localStorage.clear())

test('renders the heading', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: en.appName })).toBeInTheDocument()
})

test('footer links to the repo', () => {
  render(<App />)
  expect(screen.getByRole('link', { name: en.footer.repoLink })).toHaveAttribute(
    'href',
    __REPO_URL__,
  )
})

test('the counter persists to localStorage', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: en.counter.label(0) }))
  expect(screen.getByRole('button', { name: en.counter.label(1) })).toBeInTheDocument()
  expect(localStorage.getItem(`${__APP_KEY__}:count`)).toBe('1')
})

test('reset clears the stored count', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: en.counter.label(0) }))
  await user.click(screen.getByRole('button', { name: en.counter.reset }))
  expect(screen.getByRole('button', { name: en.counter.label(0) })).toBeInTheDocument()
  expect(localStorage.getItem(`${__APP_KEY__}:count`)).toBeNull()
})
