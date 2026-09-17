/// <reference types="vite/client" />

declare const __REPO_URL__: string

// Namespaces localStorage keys. Every project site under one GitHub user shares the
// <user>.github.io origin, so an unprefixed key collides across deployed apps.
declare const __APP_KEY__: string
