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
bun run update-deps  # Update deps from installed Bun packages
```

## Architecture

### Component Auto-Import
PrimeVue components are auto-imported via `unplugin-vue-components` with `PrimeVueResolver` in `vite.config.ts`. Do not add redundant imports for PrimeVue components.

### Theming System
- **Theme preset**: Aura, configured in `src/main.ts`
- **Dark mode**: Toggled via `.app-dark` class on document root
- **Theme persistence**: Stored in localStorage via `useLayout()` composable
- **SCSS tokens**: Override in `src/assets/layout/variables/` (e.g., `_dark.scss` for dark mode overrides)

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

### Code Style
- Use Composition API with `<script setup>` in all components
- TypeScript strict mode enabled (`noUnusedLocals`, `noUnusedParameters`)
- Path alias: `@/*` maps to `src/*`
- ESLint warns on `any` types and unused vars (except `_`-prefixed args)
