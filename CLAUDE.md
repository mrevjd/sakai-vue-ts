# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sakai Vue TypeScript is a Vue 3 application template based on the Sakai admin template and PrimeVue component library. Uses Bun as the package manager.

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Start development server (Vite)
bun run build        # Type-check and build for production
bun run type-check   # Run vue-tsc type checking only
bun run lint         # ESLint with auto-fix
bun run preview      # Preview production build
bun run test         # Run Vitest once (CI mode)
bun run test:watch   # Run Vitest in watch mode
bun run update-deps  # Update deps from installed Bun packages
```

Run a single test file or case:
```bash
bun run test src/utils/sanitize.test.ts   # one file
bun run test -t "strips <script>"         # by test name
```

## Architecture

### Component Auto-Import
PrimeVue components are auto-imported via `unplugin-vue-components` with `PrimeVueResolver` in `vite.config.ts`. Do not add redundant imports for PrimeVue components.

### Theming System
- **Theme preset**: Aura, registered with PrimeVue in `src/main.ts` (`darkModeSelector: '.app-dark'`)
- **Dark mode**: Toggled via `.app-dark` class on `document.documentElement`; the toggle wraps the class change in `document.startViewTransition` when available
- **Theme persistence**: `useLayout()` (`src/layout/composables/layout.ts`) holds a reactive `layoutConfig` (`preset`, `primary`, `surface`, `darkTheme`, `menuMode`) that is deep-watched and serialized to the `layoutConfig` localStorage key; defaults are restored on load
- **SCSS tokens**: Override in `src/assets/layout/variables/` (e.g., `_dark.scss` for dark mode overrides)
- Layout/UI state lives in this composable, not Pinia. Pinia is a dependency but no stores are currently defined.

### Layout Structure
- `src/layout/AppLayout.vue` - Main layout wrapper with sidebar, topbar, footer
- `src/layout/composables/layout.ts` - Reactive layout state (menu mode, dark theme, sidebar visibility)
- Routes inside `AppLayout` children get the full admin template; standalone routes (landing, auth) render without it

### Routing Pattern
- `src/router/index.ts` - All routes defined here
- Main app routes are children of `/` with `AppLayout` component
- Auth pages (`/auth/*`) and landing (`/landing`) are standalone routes
- Catch-all redirects to `/pages/notfound`

### Services
Services in `src/service/` return Promise-wrapped static data for demo purposes. Follow the same pattern when adding new services.

### HTML Sanitization
Quill (`src/views/uikit/FormLayout.vue`) emits raw HTML. Always pass untrusted/editor HTML through `sanitizeHtml()` from `src/utils/sanitize.ts` before rendering it with `v-html` — it runs DOMPurify with a Quill-tuned tag/attribute allowlist. Never `v-html` Quill output directly.

### Testing
Vitest (with `jsdom`) is the standard test runner. Config lives in the `test` block of `vite.config.ts` and is intentionally scoped to `src/utils/**/*.{test,spec}.ts` — the place for pure, logic-heavy, or security-sensitive code (the DOMPurify sanitizer is covered in `src/utils/sanitize.test.ts`). Test real invariants and security boundaries; don't aim for blanket coverage of the demo services/views, which are scaffolding.

This repo is used as a **template** copied into other projects: keep Vitest set up in derived projects, and broaden the `include` glob (and add a setup file / `@vue/test-utils`) as real logic moves beyond `src/utils`.

### Code Style
- Use Composition API with `<script setup>` in all components
- TypeScript strict mode enabled (`noUnusedLocals`, `noUnusedParameters`)
- Path alias: `@/*` maps to `src/*`
- ESLint warns on `any` types and unused vars (except `_`-prefixed args)
