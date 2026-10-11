# CLAUDE.md

Vue 3 application template based on the Sakai admin template, ported from PrimeVue to shadcn-vue
(Reka UI and Tailwind).

**This repo is used as a template copied into other projects.** Changes here propagate by being
copied, so keep it generic and keep the tooling set up rather than stripping it out.

## Commands

```bash
bun run dev / build / preview
bun run type-check     # vue-tsc only
bun run lint           # ESLint with auto-fix
bun run test           # Vitest once (CI mode)
bun run test:watch
bun run update-deps    # update deps from installed Bun packages
```

Single test file or case:

```bash
bun run test src/utils/sanitize.test.ts
bun run test -t "strips <script>"
```

## Rules that are not obvious from the code

- **Never `v-html` Quill output directly.** Quill (`src/views/uikit/FormLayout.vue`) emits raw HTML.
  Pass untrusted or editor HTML through `sanitizeHtml()` from `src/utils/sanitize.ts` first: it runs
  DOMPurify with a Quill-tuned tag and attribute allowlist.
- **Every component is imported explicitly.** There is no auto-import plugin, so a missing import
  is not caught by `vue-tsc`: Vue only warns "Failed to resolve component" at runtime. Vendored
  shadcn-vue components live in `src/components/ui` (alias in `components.json`), local wrappers in
  `src/components`, and icons come from `src/components/icons.ts`.
- **Layout state lives in `useLayout()`**, not Pinia. `src/layout/composables/layout.ts` holds a
  reactive `layoutConfig` (`preset`, `primary`, `surface`, `darkTheme`, `menuMode`), deep-watched and
  serialised to the `layoutConfig` localStorage key. Pinia is a dependency but defines no stores.
- **Dark mode** toggles the `.dark` class on `document.documentElement`, wrapped in
  `document.startViewTransition` where available; Tailwind's `dark:` variant keys on that class
  (`@custom-variant dark` in `src/assets/tailwind.css`). Preset, primary and surface colours are
  written as CSS variables by `applyTheme()` in `src/layout/composables/theme.ts`. Override SCSS
  tokens in `src/assets/layout/variables/`.
- **Routing**: all routes in `src/router/index.ts`. Main app routes are children of `/` under
  `AppLayout`; auth (`/auth/*`) and `/landing` are standalone and render without the admin chrome.
  Catch-all redirects to `/pages/notfound`.
- **Services** in `src/service/` are two-tier demo data, and adding one means copying both tiers: a
  synchronous `get*Data()` holding the literal array, and async `get*()` methods that
  `Promise.resolve()` it or a `.slice()` of it, so components consume the shape a real API would
  return.

## Testing scope

Vitest with `jsdom`, configured in the `test` block of `vite.config.ts`, includes
`src/**/*.{test,spec}.ts` with `src/test/setup.ts` as the setup file and `@vue/test-utils` for
mounting.

Tests cover pure or security-sensitive utilities under `src/utils` and the local components and
composables under `src/components`, `src/composables` and `src/layout/composables` that hold logic;
`src/test/mount.test.ts` checks the harness itself. Vendored files under `src/components/ui` and the
demo views and services are not tested.

## Code style

Composition API with `<script setup>` everywhere. TypeScript strict mode (`noUnusedLocals`,
`noUnusedParameters`). Path alias `@/*` maps to `src/*`. ESLint warns rather than errors on `any`
and on unused vars, ignoring `_`-prefixed args, vars and caught errors.
