export const en = {
  appName: 'Starter App',
  tagline: 'React, Tailwind, Biome, Lefthook, TypeScript, Vitest.',
  counter: {
    // Takes the count so plural rules stay with the string rather than the component.
    label: (count: number) => `Counted ${count}`,
    reset: 'Reset',
    hint: 'The count survives a reload.',
  },
  footer: {
    repoLink: 'View on GitHub',
  },
} as const
