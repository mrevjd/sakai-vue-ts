# CLAUDE.md

Vue 3 application template based on the Sakai admin template and PrimeVue.

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
- **PrimeVue components are auto-imported** via `unplugin-vue-components` with `PrimeVueResolver` in
  `vite.config.ts`. Do not add redundant imports for them.
- **Layout state lives in `useLayout()`**, not Pinia. `src/layout/composables/layout.ts` holds a
  reactive `layoutConfig` (`preset`, `primary`, `surface`, `darkTheme`, `menuMode`), deep-watched and
  serialised to the `layoutConfig` localStorage key. Pinia is a dependency but defines no stores.
- **Dark mode** toggles the `.app-dark` class on `document.documentElement`, wrapped in
  `document.startViewTransition` where available. The Aura preset registers it in `src/main.ts` via
  `darkModeSelector: '.app-dark'`. Override SCSS tokens in `src/assets/layout/variables/`.
- **Routing**: all routes in `src/router/index.ts`. Main app routes are children of `/` under
  `AppLayout`; auth (`/auth/*`) and `/landing` are standalone and render without the admin chrome.
  Catch-all redirects to `/pages/notfound`.
- **Services** in `src/service/` are two-tier demo data, and adding one means copying both tiers: a
  synchronous `get*Data()` holding the literal array, and async `get*()` methods that
  `Promise.resolve()` it or a `.slice()` of it, so components consume the shape a real API would
  return.

## Testing scope is deliberately narrow

Vitest with `jsdom`, configured in the `test` block of `vite.config.ts`, scoped on purpose to
`src/utils/**/*.{test,spec}.ts`: the home of pure, logic-heavy or security-sensitive code. Test real
invariants and security boundaries. Do **not** chase blanket coverage of the demo services and
views, which are scaffolding.

In a derived project, broaden the `include` glob and add a setup file plus `@vue/test-utils` as real
logic moves beyond `src/utils`.

## Code style

Composition API with `<script setup>` everywhere. TypeScript strict mode (`noUnusedLocals`,
`noUnusedParameters`). Path alias `@/*` maps to `src/*`. ESLint warns rather than errors on `any`
and on unused vars, ignoring `_`-prefixed args, vars and caught errors.
