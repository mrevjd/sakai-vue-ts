<!--
Short, actionable guidance for AI coding agents working on the Sakai Vue TypeScript repo.
Keep this file concise (20–50 lines) and repository-specific.
-->

# Copilot / AI agent instructions — sakai-vue-ts

Quick plan for edits
- Use `bun` to run scripts (see `package.json`).
- Prefer changing theme tokens in `src/assets/layout/variables/*.scss`.
- Preserve auto-import conventions (unplugin + PrimeVueResolver) when adding components.

Quick start (commands you can suggest in PRs)
- Install: `bun install`
- Dev server: `bun run dev` (runs `vite`)
- Build: `bun run build` (runs `vue-tsc --noEmit && vite build`)
- Type-check: `bun run type-check` (runs `vue-tsc`)
- Lint: `bun run lint` (ESLint + fixes)

Key files & patterns to inspect
- `package.json` — scripts and Bun-first package manager. Use `bun` in examples.
- `vite.config.ts` — contains `unplugin-vue-components` + `PrimeVueResolver` (components are auto-imported).
- `src/main.ts` — app boot, PrimeVue theme preset (Aura) and theme options (darkModeSelector).
- `src/assets/layout/variables/` — SCSS design-token overrides; edit them for theme changes (e.g. `_dark.scss`).
- `src/assets/styles.scss` and `src/assets/tailwind.css` — global styles and Tailwind integration.
- `src/service/*` — local, synchronous stub services (e.g. `CustomerService.ts`) that return static data; follow the same pattern when adding a new service.
- `src/views/uikit/FormLayout.vue` — example of PrimeVue Editor usage and form layouts.

Theming notes (concrete examples)
- PrimeVue theme preset is applied in `src/main.ts`. To override tokens for dark mode, edit `src/assets/layout/variables/_dark.scss`.
  - Example: set editor content to the dark surface token:
    `--p-editor-content-background: var(--p-surface-950);`
  - Search `src/assets/layout/variables` for other tokens to keep changes consistent across themes.

Component & import conventions
- Most UI components are auto-imported by the Vite plugin. Avoid adding redundant imports for PrimeVue components unless the auto-resolver doesn't cover a case.
- Use Composition API + `<script setup>` across components (see `src/views/**` and `src/components/**`).

Data & service conventions
- Services in `src/service` return Promise-resolved static data for demo pages. Keep to the same synchronous-to-promise style when adding endpoints.

Code-style & checks
- Run `bun run lint` and `bun run type-check` before creating PRs. The repo uses ESLint + Prettier + `vue-tsc`.

When unsure
- Inspect `vite.config.ts` and `src/main.ts` first to understand runtime wiring.
- Avoid network calls in automated edits. If an external package upgrade is required, show the exact `bun` command and test locally.

If this file is outdated or missing examples you need, ask the repository owner for the canonical dev environment (node/bun versions, CI commands).
