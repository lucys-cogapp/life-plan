import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { useLocalStorage } from './useLocalStorage'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

function storageEvent(key: string | null, newValue: string | null) {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue, storageArea: localStorage }))
}

test('falls back to the initial value when nothing is stored', () => {
  const { result } = renderHook(() => useLocalStorage('count', 0))
  expect(result.current[0]).toBe(0)
})

test('reads an existing stored value', () => {
  localStorage.setItem('count', '42')
  const { result } = renderHook(() => useLocalStorage('count', 0))
  expect(result.current[0]).toBe(42)
})

test('falls back when the stored value is not JSON', () => {
  localStorage.setItem('count', 'not json')
  const { result } = renderHook(() => useLocalStorage('count', 0))
  expect(result.current[0]).toBe(0)
})

test('persists updates', () => {
  const { result } = renderHook(() => useLocalStorage('count', 0))
  act(() => result.current[1](7))
  expect(result.current[0]).toBe(7)
  expect(localStorage.getItem('count')).toBe('7')
})

test('accepts an updater function', () => {
  const { result } = renderHook(() => useLocalStorage('count', 1))
  act(() => result.current[1]((n) => n + 4))
  expect(result.current[0]).toBe(5)
  expect(localStorage.getItem('count')).toBe('5')
})

test('remove clears storage and restores the initial value', () => {
  const { result } = renderHook(() => useLocalStorage('count', 0))
  act(() => result.current[1](7))
  act(() => result.current[2]())
  expect(result.current[0]).toBe(0)
  expect(localStorage.getItem('count')).toBeNull()
})

test('a write after removing at the initial value still persists', () => {
  const { result } = renderHook(() => useLocalStorage('count', 0))
  act(() => result.current[2]())
  act(() => result.current[1](5))
  expect(result.current[0]).toBe(5)
  expect(localStorage.getItem('count')).toBe('5')
})

test('a changed key re-reads instead of carrying the old value over', () => {
  localStorage.setItem('b', '"stored-for-b"')
  const { result, rerender } = renderHook(({ k }) => useLocalStorage(k, 'init'), {
    initialProps: { k: 'a' },
  })
  act(() => result.current[1]('value-for-a'))
  rerender({ k: 'b' })
  expect(result.current[0]).toBe('stored-for-b')
  expect(localStorage.getItem('b')).toBe('"stored-for-b"')
})

test('picks up a change from another tab', () => {
  const { result } = renderHook(() => useLocalStorage('count', 0))
  localStorage.setItem('count', '99')
  act(() => storageEvent('count', '99'))
  expect(result.current[0]).toBe(99)
})

test('picks up a removal from another tab', () => {
  localStorage.setItem('count', '7')
  const { result } = renderHook(() => useLocalStorage('count', 0))
  localStorage.removeItem('count')
  act(() => storageEvent('count', null))
  expect(result.current[0]).toBe(0)
})

test('picks up clear() from another tab', () => {
  localStorage.setItem('count', '7')
  const { result } = renderHook(() => useLocalStorage('count', 0))
  localStorage.clear()
  act(() => storageEvent(null, null))
  expect(result.current[0]).toBe(0)
})

test('ignores a storage event for a different key', () => {
  const { result } = renderHook(() => useLocalStorage('count', 0))
  act(() => result.current[1](3))
  act(() => storageEvent('other', '"irrelevant"'))
  expect(result.current[0]).toBe(3)
})

test('survives a non-JSON value arriving from another tab', () => {
  const { result } = renderHook(() => useLocalStorage('count', 0))
  localStorage.setItem('count', 'not json')
  act(() => storageEvent('count', 'not json'))
  expect(result.current[0]).toBe(0)
})

test('survives storage being unavailable', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('denied')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('denied')
  })
  const { result } = renderHook(() => useLocalStorage('count', 0))
  expect(result.current[0]).toBe(0)
  act(() => result.current[1](3))
  expect(result.current[0]).toBe(3)
})

test('setters stay stable when the initial value is a fresh object each render', () => {
  const { result, rerender } = renderHook(() => useLocalStorage('obj', { a: 1 }))
  const firstSet = result.current[1]
  rerender()
  expect(result.current[1]).toBe(firstSet)
})
