# shadcn-vue Migration, Plan 1: Bootstrap, Theme and Wrappers

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land shadcn-vue next to PrimeVue in this template, move the theme (palettes, presets, dark mode, persistence) onto shadcn CSS variables, and ship the shared wrappers (CSV export, data table, chart, rich-text editor, toast and confirm shims) with tests, so the page-by-page ports in the following plans have everything they import already built and verified.

**Architecture:** shadcn-vue components are vendored into `src/components/ui` by its CLI and imported explicitly. A pure module maps the existing 17 primary and 8 surface palettes plus three preset token sets to shadcn variable values, and a `flush: 'sync'` watcher in `useLayout()` writes them onto `<html>`. PrimeVue stays registered until the last page is ported (Plan 3), with a small transitional bridge keeping its own theme in step with the picker. Wrappers live in `src/components` and `src/composables`, each with a test.

**Tech Stack:** Vue 3.5, Vite 8, TypeScript 6 (strict, `noUnusedLocals`), Tailwind 4.3, shadcn-vue CLI 2.8.2 (style `nova`, base `reka`, colour `zinc`, icons `@lucide/vue`), Reka UI 2.10, TanStack Table 9.2 (v9 feature API), chart.js 4.5, quill 2.0, vue-sonner 2.0, Vitest 4.1 with jsdom and `@vue/test-utils` 2.5, Bun.

**Spec:** `docs/superpowers/specs/2026-09-12-shadcn-vue-migration-design.md` (revision 3). This plan implements spec phases 1, 2 and 3. Plans 2 to 4 cover phases 4 to 9 and are written after this plan lands, from the real state of the branch.

## Global Constraints

- Work only in the worktree `.claude/worktrees/shadcn-vue-migration` on branch `worktree-shadcn-vue-migration`. Never touch the main checkout.
- Bun only: `bun install`, `bun add`, `bun run <script>`, `bunx`. Never `npm`, `npx`, `yarn`, bare `bun test` or bare `bun build`.
- Formatting is the repo's Prettier config: 4-space indent, single quotes, semicolons, no trailing commas, `printWidth` 250, `vueIndentScriptAndStyle` true. Run `bunx prettier --write <files>` on anything the CLI generates.
- TypeScript strict with `noUnusedLocals` and `noUnusedParameters`; `_`-prefixed names are the only allowed unused ones.
- Tests are Vitest with jsdom, colocated as `*.test.ts`, importing `describe`, `it`, `expect`, `vi` from `vitest` explicitly (no globals).
- Every task ends green on all of: `bun run type-check`, `bun run lint` (0 errors; warnings allowed), `bun run test`, `bun run build`.
- The `@plugin 'tailwindcss-primeui'` line in `src/assets/tailwind.css` and `app.use(PrimeVue, ...)` in `src/main.ts` stay in place throughout this plan. They are removed in Plan 3's sweep.
- No em dashes in any file, commit message or comment. No AI attribution lines in commits.
- Git commands in this worktree must be single plain commands (`git add <paths>` then `git commit -m ...`); the harness refuses compound git invocations.
- Comment why, not what. Handle errors explicitly. Files stay focused (one responsibility each).

## Verified facts this plan relies on

All of the following were established on 2026-09-12 by rehearsing the steps on a scratch copy of this project, not from memory:

- `bunx shadcn-vue@latest init -y --base reka --style nova --base-color zinc --icon-library lucide --font inter` runs non-interactively and writes `components.json`, `src/lib/utils.ts` and a token block into `src/assets/tailwind.css`. Without `--base` it prompts; with `-d` it silently switches to `neutral` and Geist.
- The 48-item `add` command in Task 2 succeeds; `date-picker` and `data-table` are not registry items (they are compositions); `native-select` is added as a dependency of `calendar`.
- After `add`, `vue-tsc` fails on exactly one vendored file, `src/components/ui/carousel/CarouselContent.vue` (`carouselRef` declared but never read). Adding `defineExpose({ carouselRef })` fixes it; binding `:ref="carouselRef"` does not (type error).
- `vite build` succeeds with `tailwindcss-primeui` and the shadcn token block loaded together. `eslint` reports 0 errors and 3 warnings (one in vendored `CalendarHeading.vue`).
- `@vue/test-utils` 2.5.0 mounts vendored components under jsdom with no setup stubs; an open `AlertDialog` renders into `document.body` after one macrotask; `Toaster` renders a `toast.success()` call.
- The `DataTable.vue`, `AppChart.vue` and `QuillEditor.vue` code and tests in Tasks 12 to 14 passed (8, 3 and 5 tests) and type-checked on the scratch copy exactly as written here.
- TanStack Table 9.2.4 exports `useTable`, `FlexRender`, `tableFeatures`, `createColumnHelper`, the `*Feature` objects, `create*RowModel` functions, `filterFn_includesString` and `sortFn_*`. Column and table methods used here (`getCanSort`, `getIsSorted`, `toggleSorting`, `getVisibleCells` with `columnVisibilityFeature`, `getPrePaginatedRowModel`, `firstPage`, `lastPage`, `getSelectedRowModel`, `toggleAllPageRowsSelected`) exist in its types.
- `@lucide/vue` exports both bare (`ArrowUpDown`) and suffixed (`ArrowUpDownIcon`) names; bare names are used.
- vue-sonner's `Toaster` accepts `position`, `closeButton` and `offset` (`string | number | { top, right, bottom, left }`).
- PrimeVue preset values for `presets.ts` were read from `node_modules/@primeuix/themes/dist/<preset>/base/index.mjs` and `.../button/index.mjs`.

## File structure

Created:

- `components.json`, `src/lib/utils.ts` (CLI)
- `src/components/ui/**` (CLI, 49 directories, vendored)
- `src/test/setup.ts` (jsdom stubs), `src/test/mount.test.ts` (harness smoke test)
- `src/utils/csv.ts` + `csv.test.ts` (CSV serialisation and download)
- `src/layout/palettes.ts` (primary and surface palette data)
- `src/layout/presets.ts` (Aura, Lara, Nora token sets)
- `src/utils/theme.ts` + `theme.test.ts` (palette and preset to token mapping, pure)
- `src/utils/layoutConfig.ts` + `layoutConfig.test.ts` (persisted config parsing, pure)
- `src/layout/composables/theme.ts` + `theme.test.ts` (writes tokens onto `<html>`)
- `src/layout/composables/primevueBridge.ts` (transitional PrimeVue theme sync, deleted in Plan 3)
- `src/composables/useToast.ts` + `useToast.test.ts` (PrimeVue-shaped shim over vue-sonner)
- `src/composables/useConfirm.ts` + `useConfirm.test.ts`, `src/components/ConfirmDialogHost.vue` + `ConfirmDialogHost.test.ts`
- `src/components/AppChart.vue` + `AppChart.test.ts`
- `src/components/QuillEditor.vue`, `src/components/quill-toolbar.ts` + `QuillEditor.test.ts`
- `src/components/data-table/features.ts`, `DataTable.vue`, `index.ts` + `DataTable.test.ts`

Modified:

- `src/assets/tailwind.css` (token block, Lato font, `.dark` variant, preset hooks)
- `vite.config.ts` (test include and setup file)
- `package.json`, `bun.lock`
- `src/layout/composables/layout.ts` (safe load, theme watcher, `.dark`)
- `src/main.ts` (`.dark` selector, bridge call)
- `src/assets/layout/variables/_common.scss`, `_light.scss`, `_dark.scss`, `src/assets/layout/_utils.scss`
- `src/layout/AppLayout.vue` (mask animation class)
- `src/layout/AppConfigurator.vue` (rebuilt on shadcn)
- `src/App.vue` (Toaster and ConfirmDialogHost)

---

### Task 1: Initialise the shadcn-vue CLI and merge the stylesheet

**Files:**
- Create: `components.json`, `src/lib/utils.ts` (written by the CLI)
- Modify: `src/assets/tailwind.css`, `package.json`, `bun.lock`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` from `@/lib/utils`; shadcn CSS variables (`--background`, `--primary`, `--radius`, the full set in the block below) available to every later task.

- [ ] **Step 1: Run the CLI**

Run:
```bash
bunx shadcn-vue@latest init -y --base reka --style nova --base-color zinc --icon-library lucide --font inter
```
Expected: the last lines are
```
Success! Project initialization completed.
You may now add components.
```
Then run `git status --short` and expect exactly:
```
 M bun.lock
 M package.json
 M src/assets/tailwind.css
?? components.json
?? src/lib/utils.ts
```
`package.json` has gained runtime dependencies `@lucide/vue`, `class-variance-authority`, `clsx`, `reka-ui`, `tailwind-merge` and the dev dependency `tw-animate-css`, all pinned exactly because `bunfig.toml` sets `exact = true`.

- [ ] **Step 2: Replace `src/assets/tailwind.css` with the merged file**

The CLI appended its blocks around the existing content, added a Google Fonts import for Inter and `---break---` comments. Overwrite the whole file with this (the oklch values are the zinc set the CLI generated; keep them verbatim):

```css
@import 'tailwindcss';
@import 'tw-animate-css';

/* Removed in the Plan 3 sweep, once no page uses its classes. */
@plugin 'tailwindcss-primeui';

/* Renamed to .dark in Task 7 of Plan 1. */
@custom-variant dark (&:where([class*="app-dark"], [class*="app-dark"] *));

@theme {
    --breakpoint-*: initial;
    --breakpoint-sm: 576px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 992px;
    --breakpoint-xl: 1200px;
    --breakpoint-xxl: 1920px;

    --text-xxl: 1.5rem;
    --text-xxl--line-height: 2rem;

    /* Lato is loaded by index.html; the CLI's --font choice is not used. */
    --font-sans: 'Lato', ui-sans-serif, system-ui, sans-serif;
}

@theme inline {
    --font-heading: var(--font-sans);
    --color-sidebar-ring: var(--sidebar-ring);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar: var(--sidebar);
    --color-chart-5: var(--chart-5);
    --color-chart-4: var(--chart-4);
    --color-chart-3: var(--chart-3);
    --color-chart-2: var(--chart-2);
    --color-chart-1: var(--chart-1);
    --color-ring: var(--ring);
    --color-input: var(--input);
    --color-border: var(--border);
    --color-destructive: var(--destructive);
    --color-accent-foreground: var(--accent-foreground);
    --color-accent: var(--accent);
    --color-muted-foreground: var(--muted-foreground);
    --color-muted: var(--muted);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-secondary: var(--secondary);
    --color-primary-foreground: var(--primary-foreground);
    --color-primary: var(--primary);
    --color-popover-foreground: var(--popover-foreground);
    --color-popover: var(--popover);
    --color-card-foreground: var(--card-foreground);
    --color-card: var(--card);
    --color-foreground: var(--foreground);
    --color-background: var(--background);
    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) + 4px);
}

/* Static fallback. src/layout/composables/theme.ts overwrites these on <html> at runtime. */
:root {
    --radius: 0.625rem;
    --background: oklch(1 0 0);
    --foreground: oklch(0.141 0.005 285.823);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.141 0.005 285.823);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.141 0.005 285.823);
    --primary: oklch(0.21 0.006 285.885);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.967 0.001 286.375);
    --secondary-foreground: oklch(0.21 0.006 285.885);
    --muted: oklch(0.967 0.001 286.375);
    --muted-foreground: oklch(0.552 0.016 285.938);
    --accent: oklch(0.967 0.001 286.375);
    --accent-foreground: oklch(0.21 0.006 285.885);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.92 0.004 286.32);
    --input: oklch(0.92 0.004 286.32);
    --ring: oklch(0.705 0.015 286.067);
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.141 0.005 285.823);
    --sidebar-primary: oklch(0.21 0.006 285.885);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.967 0.001 286.375);
    --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
    --sidebar-border: oklch(0.92 0.004 286.32);
    --sidebar-ring: oklch(0.705 0.015 286.067);
}

.dark {
    --background: oklch(0.141 0.005 285.823);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.21 0.006 285.885);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.21 0.006 285.885);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.92 0.004 286.32);
    --primary-foreground: oklch(0.21 0.006 285.885);
    --secondary: oklch(0.274 0.006 286.033);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.274 0.006 286.033);
    --muted-foreground: oklch(0.705 0.015 286.067);
    --accent: oklch(0.274 0.006 286.033);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.552 0.016 285.938);
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);
    --sidebar: oklch(0.21 0.006 285.885);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.274 0.006 286.033);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.552 0.016 285.938);
}

@layer base {
    * {
        @apply border-border outline-ring/50;
    }
    body {
        @apply bg-background text-foreground;
    }
}
```

The Tailwind 3 border-colour compatibility block that used to be here is gone on purpose: the CLI's `* { @apply border-border }` replaces it.

- [ ] **Step 3: Format the generated helper**

Run: `bunx prettier --write src/lib/utils.ts`
Expected file content afterwards:
```ts
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```
Leave `components.json` as the CLI wrote it (2-space JSON); the CLI reads it back on every `add`.

- [ ] **Step 4: Verify**

Run each and expect: `bun run type-check` exit 0; `bun run test` reports `Tests  7 passed (7)`; `bun run build` ends with `✓ built in` and no errors; `bun run lint` reports 0 errors.

- [ ] **Step 5: Commit**

```bash
git add components.json src/lib/utils.ts src/assets/tailwind.css package.json bun.lock
```
```bash
git commit -m "chore: initialise shadcn-vue (nova, zinc, lucide) alongside PrimeVue"
```

---

### Task 2: Vendor the component set and make it build

**Files:**
- Create: `src/components/ui/**` (49 directories)
- Modify: `src/components/ui/carousel/CarouselContent.vue`, `package.json`, `bun.lock`

**Interfaces:**
- Produces: every `@/components/ui/<name>` import used by later tasks, notably `Button`, `buttonVariants`, `Checkbox`, `Select*`, `Table*`, `TableEmpty`, `ToggleGroup`, `ToggleGroupItem`, `AlertDialog*`, `Toaster` (from `@/components/ui/sonner`).

- [ ] **Step 1: Add the components**

Run (one line):
```bash
bunx shadcn-vue@latest add -y accordion alert alert-dialog avatar badge breadcrumb button button-group calendar card carousel checkbox collapsible combobox command context-menu dialog dropdown-menu field form input input-group label menubar navigation-menu number-field pagination popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider sonner spinner stepper switch table tabs tags-input textarea toggle toggle-group tooltip
```
Expected: the output lists created files ending with the `tooltip` files; `ls src/components/ui | wc -l` prints `49` (the 48 requested plus `native-select`). `package.json` has gained `@vee-validate/zod`, `@vueuse/core`, `embla-carousel-vue`, `vee-validate`, `vue-sonner` and `zod`.

- [ ] **Step 2: Fix the one file that fails strict unused checks**

Run `bun run type-check`. Expected: exactly one error,
```
src/components/ui/carousel/CarouselContent.vue(12,9): error TS6133: 'carouselRef' is declared but its value is never read.
```
Edit `src/components/ui/carousel/CarouselContent.vue` so the script block reads:
```ts
const props = defineProps<WithClassAsProps>()

const { carouselRef, orientation } = useCarousel()

// The template binds ref="carouselRef" by name; exposing it is what makes TypeScript count it as used.
defineExpose({ carouselRef })
```
(The `<template>` keeps `ref="carouselRef"` unchanged.)

- [ ] **Step 3: Format the vendored files to the repo style**

Run: `bunx prettier --write "src/components/ui/**/*.{vue,ts}"`
Expected: prettier lists every file it rewrote; no errors.

- [ ] **Step 4: Verify**

Run each and expect: `bun run type-check` exit 0; `bun run lint` ends `0 errors` (3 warnings about `any` are expected, one of them in `src/components/ui/calendar/CalendarHeading.vue`); `bun run test` still 7 passed; `bun run build` succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui package.json bun.lock
```
```bash
git commit -m "feat: vendor the shadcn-vue component set"
```

---

### Task 3: Widen Vitest to the whole tree and add the mount harness

**Files:**
- Create: `src/test/setup.ts`, `src/test/mount.test.ts`
- Modify: `vite.config.ts`, `package.json`, `bun.lock`

**Interfaces:**
- Produces: `mount()` from `@vue/test-utils` usable in any `src/**/*.test.ts`; `window.ResizeObserver`, `window.matchMedia` and `Element.prototype.scrollIntoView` stubs present in every test.

- [ ] **Step 1: Write the failing smoke test**

`src/test/mount.test.ts`:
```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/button';

describe('test harness', () => {
    it('mounts a shadcn-vue component under jsdom', () => {
        const wrapper = mount(Button, { slots: { default: 'Go' } });
        expect(wrapper.text()).toBe('Go');
        expect(wrapper.attributes('data-slot')).toBe('button');
    });
});
```

- [ ] **Step 2: Run it to see it is not picked up**

Run: `bun run test`
Expected: still `Test Files  1 passed (1)`, 7 tests. The file is outside the current `include` glob, so it does not run.

- [ ] **Step 3: Install test-utils and widen the glob**

Run: `bun add -d @vue/test-utils`
Expected: `installed @vue/test-utils@2.5.0`.

Edit the `test` block of `vite.config.ts` to:
```ts
    test: {
        // jsdom because DOMPurify and the mounted components need a DOM.
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.ts'],
        setupFiles: ['src/test/setup.ts']
    }
```

Create `src/test/setup.ts`:
```ts
// Browser APIs jsdom lacks. Reka UI's overlays and the sidebar composable touch them on mount.
class ResizeObserverStub {
    observe(): void {
        // no layout in jsdom
    }
    unobserve(): void {
        // no layout in jsdom
    }
    disconnect(): void {
        // no layout in jsdom
    }
}

if (typeof window !== 'undefined') {
    if (!('ResizeObserver' in window)) {
        Object.defineProperty(window, 'ResizeObserver', { value: ResizeObserverStub, writable: true });
    }
    if (typeof window.matchMedia !== 'function') {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query: string): MediaQueryList =>
                ({
                    matches: false,
                    media: query,
                    onchange: null,
                    addListener: () => undefined,
                    removeListener: () => undefined,
                    addEventListener: () => undefined,
                    removeEventListener: () => undefined,
                    dispatchEvent: () => false
                }) as unknown as MediaQueryList
        });
    }
    if (typeof Element.prototype.scrollIntoView !== 'function') {
        Element.prototype.scrollIntoView = () => undefined;
    }
}
```

- [ ] **Step 4: Run the suite**

Run: `bun run test`
Expected: `Test Files  2 passed (2)` and `Tests  8 passed (8)`.

- [ ] **Step 5: Verify the rest and commit**

`bun run type-check`, `bun run lint`, `bun run build` all green.
```bash
git add vite.config.ts src/test/setup.ts src/test/mount.test.ts package.json bun.lock
```
```bash
git commit -m "test: widen Vitest to src and add a test-utils mount harness"
```

---

### Task 4: CSV serialisation and download

**Files:**
- Create: `src/utils/csv.ts`, `src/utils/csv.test.ts`

**Interfaces:**
- Produces: `interface CsvColumn { key: string; header: string }`, `toCsv(rows: ReadonlyArray<Record<string, unknown>>, columns: ReadonlyArray<CsvColumn>): string`, `downloadCsv(filename: string, csv: string): void`. Used by `DataTable` consumers (Crud export) in Plan 2.

- [ ] **Step 1: Write the failing tests**

`src/utils/csv.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadCsv, toCsv } from './csv';

const columns = [
    { key: 'name', header: 'Name' },
    { key: 'price', header: 'Price' }
];

describe('toCsv', () => {
    it('writes a header row then one CRLF-separated line per row', () => {
        expect(toCsv([{ name: 'Bamboo Watch', price: 65 }], columns)).toBe('Name,Price\r\nBamboo Watch,65');
    });

    it('returns only the header when there are no rows', () => {
        expect(toCsv([], columns)).toBe('Name,Price');
    });

    it('quotes cells containing commas, quotes or line breaks and doubles inner quotes', () => {
        expect(toCsv([{ name: 'Black "Onyx", 2nd\nedition', price: 1 }], columns)).toBe('Name,Price\r\n"Black ""Onyx"", 2nd\nedition",1');
    });

    it('escapes headers the same way', () => {
        expect(toCsv([], [{ key: 'p', header: 'Price, USD' }])).toBe('"Price, USD"');
    });

    it('neutralises strings that a spreadsheet would evaluate as formulas', () => {
        expect(toCsv([{ name: '=SUM(A1)', price: 1 }], columns)).toBe("Name,Price\r\n'=SUM(A1),1");
        expect(toCsv([{ name: '+1', price: 1 }], columns)).toBe("Name,Price\r\n'+1,1");
        expect(toCsv([{ name: '-1', price: 1 }], columns)).toBe("Name,Price\r\n'-1,1");
        expect(toCsv([{ name: '@cmd', price: 1 }], columns)).toBe("Name,Price\r\n'@cmd,1");
        expect(toCsv([{ name: '\tcmd', price: 1 }], columns)).toBe("Name,Price\r\n'\tcmd,1");
        expect(toCsv([{ name: '\rcmd', price: 1 }], columns)).toBe('Name,Price\r\n"\'\rcmd",1');
    });

    it('leaves negative numbers untouched', () => {
        expect(toCsv([{ name: 'x', price: -5 }], columns)).toBe('Name,Price\r\nx,-5');
    });

    it('renders null and undefined as empty cells', () => {
        expect(toCsv([{ name: null, price: undefined }], columns)).toBe('Name,Price\r\n,');
    });

    it('renders dates as ISO strings and other objects as JSON', () => {
        const when = new Date(Date.UTC(2026, 8, 12, 10, 0, 0));
        expect(toCsv([{ name: when, price: { a: 1 } }], columns)).toBe('Name,Price\r\n2026-09-12T10:00:00.000Z,"{""a"":1}"');
    });
});

describe('downloadCsv', () => {
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;

    afterEach(() => {
        URL.createObjectURL = originalCreate;
        URL.revokeObjectURL = originalRevoke;
        vi.restoreAllMocks();
    });

    it('creates a text/csv object URL, clicks a download link and revokes the URL', () => {
        const createObjectURL = vi.fn(() => 'blob:csv');
        const revokeObjectURL = vi.fn();
        URL.createObjectURL = createObjectURL as unknown as typeof URL.createObjectURL;
        URL.revokeObjectURL = revokeObjectURL as unknown as typeof URL.revokeObjectURL;
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

        downloadCsv('products.csv', 'Name\r\nx');

        expect(createObjectURL).toHaveBeenCalledTimes(1);
        const blob = createObjectURL.mock.calls[0]![0] as Blob;
        expect(blob.type).toBe('text/csv;charset=utf-8');
        expect(click).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:csv');
        expect(document.querySelector('a[download="products.csv"]')).toBeNull();
    });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `bun run test src/utils/csv.test.ts`
Expected: FAIL, `Failed to resolve import "./csv"`.

- [ ] **Step 3: Implement**

`src/utils/csv.ts`:
```ts
export interface CsvColumn {
    key: string;
    header: string;
}

const NEEDS_QUOTES = /[",\r\n]/;
// A leading = + - @ or control character makes spreadsheets evaluate the cell (CSV injection).
const FORMULA_LEAD = /^[=+\-@\t\r]/;

function serialise(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function escapeCell(text: string): string {
    return NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function cell(value: unknown): string {
    const text = serialise(value);
    const guarded = typeof value === 'string' && FORMULA_LEAD.test(text) ? `'${text}` : text;
    return escapeCell(guarded);
}

export function toCsv(rows: ReadonlyArray<Record<string, unknown>>, columns: ReadonlyArray<CsvColumn>): string {
    const header = columns.map((column) => escapeCell(column.header)).join(',');
    const lines = rows.map((row) => columns.map((column) => cell(row[column.key])).join(','));
    return [header, ...lines].join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
    // The BOM makes Excel read the file as UTF-8, which is what PrimeVue's exportCSV did.
    const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Run to see it pass**

Run: `bun run test src/utils/csv.test.ts`
Expected: 9 tests pass.

- [ ] **Step 5: Verify and commit**

`bun run type-check`, `bun run lint`, `bun run test` (17 tests), `bun run build` green.
```bash
git add src/utils/csv.ts src/utils/csv.test.ts
```
```bash
git commit -m "feat: add CSV export util with RFC 4180 quoting and formula guard"
```

---

### Task 5: Palette data and the pure token mapping

**Files:**
- Create: `src/layout/palettes.ts`, `src/utils/theme.ts`, `src/utils/theme.test.ts`

**Interfaces:**
- Produces from `@/layout/palettes`: `type Shade`, `type Palette = Partial<Record<Shade, string>>`, `interface PaletteOption { name: string; palette: Palette }`, `primaryPalettes: PaletteOption[]` (17), `surfacePalettes: PaletteOption[]` (8), `DEFAULT_PRIMARY = 'emerald'`, `DEFAULT_SURFACE_LIGHT = 'slate'`, `DEFAULT_SURFACE_DARK = 'zinc'`.
- Produces from `@/utils/theme`: `type ThemeMode = 'light' | 'dark'`, `type TokenRecord = Record<string, string>`, `PRIMARY_TOKENS`, `SURFACE_TOKENS`, `resolvePrimary(name: string): PaletteOption`, `resolveSurface(name: string | null, mode: ThemeMode): PaletteOption`, `primaryVars(primary: PaletteOption, mode: ThemeMode, surface: Palette): TokenRecord`, `surfaceVars(surface: Palette, mode: ThemeMode): TokenRecord`. Task 6 adds `presetVars` and `themeVars` to the same module.

- [ ] **Step 1: Write the palette data**

`src/layout/palettes.ts` (the hex values are copied unchanged from the current `AppConfigurator.vue`):
```ts
export type Shade = '0' | '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';
export type Palette = Partial<Record<Shade, string>>;

export interface PaletteOption {
    name: string;
    palette: Palette;
}

export const DEFAULT_PRIMARY = 'emerald';
export const DEFAULT_SURFACE_LIGHT = 'slate';
export const DEFAULT_SURFACE_DARK = 'zinc';

// noir has no palette of its own: it draws on the active surface scale (see primaryVars).
export const primaryPalettes: PaletteOption[] = [
    { name: 'noir', palette: {} },
    { name: 'emerald', palette: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' } },
    { name: 'green', palette: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16' } },
    { name: 'lime', palette: { 50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635', 500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314', 950: '#1a2e05' } },
    { name: 'orange', palette: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' } },
    { name: 'amber', palette: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' } },
    { name: 'yellow', palette: { 50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006' } },
    { name: 'teal', palette: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e' } },
    { name: 'cyan', palette: { 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344' } },
    { name: 'sky', palette: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49' } },
    { name: 'blue', palette: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' } },
    { name: 'indigo', palette: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' } },
    { name: 'violet', palette: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065' } },
    { name: 'purple', palette: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' } },
    { name: 'fuchsia', palette: { 50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75', 950: '#4a044e' } },
    { name: 'pink', palette: { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724' } },
    { name: 'rose', palette: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' } }
];

export const surfacePalettes: PaletteOption[] = [
    { name: 'slate', palette: { 0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' } },
    { name: 'gray', palette: { 0: '#ffffff', 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' } },
    { name: 'zinc', palette: { 0: '#ffffff', 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' } },
    { name: 'neutral', palette: { 0: '#ffffff', 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a' } },
    { name: 'stone', palette: { 0: '#ffffff', 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' } },
    { name: 'soho', palette: { 0: '#ffffff', 50: '#f4f4f4', 100: '#e8e9e9', 200: '#d2d2d4', 300: '#bbbcbe', 400: '#a5a5a9', 500: '#8e8f93', 600: '#77787d', 700: '#616268', 800: '#4a4b52', 900: '#34343d', 950: '#1d1e27' } },
    { name: 'viva', palette: { 0: '#ffffff', 50: '#f3f3f3', 100: '#e7e7e8', 200: '#cfd0d0', 300: '#b7b8b9', 400: '#9fa1a1', 500: '#87898a', 600: '#6e7173', 700: '#565a5b', 800: '#3e4244', 900: '#262b2c', 950: '#0e1315' } },
    { name: 'ocean', palette: { 0: '#ffffff', 50: '#fbfcfc', 100: '#F7F9F8', 200: '#EFF3F2', 300: '#DADEDD', 400: '#B1B7B6', 500: '#828787', 600: '#5F7274', 700: '#415B61', 800: '#29444E', 900: '#183240', 950: '#0c1920' } }
];
```

- [ ] **Step 2: Write the failing tests**

`src/utils/theme.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { primaryPalettes, surfacePalettes } from '@/layout/palettes';
import { PRIMARY_TOKENS, primaryVars, resolvePrimary, resolveSurface, SURFACE_TOKENS, surfaceVars } from './theme';

const emerald = primaryPalettes.find((p) => p.name === 'emerald')!;
const noir = primaryPalettes.find((p) => p.name === 'noir')!;
const slate = surfacePalettes.find((s) => s.name === 'slate')!.palette;
const zinc = surfacePalettes.find((s) => s.name === 'zinc')!.palette;

describe('resolvePrimary and resolveSurface', () => {
    it('falls back to emerald for an unknown primary', () => {
        expect(resolvePrimary('nope').name).toBe('emerald');
        expect(resolvePrimary('blue').name).toBe('blue');
    });

    it('uses slate in light and zinc in dark when no surface is chosen or the name is unknown', () => {
        expect(resolveSurface(null, 'light').name).toBe('slate');
        expect(resolveSurface(null, 'dark').name).toBe('zinc');
        expect(resolveSurface('nope', 'light').name).toBe('slate');
        expect(resolveSurface('ocean', 'dark').name).toBe('ocean');
    });
});

describe('primaryVars', () => {
    it('uses shade 500 on white in light mode', () => {
        const vars = primaryVars(emerald, 'light', slate);
        expect(vars['--primary']).toBe('#10b981');
        expect(vars['--primary-foreground']).toBe('#ffffff');
        expect(vars['--ring']).toBe('#10b981');
        expect(vars['--chart-1']).toBe('#10b981');
    });

    it('uses shade 400 on the surface 900 shade in dark mode', () => {
        const vars = primaryVars(emerald, 'dark', zinc);
        expect(vars['--primary']).toBe('#34d399');
        expect(vars['--primary-foreground']).toBe('#18181b');
    });

    it('maps noir onto the surface scale', () => {
        expect(primaryVars(noir, 'light', slate)['--primary']).toBe('#020617');
        expect(primaryVars(noir, 'light', slate)['--primary-foreground']).toBe('#ffffff');
        expect(primaryVars(noir, 'dark', slate)['--primary']).toBe('#f8fafc');
        expect(primaryVars(noir, 'dark', slate)['--primary-foreground']).toBe('#020617');
    });

    it('returns exactly the documented primary tokens', () => {
        expect(Object.keys(primaryVars(emerald, 'light', slate)).sort()).toEqual([...PRIMARY_TOKENS].sort());
    });
});

describe('surfaceVars', () => {
    it('keeps a grey ground with white cards in light mode', () => {
        const vars = surfaceVars(slate, 'light');
        expect(vars['--background']).toBe('#f1f5f9');
        expect(vars['--card']).toBe('#ffffff');
        expect(vars['--popover']).toBe('#ffffff');
        expect(vars['--foreground']).toBe('#334155');
        expect(vars['--muted-foreground']).toBe('#64748b');
        expect(vars['--border']).toBe('#e2e8f0');
        expect(vars['--sidebar']).toBe('#ffffff');
    });

    it('uses the 950 ground and 900 cards in dark mode', () => {
        const vars = surfaceVars(zinc, 'dark');
        expect(vars['--background']).toBe('#09090b');
        expect(vars['--card']).toBe('#18181b');
        expect(vars['--foreground']).toBe('#ffffff');
        expect(vars['--muted-foreground']).toBe('#a1a1aa');
        expect(vars['--border']).toBe('#3f3f46');
        expect(vars['--sidebar-accent']).toBe('#27272a');
    });

    it('returns exactly the documented surface tokens', () => {
        expect(Object.keys(surfaceVars(slate, 'light')).sort()).toEqual([...SURFACE_TOKENS].sort());
    });
});
```

- [ ] **Step 3: Run to see it fail**

Run: `bun run test src/utils/theme.test.ts`
Expected: FAIL, `Failed to resolve import "./theme"`.

- [ ] **Step 4: Implement**

`src/utils/theme.ts`:
```ts
import { DEFAULT_PRIMARY, DEFAULT_SURFACE_DARK, DEFAULT_SURFACE_LIGHT, primaryPalettes, surfacePalettes, type Palette, type PaletteOption, type Shade } from '@/layout/palettes';

export type ThemeMode = 'light' | 'dark';
export type TokenRecord = Record<string, string>;

export const PRIMARY_TOKENS = ['--primary', '--primary-foreground', '--ring', '--sidebar-primary', '--sidebar-primary-foreground', '--chart-1'] as const;

export const SURFACE_TOKENS = [
    '--background',
    '--foreground',
    '--card',
    '--card-foreground',
    '--popover',
    '--popover-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--border',
    '--input',
    '--sidebar',
    '--sidebar-foreground',
    '--sidebar-accent',
    '--sidebar-accent-foreground',
    '--sidebar-border'
] as const;

const WHITE = '#ffffff';

function shade(palette: Palette, key: Shade): string {
    const value = palette[key];
    if (!value) throw new Error(`Palette is missing shade ${key}`);
    return value;
}

export function resolvePrimary(name: string): PaletteOption {
    return primaryPalettes.find((option) => option.name === name) ?? primaryPalettes.find((option) => option.name === DEFAULT_PRIMARY)!;
}

export function resolveSurface(name: string | null, mode: ThemeMode): PaletteOption {
    const fallback = mode === 'dark' ? DEFAULT_SURFACE_DARK : DEFAULT_SURFACE_LIGHT;
    return surfacePalettes.find((option) => option.name === name) ?? surfacePalettes.find((option) => option.name === fallback)!;
}

// Mirrors the semantic mapping the PrimeVue configurator applied: 500 on white in light mode,
// 400 on the surface's 900 shade in dark mode, and noir riding on the surface scale.
export function primaryVars(primary: PaletteOption, mode: ThemeMode, surface: Palette): TokenRecord {
    let color: string;
    let foreground: string;
    if (primary.name === 'noir') {
        color = mode === 'dark' ? shade(surface, '50') : shade(surface, '950');
        foreground = mode === 'dark' ? shade(surface, '950') : WHITE;
    } else {
        color = mode === 'dark' ? shade(primary.palette, '400') : shade(primary.palette, '500');
        foreground = mode === 'dark' ? shade(surface, '900') : WHITE;
    }
    return {
        '--primary': color,
        '--primary-foreground': foreground,
        '--ring': color,
        '--sidebar-primary': color,
        '--sidebar-primary-foreground': foreground,
        '--chart-1': color
    };
}

export function surfaceVars(surface: Palette, mode: ThemeMode): TokenRecord {
    const s = (key: Shade) => shade(surface, key);
    if (mode === 'dark') {
        return {
            '--background': s('950'),
            '--foreground': s('0'),
            '--card': s('900'),
            '--card-foreground': s('0'),
            '--popover': s('900'),
            '--popover-foreground': s('0'),
            '--secondary': s('800'),
            '--secondary-foreground': s('0'),
            '--muted': s('800'),
            '--muted-foreground': s('400'),
            '--accent': s('800'),
            '--accent-foreground': s('0'),
            '--border': s('700'),
            '--input': s('700'),
            '--sidebar': s('900'),
            '--sidebar-foreground': s('0'),
            '--sidebar-accent': s('800'),
            '--sidebar-accent-foreground': s('0'),
            '--sidebar-border': s('700')
        };
    }
    return {
        '--background': s('100'),
        '--foreground': s('700'),
        '--card': s('0'),
        '--card-foreground': s('700'),
        '--popover': s('0'),
        '--popover-foreground': s('700'),
        '--secondary': s('100'),
        '--secondary-foreground': s('700'),
        '--muted': s('100'),
        '--muted-foreground': s('500'),
        '--accent': s('100'),
        '--accent-foreground': s('700'),
        '--border': s('200'),
        '--input': s('200'),
        '--sidebar': s('0'),
        '--sidebar-foreground': s('700'),
        '--sidebar-accent': s('100'),
        '--sidebar-accent-foreground': s('700'),
        '--sidebar-border': s('200')
    };
}
```

- [ ] **Step 5: Run to see it pass**

Run: `bun run test src/utils/theme.test.ts`
Expected: 9 tests pass.

- [ ] **Step 6: Verify and commit**

`bun run type-check`, `bun run lint`, `bun run test`, `bun run build` green.
```bash
git add src/layout/palettes.ts src/utils/theme.ts src/utils/theme.test.ts
```
```bash
git commit -m "feat: map primary and surface palettes to shadcn tokens"
```

---

### Task 6: Presets and the combined theme record

**Files:**
- Create: `src/layout/presets.ts`
- Modify: `src/utils/theme.ts`, `src/utils/theme.test.ts`, `src/assets/tailwind.css`

**Interfaces:**
- Consumes: `primaryVars`, `surfaceVars`, `resolvePrimary`, `resolveSurface` from Task 5.
- Produces from `@/layout/presets`: `type PresetName = 'Aura' | 'Lara' | 'Nora'`, `presetNames: PresetName[]`, `DEFAULT_PRESET = 'Aura'`, `presets: Record<PresetName, PresetTokens>`.
- Produces from `@/utils/theme`: `PRESET_TOKENS`, `resolvePreset(name: string): PresetName`, `presetVars(name: PresetName): TokenRecord`, `interface ThemeInput { preset: string; primary: string; surface: string | null; darkTheme: boolean }`, `themeVars(input: ThemeInput): TokenRecord`.

- [ ] **Step 1: Write the preset data**

`src/layout/presets.ts`:
```ts
// Values read on 2026-09-12 from node_modules/@primeuix/themes/dist/<preset>/base/index.mjs and
// dist/<preset>/button/index.mjs, before the package is removed in Plan 3:
//   content.borderRadius   Aura {border.radius.md} = 6px, Lara md = 6px, Nora {border.radius.xs} = 2px
//   formField.paddingY     Aura 0.5rem, Lara 0.625rem, Nora 0.5rem (control height = 2 * paddingY + 1.25rem line)
//   button fontWeight      Aura 500, Lara 600, Nora 700
//   transitionDuration     Aura 0.2s, Lara 0.2s, Nora 0s
export type PresetName = 'Aura' | 'Lara' | 'Nora';

export interface PresetTokens {
    radius: string;
    controlHeight: string;
    buttonFontWeight: string;
    transitionDuration: string;
}

export const presetNames: PresetName[] = ['Aura', 'Lara', 'Nora'];
export const DEFAULT_PRESET: PresetName = 'Aura';

export const presets: Record<PresetName, PresetTokens> = {
    Aura: { radius: '6px', controlHeight: '2.25rem', buttonFontWeight: '500', transitionDuration: '0.2s' },
    Lara: { radius: '6px', controlHeight: '2.5rem', buttonFontWeight: '600', transitionDuration: '0.2s' },
    Nora: { radius: '2px', controlHeight: '2.25rem', buttonFontWeight: '700', transitionDuration: '0s' }
};
```

- [ ] **Step 2: Add the failing tests**

Append to `src/utils/theme.test.ts` (extend the import line to also bring in `PRESET_TOKENS, presetVars, resolvePreset, themeVars`):
```ts
describe('presetVars', () => {
    it('returns the recorded PrimeVue values per preset', () => {
        expect(presetVars('Aura')).toEqual({ '--radius': '6px', '--control-height': '2.25rem', '--button-font-weight': '500', '--transition-duration': '0.2s' });
        expect(presetVars('Lara')['--control-height']).toBe('2.5rem');
        expect(presetVars('Nora')['--radius']).toBe('2px');
        expect(presetVars('Nora')['--transition-duration']).toBe('0s');
    });

    it('falls back to Aura for an unknown preset name', () => {
        expect(resolvePreset('Material')).toBe('Aura');
        expect(resolvePreset('Nora')).toBe('Nora');
    });

    it('returns exactly the documented preset tokens', () => {
        expect(Object.keys(presetVars('Aura')).sort()).toEqual([...PRESET_TOKENS].sort());
    });
});

describe('themeVars', () => {
    it('merges preset, surface and primary tokens with no overlap', () => {
        const vars = themeVars({ preset: 'Aura', primary: 'emerald', surface: null, darkTheme: false });
        expect(Object.keys(vars)).toHaveLength(PRESET_TOKENS.length + SURFACE_TOKENS.length + PRIMARY_TOKENS.length);
        expect(vars['--primary']).toBe('#10b981');
        expect(vars['--background']).toBe('#f1f5f9');
        expect(vars['--radius']).toBe('6px');
    });

    it('switches to the dark mapping and the zinc default surface', () => {
        const vars = themeVars({ preset: 'Nora', primary: 'emerald', surface: null, darkTheme: true });
        expect(vars['--primary']).toBe('#34d399');
        expect(vars['--background']).toBe('#09090b');
        expect(vars['--primary-foreground']).toBe('#18181b');
        expect(vars['--radius']).toBe('2px');
    });
});
```

- [ ] **Step 3: Run to see them fail**

Run: `bun run test src/utils/theme.test.ts`
Expected: FAIL with `presetVars is not a function` (or the import failing).

- [ ] **Step 4: Implement**

Append to `src/utils/theme.ts` (and add `import { DEFAULT_PRESET, presetNames, presets, type PresetName } from '@/layout/presets';` at the top):
```ts
export const PRESET_TOKENS = ['--radius', '--control-height', '--button-font-weight', '--transition-duration'] as const;

export function resolvePreset(name: string): PresetName {
    return presetNames.includes(name as PresetName) ? (name as PresetName) : DEFAULT_PRESET;
}

export function presetVars(name: PresetName): TokenRecord {
    const preset = presets[name];
    return {
        '--radius': preset.radius,
        '--control-height': preset.controlHeight,
        '--button-font-weight': preset.buttonFontWeight,
        '--transition-duration': preset.transitionDuration
    };
}

export interface ThemeInput {
    preset: string;
    primary: string;
    surface: string | null;
    darkTheme: boolean;
}

export function themeVars(input: ThemeInput): TokenRecord {
    const mode: ThemeMode = input.darkTheme ? 'dark' : 'light';
    const surface = resolveSurface(input.surface, mode);
    return {
        ...presetVars(resolvePreset(input.preset)),
        ...surfaceVars(surface.palette, mode),
        ...primaryVars(resolvePrimary(input.primary), mode, surface.palette)
    };
}
```

- [ ] **Step 5: Wire the preset hooks into the stylesheet**

First confirm the slot names the hooks target: run
```bash
grep -ho 'data-slot="[a-z-]*"' src/components/ui/input/Input.vue src/components/ui/select/SelectTrigger.vue
```
Expected: `data-slot="input"` and `data-slot="select-trigger"` (verified on the scratch copy). Then append to `src/assets/tailwind.css`:
```css
/* Preset density hooks. presetVars() in src/utils/theme.ts sets the variables on <html>; the fallbacks equal Aura. */
@layer components {
    [data-slot='button'] {
        font-weight: var(--button-font-weight, 500);
        transition-duration: var(--transition-duration, 0.2s);
    }
    [data-slot='input'],
    [data-slot='select-trigger'] {
        height: var(--control-height, 2.25rem);
    }
}
```

- [ ] **Step 6: Run to see them pass**

Run: `bun run test src/utils/theme.test.ts`
Expected: 14 tests pass.

- [ ] **Step 7: Verify and commit**

`bun run type-check`, `bun run lint`, `bun run test`, `bun run build` green.
```bash
git add src/layout/presets.ts src/utils/theme.ts src/utils/theme.test.ts src/assets/tailwind.css
```
```bash
git commit -m "feat: emulate the Aura, Lara and Nora presets as token sets"
```

---

### Task 7: Safe config parsing, the theme watcher, and the `.dark` rename

**Files:**
- Create: `src/utils/layoutConfig.ts`, `src/utils/layoutConfig.test.ts`, `src/layout/composables/theme.ts`, `src/layout/composables/theme.test.ts`, `src/layout/composables/primevueBridge.ts`
- Modify: `src/layout/composables/layout.ts`, `src/main.ts`, `src/assets/tailwind.css`, `src/assets/layout/variables/_dark.scss`

**Interfaces:**
- Consumes: `themeVars`, `ThemeInput` (Task 6); `primaryPalettes`, `surfacePalettes` (Task 5); `PresetName` (Task 6).
- Produces from `@/utils/layoutConfig`: `type MenuMode = 'static' | 'overlay'`, `interface LayoutConfig { preset: PresetName; primary: string; surface: string | null; darkTheme: boolean; menuMode: MenuMode }`, `DEFAULT_LAYOUT_CONFIG`, `parseLayoutConfig(raw: string | null): LayoutConfig`.
- Produces from `@/layout/composables/theme`: `applyTheme(input: ThemeInput): void`.
- Produces from `@/layout/composables/layout`: `layoutConfig` (module singleton, exported) and the existing `useLayout()` with the same return shape as today.
- Produces from `@/layout/composables/primevueBridge`: `syncPrimeVueTheme(input: ThemeInput): void`.

- [ ] **Step 1: Write the failing parser tests**

`src/utils/layoutConfig.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { DEFAULT_LAYOUT_CONFIG, parseLayoutConfig } from './layoutConfig';

describe('parseLayoutConfig', () => {
    it('returns the defaults for null, empty and corrupt input', () => {
        expect(parseLayoutConfig(null)).toEqual(DEFAULT_LAYOUT_CONFIG);
        expect(parseLayoutConfig('')).toEqual(DEFAULT_LAYOUT_CONFIG);
        expect(parseLayoutConfig('{not json')).toEqual(DEFAULT_LAYOUT_CONFIG);
        expect(parseLayoutConfig('42')).toEqual(DEFAULT_LAYOUT_CONFIG);
    });

    it('round-trips a valid config', () => {
        const stored = { preset: 'Nora', primary: 'blue', surface: 'ocean', darkTheme: true, menuMode: 'overlay' };
        expect(parseLayoutConfig(JSON.stringify(stored))).toEqual(stored);
    });

    it('drops unknown keys and replaces wrong types field by field', () => {
        const parsed = parseLayoutConfig(JSON.stringify({ preset: 7, primary: ['x'], surface: 3, darkTheme: 'yes', menuMode: null, extra: true }));
        expect(parsed).toEqual(DEFAULT_LAYOUT_CONFIG);
        expect(Object.keys(parsed)).toHaveLength(5);
    });

    it('rejects names that are not a known preset, palette or menu mode', () => {
        const parsed = parseLayoutConfig(JSON.stringify({ preset: 'Material', primary: 'mauve', surface: 'sand', menuMode: 'icon', darkTheme: true }));
        expect(parsed).toEqual({ ...DEFAULT_LAYOUT_CONFIG, darkTheme: true });
    });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `bun run test src/utils/layoutConfig.test.ts`
Expected: FAIL, unresolved import.

- [ ] **Step 3: Implement the parser**

`src/utils/layoutConfig.ts`:
```ts
import { DEFAULT_PRIMARY, primaryPalettes, surfacePalettes } from '@/layout/palettes';
import { DEFAULT_PRESET, presetNames, type PresetName } from '@/layout/presets';

export type MenuMode = 'static' | 'overlay';

export interface LayoutConfig {
    preset: PresetName;
    primary: string;
    surface: string | null;
    darkTheme: boolean;
    menuMode: MenuMode;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
    preset: DEFAULT_PRESET,
    primary: DEFAULT_PRIMARY,
    surface: null,
    darkTheme: false,
    menuMode: 'static'
};

const MENU_MODES: MenuMode[] = ['static', 'overlay'];

// localStorage is user-editable and survives template upgrades, so every field is validated
// and anything unexpected falls back to its default instead of throwing at module load.
export function parseLayoutConfig(raw: string | null): LayoutConfig {
    let parsed: unknown = null;
    if (raw) {
        try {
            parsed = JSON.parse(raw);
        } catch {
            parsed = null;
        }
    }
    const source = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
    const defaults = DEFAULT_LAYOUT_CONFIG;
    return {
        preset: presetNames.includes(source.preset as PresetName) ? (source.preset as PresetName) : defaults.preset,
        primary: primaryPalettes.some((option) => option.name === source.primary) ? (source.primary as string) : defaults.primary,
        surface: surfacePalettes.some((option) => option.name === source.surface) ? (source.surface as string) : defaults.surface,
        darkTheme: typeof source.darkTheme === 'boolean' ? source.darkTheme : defaults.darkTheme,
        menuMode: MENU_MODES.includes(source.menuMode as MenuMode) ? (source.menuMode as MenuMode) : defaults.menuMode
    };
}
```

Run: `bun run test src/utils/layoutConfig.test.ts`
Expected: 4 tests pass.

- [ ] **Step 4: Write the failing DOM test for applyTheme**

`src/layout/composables/theme.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { applyTheme } from './theme';

describe('applyTheme', () => {
    it('writes the token record onto the root element as inline custom properties', () => {
        applyTheme({ preset: 'Aura', primary: 'emerald', surface: null, darkTheme: false });
        const style = document.documentElement.style;
        expect(style.getPropertyValue('--primary')).toBe('#10b981');
        expect(style.getPropertyValue('--background')).toBe('#f1f5f9');
        expect(style.getPropertyValue('--radius')).toBe('6px');
    });

    it('overwrites the same properties on the next call', () => {
        applyTheme({ preset: 'Nora', primary: 'blue', surface: 'zinc', darkTheme: true });
        const style = document.documentElement.style;
        expect(style.getPropertyValue('--primary')).toBe('#60a5fa');
        expect(style.getPropertyValue('--background')).toBe('#09090b');
        expect(style.getPropertyValue('--radius')).toBe('2px');
    });
});
```

Run: `bun run test src/layout/composables/theme.test.ts`
Expected: FAIL, unresolved import.

- [ ] **Step 5: Implement applyTheme and the bridge**

`src/layout/composables/theme.ts`:
```ts
import { themeVars, type ThemeInput } from '@/utils/theme';

// Inline custom properties on <html> beat the static :root and .dark blocks in tailwind.css,
// which stay only as the pre-hydration fallback.
export function applyTheme(input: ThemeInput): void {
    if (typeof document === 'undefined') return;
    const style = document.documentElement.style;
    for (const [token, value] of Object.entries(themeVars(input))) {
        style.setProperty(token, value);
    }
}
```

`src/layout/composables/primevueBridge.ts`:
```ts
// TRANSITIONAL. Keeps PrimeVue's own theme in step with the picker while unported pages still
// render PrimeVue components. Delete this file, and its two call sites, in the Plan 3 sweep.
import { $t } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Nora from '@primeuix/themes/nora';
import { primaryPalettes, surfacePalettes } from '@/layout/palettes';
import type { PresetName } from '@/layout/presets';
import type { ThemeInput } from '@/utils/theme';

const primePresets: Record<PresetName, unknown> = { Aura, Lara, Nora };

// Lifted unchanged from the old AppConfigurator.getPresetExt().
function primaryExtension(primaryName: string): Record<string, unknown> {
    const color = primaryPalettes.find((option) => option.name === primaryName);
    if (!color) return {};
    if (color.name === 'noir') {
        return {
            semantic: {
                primary: {
                    50: '{surface.50}',
                    100: '{surface.100}',
                    200: '{surface.200}',
                    300: '{surface.300}',
                    400: '{surface.400}',
                    500: '{surface.500}',
                    600: '{surface.600}',
                    700: '{surface.700}',
                    800: '{surface.800}',
                    900: '{surface.900}',
                    950: '{surface.950}'
                },
                colorScheme: {
                    light: {
                        primary: { color: '{primary.950}', contrastColor: '#ffffff', hoverColor: '{primary.800}', activeColor: '{primary.700}' },
                        highlight: { background: '{primary.950}', focusBackground: '{primary.700}', color: '#ffffff', focusColor: '#ffffff' }
                    },
                    dark: {
                        primary: { color: '{primary.50}', contrastColor: '{primary.950}', hoverColor: '{primary.200}', activeColor: '{primary.300}' },
                        highlight: { background: '{primary.50}', focusBackground: '{primary.300}', color: '{primary.950}', focusColor: '{primary.950}' }
                    }
                }
            }
        };
    }
    return {
        semantic: {
            primary: color.palette,
            colorScheme: {
                light: {
                    primary: { color: '{primary.500}', contrastColor: '#ffffff', hoverColor: '{primary.600}', activeColor: '{primary.700}' },
                    highlight: { background: '{primary.50}', focusBackground: '{primary.100}', color: '{primary.700}', focusColor: '{primary.800}' }
                },
                dark: {
                    primary: { color: '{primary.400}', contrastColor: '{surface.900}', hoverColor: '{primary.300}', activeColor: '{primary.200}' },
                    highlight: {
                        background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                        focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                        color: 'rgba(255,255,255,.87)',
                        focusColor: 'rgba(255,255,255,.87)'
                    }
                }
            }
        }
    };
}

export function syncPrimeVueTheme(input: ThemeInput): void {
    const preset = primePresets[input.preset as PresetName] ?? Aura;
    const surface = surfacePalettes.find((option) => option.name === input.surface)?.palette;
    $t().preset(preset).preset(primaryExtension(input.primary)).surfacePalette(surface).use({ useDefaultOptions: true });
}
```
If `vue-tsc` rejects the `$t()` chain's argument types, keep the call and cast the two `preset()` arguments with `as never`, exactly as narrow as needed; this file is deleted in Plan 3.

Run: `bun run test src/layout/composables/theme.test.ts`
Expected: 2 tests pass.

- [ ] **Step 6: Rewrite the layout composable**

Replace `src/layout/composables/layout.ts` with:
```ts
/// <reference lib="dom" />
import type { ComputedRef } from 'vue';
import { computed, onMounted, reactive, watch } from 'vue';
import { applyTheme } from '@/layout/composables/theme';
import { syncPrimeVueTheme } from '@/layout/composables/primevueBridge';
import { parseLayoutConfig, type LayoutConfig, type MenuMode } from '@/utils/layoutConfig';

const STORAGE_KEY = 'layoutConfig';
const DARK_CLASS = 'dark';

interface LayoutState {
    staticMenuInactive: boolean;
    overlayMenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    mobileMenuActive: boolean;
    sidebarExpanded: boolean;
    menuHoverActive: boolean;
    activeMenuItem: unknown;
    activePath: string | null;
    anchored: boolean;
}

function readStoredConfig(): string | null {
    // Storage can be disabled or throw in private modes; a missing value is not an error.
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export const layoutConfig = reactive<LayoutConfig>(parseLayoutConfig(readStoredConfig()));

const layoutState = reactive<LayoutState>({
    staticMenuInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    mobileMenuActive: false,
    sidebarExpanded: false,
    menuHoverActive: false,
    activeMenuItem: null,
    activePath: null,
    anchored: false
});

watch(
    layoutConfig,
    (config) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch {
            // Persistence is best effort; the in-memory config still drives the UI.
        }
    },
    { deep: true }
);

const themeInput = () => ({ preset: layoutConfig.preset, primary: layoutConfig.primary, surface: layoutConfig.surface, darkTheme: layoutConfig.darkTheme });

// Synchronous flush so the new colours are already on <html> inside the view transition callback.
watch(themeInput, applyTheme, { immediate: true, flush: 'sync' });
// Not immediate: PrimeVue is not installed yet when this module first evaluates; main.ts runs the first sync.
watch(themeInput, syncPrimeVueTheme, { flush: 'sync' });

interface MenuModeChangeEvent {
    value: MenuMode;
}

interface UseLayout {
    layoutConfig: LayoutConfig;
    layoutState: LayoutState;
    isDarkTheme: ComputedRef<boolean>;
    hasOpenOverlay: ComputedRef<boolean>;
    isDesktop: () => boolean;
    toggleDarkMode: () => void;
    toggleMenu: () => void;
    toggleConfigSidebar: () => void;
    hideMobileMenu: () => void;
    changeMenuMode: (event: MenuModeChangeEvent) => void;
}

export function useLayout(): UseLayout {
    const isDesktop = (): boolean => window.innerWidth > 991;

    const executeDarkModeToggle = () => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme;
        document.documentElement.classList.toggle(DARK_CLASS, layoutConfig.darkTheme);
    };

    const toggleDarkMode = () => {
        if (!document.startViewTransition) {
            executeDarkModeToggle();
            return;
        }
        document.startViewTransition(() => executeDarkModeToggle());
    };

    const toggleMenu = () => {
        if (isDesktop()) {
            if (layoutConfig.menuMode === 'static') {
                layoutState.staticMenuInactive = !layoutState.staticMenuInactive;
            }
            if (layoutConfig.menuMode === 'overlay') {
                layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
            }
        } else {
            layoutState.mobileMenuActive = !layoutState.mobileMenuActive;
        }
    };

    const toggleConfigSidebar = () => {
        layoutState.configSidebarVisible = !layoutState.configSidebarVisible;
    };

    const hideMobileMenu = () => {
        layoutState.mobileMenuActive = false;
    };

    const changeMenuMode = (event: MenuModeChangeEvent) => {
        layoutConfig.menuMode = event.value;
        layoutState.staticMenuInactive = false;
        layoutState.mobileMenuActive = false;
        layoutState.sidebarExpanded = false;
        layoutState.menuHoverActive = false;
        layoutState.anchored = false;
    };

    onMounted(() => {
        document.documentElement.classList.toggle(DARK_CLASS, layoutConfig.darkTheme);
    });

    const isDarkTheme = computed(() => layoutConfig.darkTheme);
    const hasOpenOverlay = computed(() => layoutState.overlayMenuActive);

    return {
        layoutConfig,
        layoutState,
        isDarkTheme,
        hasOpenOverlay,
        isDesktop,
        toggleDarkMode,
        toggleMenu,
        toggleConfigSidebar,
        hideMobileMenu,
        changeMenuMode
    };
}
```

- [ ] **Step 7: Rename the class everywhere else**

`src/main.ts` becomes:
```ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { layoutConfig } from '@/layout/composables/layout';
import { syncPrimeVueTheme } from '@/layout/composables/primevueBridge';

import '@/assets/tailwind.css';
import '@/assets/styles.scss';

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

// First sync of PrimeVue's theme with the persisted picker choice; later changes flow through the watcher.
syncPrimeVueTheme(layoutConfig);

app.mount('#app');
```

In `src/assets/tailwind.css`, replace the custom variant line and its comment with:
```css
@custom-variant dark (&:is(.dark *));
```

In `src/assets/layout/variables/_dark.scss`, change the selector line `:root[class*='app-dark'] {` to `:root.dark {` (leave the body of the block for Task 8).

Run: `grep -rn 'app-dark' src` and expect only `src/views/pages/Documentation.vue:91` (a code sample, rewritten in Plan 4).

- [ ] **Step 8: Verify**

`bun run type-check`, `bun run lint`, `bun run test` (all files pass; count is 37), `bun run build` green.

Then `bun run dev`, open http://localhost:5173/ and check: the dashboard renders; toggling the sun/moon button adds and removes `class="dark"` on `<html>` (inspect element) and PrimeVue components switch to dark; reloading keeps the choice; the `<html>` element carries inline `--primary`, `--background` and `--radius` properties. Stop the dev server.

- [ ] **Step 9: Commit**

```bash
git add src/utils/layoutConfig.ts src/utils/layoutConfig.test.ts src/layout/composables/theme.ts src/layout/composables/theme.test.ts src/layout/composables/primevueBridge.ts src/layout/composables/layout.ts src/main.ts src/assets/tailwind.css src/assets/layout/variables/_dark.scss
```
```bash
git commit -m "feat: drive shadcn tokens from the layout config and switch dark mode to .dark"
```

---

### Task 8: Re-point the layout SCSS at shadcn tokens

**Files:**
- Modify: `src/assets/layout/variables/_common.scss`, `_light.scss`, `_dark.scss`, `src/assets/layout/_utils.scss`, `src/layout/AppLayout.vue`

**Interfaces:**
- Consumes: the tokens `applyTheme` writes (Task 7).
- Produces: the Sakai variables (`--surface-card`, `--text-color`, `--surface-ground`, `--content-border-radius`, focus ring set) that `_topbar.scss`, `_menu.scss`, `_core.scss`, `_typography.scss`, `_mixins.scss` and `_responsive.scss` keep reading unchanged.

- [ ] **Step 1: Rewrite the three variable files**

`src/assets/layout/variables/_common.scss`:
```scss
:root {
    --primary-color: var(--primary);
    --primary-contrast-color: var(--primary-foreground);
    --text-color: var(--foreground);
    --text-color-secondary: var(--muted-foreground);
    --surface-border: var(--border);
    --surface-card: var(--card);
    --surface-hover: var(--accent);
    --surface-overlay: var(--popover);
    --surface-ground: var(--background);
    --maskbg: rgba(0, 0, 0, 0.4);
    --content-border-radius: var(--radius);
    /* Overridden per preset by the inline --transition-duration that applyTheme() writes on <html>. */
    --transition-duration: 0.2s;
    --layout-section-transition-duration: 0.2s;
    --element-transition-duration: var(--transition-duration);
    --focus-ring-width: 1px;
    --focus-ring-style: solid;
    --focus-ring-color: var(--ring);
    --focus-ring-offset: 2px;
    --focus-ring-shadow: none;
}
```

`src/assets/layout/variables/_light.scss`:
```scss
:root {
    --code-background: #18181b;
    --code-color: #e4e4e7;
}
```

`src/assets/layout/variables/_dark.scss`:
```scss
:root.dark {
    --code-background: #27272a;
    --code-color: #f4f4f5;
}
```

- [ ] **Step 2: Drop the toast rule and switch the mask animation**

In `src/assets/layout/_utils.scss` delete the whole `.p-toast { ... }` block (the last rule in the file); keep `.clearfix` and `.card`.

In `src/layout/AppLayout.vue` change
```html
<div class="layout-mask animate-fadein" @click="hideMobileMenu" />
```
to
```html
<div class="layout-mask animate-in fade-in" @click="hideMobileMenu" />
```

- [ ] **Step 3: Verify**

Run: `grep -rn -- '--p-' src/assets` and expect no output. `bun run type-check`, `bun run lint`, `bun run test`, `bun run build` green.

Then `bun run dev` and check at http://localhost:5173/: the page ground is light grey with white cards (slate 100 over white); the sidebar is white; open the palette panel and pick `blue`: the topbar logo, the active menu item and PrimeVue buttons all turn blue; pick surface `ocean`: ground and cards shift; toggle dark: ground zinc 950, cards zinc 900. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/assets/layout/variables/_common.scss src/assets/layout/variables/_light.scss src/assets/layout/variables/_dark.scss src/assets/layout/_utils.scss src/layout/AppLayout.vue
```
```bash
git commit -m "refactor: point the Sakai layout variables at shadcn tokens"
```

---

### Task 9: Rebuild the configurator panel on shadcn

**Files:**
- Modify: `src/layout/AppConfigurator.vue`

**Interfaces:**
- Consumes: `useLayout()` (Task 7), `primaryPalettes`, `surfacePalettes` (Task 5), `presetNames` (Task 6), `ToggleGroup`, `ToggleGroupItem` (Task 2).
- Produces: nothing new; the panel writes `layoutConfig.primary`, `.surface`, `.preset` and calls `changeMenuMode`.

- [ ] **Step 1: Replace the file**

`src/layout/AppConfigurator.vue`:
```vue
<script setup lang="ts">
    import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
    import { useLayout } from '@/layout/composables/layout';
    import { primaryPalettes, surfacePalettes, type PaletteOption } from '@/layout/palettes';
    import { presetNames, type PresetName } from '@/layout/presets';
    import type { MenuMode } from '@/utils/layoutConfig';

    const { layoutConfig, isDarkTheme, changeMenuMode } = useLayout();

    const menuModes: { label: string; value: MenuMode }[] = [
        { label: 'Static', value: 'static' },
        { label: 'Overlay', value: 'overlay' }
    ];

    function swatchColor(option: PaletteOption): string {
        return option.name === 'noir' ? 'var(--foreground)' : (option.palette['500'] ?? '');
    }

    function isSurfaceSelected(option: PaletteOption): boolean {
        if (layoutConfig.surface) return layoutConfig.surface === option.name;
        return option.name === (isDarkTheme.value ? 'zinc' : 'slate');
    }

    // ToggleGroup emits undefined when the active item is clicked again; the old SelectButton had allowEmpty=false.
    function onPreset(value: unknown): void {
        if (typeof value === 'string' && presetNames.includes(value as PresetName)) layoutConfig.preset = value as PresetName;
    }

    function onMenuMode(value: unknown): void {
        if (value === 'static' || value === 'overlay') changeMenuMode({ value });
    }
</script>

<template>
    <div class="config-panel hidden absolute top-[3.25rem] right-0 w-64 p-4 bg-card border border-border rounded-lg origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]">
        <div class="flex flex-col gap-4">
            <div>
                <span class="text-sm text-muted-foreground font-semibold">Primary</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-between">
                    <button
                        v-for="option of primaryPalettes"
                        :key="option.name"
                        type="button"
                        :title="option.name"
                        :class="['border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1', { 'outline-primary': layoutConfig.primary === option.name }]"
                        :style="{ backgroundColor: swatchColor(option) }"
                        @click="layoutConfig.primary = option.name"
                    ></button>
                </div>
            </div>
            <div>
                <span class="text-sm text-muted-foreground font-semibold">Surface</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-between">
                    <button
                        v-for="option of surfacePalettes"
                        :key="option.name"
                        type="button"
                        :title="option.name"
                        :class="['border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1', { 'outline-primary': isSurfaceSelected(option) }]"
                        :style="{ backgroundColor: option.palette['500'] }"
                        @click="layoutConfig.surface = option.name"
                    ></button>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-foreground font-semibold">Presets</span>
                <ToggleGroup type="single" variant="outline" :model-value="layoutConfig.preset" @update:model-value="onPreset">
                    <ToggleGroupItem v-for="name of presetNames" :key="name" :value="name">{{ name }}</ToggleGroupItem>
                </ToggleGroup>
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-foreground font-semibold">Menu Mode</span>
                <ToggleGroup type="single" variant="outline" :model-value="layoutConfig.menuMode" @update:model-value="onMenuMode">
                    <ToggleGroupItem v-for="mode of menuModes" :key="mode.value" :value="mode.value">{{ mode.label }}</ToggleGroupItem>
                </ToggleGroup>
            </div>
        </div>
    </div>
</template>
```

The panel is still shown and hidden by the `v-styleclass` button in `AppTopbar.vue` and `FloatingConfigurator.vue`; those move to `Popover` in Plan 2 when the layout pieces are ported.

- [ ] **Step 2: Verify**

`bun run type-check` exit 0 (if `ToggleGroup` rejects `variant="outline"`, use `variant="outline"` only on the items instead; the rehearsal did not exercise this prop). `bun run lint`, `bun run test`, `bun run build` green.

`bun run dev`, open the palette panel: three preset toggles and two menu-mode toggles render as outlined segmented buttons; clicking `Nora` sharpens corners of the panel, the sidebar card and PrimeVue buttons and the `<html>` inline style shows `--radius: 2px`; clicking `Lara` makes PrimeVue inputs on `/pages/crud` (open the New dialog) taller and `<html>` shows `--control-height: 2.5rem`; menu mode `Overlay` hides the static sidebar. Reload: choices persist. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/layout/AppConfigurator.vue
```
```bash
git commit -m "feat: rebuild the theme configurator on shadcn toggles and the palette modules"
```

---

### Task 10: `useToast()` shim and the Sonner toaster

**Files:**
- Create: `src/composables/useToast.ts`, `src/composables/useToast.test.ts`
- Modify: `src/App.vue`

**Interfaces:**
- Consumes: `Toaster` from `@/components/ui/sonner` (Task 2), `toast` from `vue-sonner`.
- Produces: `type ToastSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'`, `interface ToastMessage { severity?: ToastSeverity; summary?: string; detail?: string; life?: number }`, `showToast(message: ToastMessage): void`, `useToast(): { add(message: ToastMessage): void }`. Call sites keep the PrimeVue shape `useToast().add({ severity, summary, detail, life })`.

- [ ] **Step 1: Write the failing tests**

`src/composables/useToast.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'vue-sonner';
import { useToast } from './useToast';

vi.mock('vue-sonner', () => {
    const base = vi.fn();
    return { toast: Object.assign(base, { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() }) };
});

const mocked = vi.mocked(toast, true);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useToast', () => {
    it('maps success, info, warn and error severities to the matching sonner calls', () => {
        const { add } = useToast();
        add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        expect(mocked.success).toHaveBeenCalledWith('Successful', { description: 'Product Updated', duration: 3000 });
        add({ severity: 'info', summary: 'Info', life: 1000 });
        expect(mocked.info).toHaveBeenCalledWith('Info', { description: undefined, duration: 1000 });
        add({ severity: 'warn', summary: 'Careful', life: 1000 });
        expect(mocked.warning).toHaveBeenCalledWith('Careful', { description: undefined, duration: 1000 });
        add({ severity: 'error', summary: 'Failed', life: 1000 });
        expect(mocked.error).toHaveBeenCalledWith('Failed', { description: undefined, duration: 1000 });
    });

    it('uses the plain toast for secondary, contrast and missing severities', () => {
        const { add } = useToast();
        add({ severity: 'secondary', summary: 'Note', life: 500 });
        add({ severity: 'contrast', summary: 'Note', life: 500 });
        add({ summary: 'Note', life: 500 });
        expect(mocked).toHaveBeenCalledTimes(3);
        expect(mocked).toHaveBeenLastCalledWith('Note', { description: undefined, duration: 500 });
    });

    it('keeps a toast without life on screen, as PrimeVue did', () => {
        useToast().add({ severity: 'success', summary: 'Sticky' });
        expect(mocked.success).toHaveBeenCalledWith('Sticky', { description: undefined, duration: Infinity });
    });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `bun run test src/composables/useToast.test.ts`
Expected: FAIL, unresolved import `./useToast`.

- [ ] **Step 3: Implement**

`src/composables/useToast.ts`:
```ts
import { toast } from 'vue-sonner';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';

export interface ToastMessage {
    severity?: ToastSeverity;
    summary?: string;
    detail?: string;
    /** Milliseconds before auto-dismiss. Omitted means the toast stays until closed, as in PrimeVue. */
    life?: number;
}

export function showToast(message: ToastMessage): void {
    const title = message.summary ?? '';
    const options = { description: message.detail, duration: message.life ?? Infinity };
    switch (message.severity) {
        case 'success':
            toast.success(title, options);
            break;
        case 'info':
            toast.info(title, options);
            break;
        case 'warn':
            toast.warning(title, options);
            break;
        case 'error':
            toast.error(title, options);
            break;
        default:
            toast(title, options);
    }
}

// Same call shape as primevue/usetoast so ported pages only change the import line.
export function useToast() {
    return { add: showToast };
}
```

- [ ] **Step 4: Mount the toaster once**

`src/App.vue`:
```vue
<script setup lang="ts">
    import 'vue-sonner/style.css';
    import { Toaster } from '@/components/ui/sonner';
</script>

<template>
    <router-view />
    <Toaster position="top-right" close-button :offset="{ top: '5rem', right: '1.5rem' }" />
</template>
```
(The `<style scoped></style>` block that was there is dropped; it was empty.) The PrimeVue `<Toast />` in `AppLayout.vue` stays until Crud is ported in Plan 2.

- [ ] **Step 5: Run to see it pass, verify, commit**

Run: `bun run test src/composables/useToast.test.ts` (3 pass). Then `bun run type-check`, `bun run lint`, `bun run test`, `bun run build` green.
```bash
git add src/composables/useToast.ts src/composables/useToast.test.ts src/App.vue
```
```bash
git commit -m "feat: add a PrimeVue-shaped useToast shim over vue-sonner"
```

---

### Task 11: `useConfirm()` composable and the AlertDialog host

**Files:**
- Create: `src/composables/useConfirm.ts`, `src/composables/useConfirm.test.ts`, `src/components/ConfirmDialogHost.vue`, `src/components/ConfirmDialogHost.test.ts`
- Modify: `src/App.vue`

**Interfaces:**
- Consumes: `AlertDialog`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle` (Task 2), `Button` (Task 2).
- Produces: `interface ConfirmOptions { target?: HTMLElement; message?: string; header?: string; icon?: Component; acceptLabel?: string; rejectLabel?: string; acceptVariant?: 'default' | 'destructive'; accept?: () => void; reject?: () => void }`, `confirmState` (readonly reactive `{ visible: boolean; options: ConfirmOptions | null }`), `requireConfirm`, `acceptConfirm`, `rejectConfirm`, `closeConfirm`, `useConfirm(): { require(options: ConfirmOptions): void; close(): void }`. `ConfirmPopover` (anchored to `target`) arrives in Plan 2; until then every `require()` opens the dialog.

- [ ] **Step 1: Write the failing composable tests**

`src/composables/useConfirm.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { acceptConfirm, closeConfirm, confirmState, rejectConfirm, useConfirm } from './useConfirm';

beforeEach(() => {
    closeConfirm();
});

describe('useConfirm', () => {
    it('opens with the given options', () => {
        useConfirm().require({ header: 'Delete?', message: 'Sure?' });
        expect(confirmState.visible).toBe(true);
        expect(confirmState.options?.header).toBe('Delete?');
    });

    it('accept runs the accept callback once and closes', () => {
        const accept = vi.fn();
        const reject = vi.fn();
        useConfirm().require({ message: 'Sure?', accept, reject });
        acceptConfirm();
        expect(accept).toHaveBeenCalledTimes(1);
        expect(reject).not.toHaveBeenCalled();
        expect(confirmState.visible).toBe(false);
        expect(confirmState.options).toBeNull();
    });

    it('reject runs the reject callback and closes', () => {
        const accept = vi.fn();
        const reject = vi.fn();
        useConfirm().require({ message: 'Sure?', accept, reject });
        rejectConfirm();
        expect(reject).toHaveBeenCalledTimes(1);
        expect(accept).not.toHaveBeenCalled();
        expect(confirmState.visible).toBe(false);
    });

    it('close runs neither callback', () => {
        const accept = vi.fn();
        const reject = vi.fn();
        useConfirm().require({ message: 'Sure?', accept, reject });
        useConfirm().close();
        expect(accept).not.toHaveBeenCalled();
        expect(reject).not.toHaveBeenCalled();
        expect(confirmState.visible).toBe(false);
    });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

Run: `bun run test src/composables/useConfirm.test.ts` and expect an unresolved import. Then create `src/composables/useConfirm.ts`:
```ts
import { reactive, readonly, type Component } from 'vue';

export interface ConfirmOptions {
    /** Element to anchor a popover to. Plan 2 adds ConfirmPopover; until then the dialog is used for every request. */
    target?: HTMLElement;
    message?: string;
    header?: string;
    icon?: Component;
    acceptLabel?: string;
    rejectLabel?: string;
    acceptVariant?: 'default' | 'destructive';
    accept?: () => void;
    reject?: () => void;
}

interface ConfirmState {
    visible: boolean;
    options: ConfirmOptions | null;
}

const state = reactive<ConfirmState>({ visible: false, options: null });

export const confirmState = readonly(state);

export function requireConfirm(options: ConfirmOptions): void {
    state.options = options;
    state.visible = true;
}

function settle(callback: (() => void) | undefined): void {
    // Clear first so a callback that opens another confirmation is not wiped by this one closing.
    state.visible = false;
    state.options = null;
    callback?.();
}

export function acceptConfirm(): void {
    settle(state.options?.accept);
}

export function rejectConfirm(): void {
    settle(state.options?.reject);
}

export function closeConfirm(): void {
    settle(undefined);
}

// Same call shape as primevue/useconfirm so ported pages only change the import line.
export function useConfirm() {
    return { require: requireConfirm, close: closeConfirm };
}
```
Run the test again: 4 pass.

- [ ] **Step 3: Write the failing host test**

`src/components/ConfirmDialogHost.test.ts`:
```ts
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { closeConfirm, confirmState, requireConfirm } from '@/composables/useConfirm';
import ConfirmDialogHost from './ConfirmDialogHost.vue';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
    closeConfirm();
    document.body.innerHTML = '';
});

describe('ConfirmDialogHost', () => {
    it('shows the header, message and labels of the pending confirmation and accepts', async () => {
        const accept = vi.fn();
        const wrapper = mount(ConfirmDialogHost, { attachTo: document.body });
        requireConfirm({ header: 'Delete product?', message: 'This cannot be undone.', acceptLabel: 'Delete', rejectLabel: 'Keep', accept });
        await settle();
        expect(document.body.textContent).toContain('Delete product?');
        expect(document.body.textContent).toContain('This cannot be undone.');
        const acceptButton = document.body.querySelector<HTMLButtonElement>('[data-testid=confirm-accept]');
        expect(acceptButton?.textContent).toContain('Delete');
        acceptButton!.click();
        await settle();
        expect(accept).toHaveBeenCalledTimes(1);
        expect(confirmState.visible).toBe(false);
        wrapper.unmount();
    });

    it('rejects from the reject button and falls back to Confirm, Yes and No', async () => {
        const reject = vi.fn();
        const wrapper = mount(ConfirmDialogHost, { attachTo: document.body });
        requireConfirm({ message: 'Proceed?', reject });
        await settle();
        expect(document.body.textContent).toContain('Confirm');
        const rejectButton = document.body.querySelector<HTMLButtonElement>('[data-testid=confirm-reject]');
        expect(rejectButton?.textContent).toContain('No');
        expect(document.body.querySelector('[data-testid=confirm-accept]')?.textContent).toContain('Yes');
        rejectButton!.click();
        await settle();
        expect(reject).toHaveBeenCalledTimes(1);
        expect(confirmState.visible).toBe(false);
        wrapper.unmount();
    });
});
```

- [ ] **Step 4: Run to see it fail, then implement the host**

Run: `bun run test src/components/ConfirmDialogHost.test.ts` and expect an unresolved import. Create `src/components/ConfirmDialogHost.vue`:
```vue
<script setup lang="ts">
    import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
    import { Button } from '@/components/ui/button';
    import { acceptConfirm, confirmState, rejectConfirm } from '@/composables/useConfirm';

    // Escape and overlay clicks arrive here as open=false; the footer buttons settle the state themselves.
    function onOpenChange(open: boolean): void {
        if (!open && confirmState.visible) rejectConfirm();
    }
</script>

<template>
    <AlertDialog :open="confirmState.visible" @update:open="onOpenChange">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ confirmState.options?.header ?? 'Confirm' }}</AlertDialogTitle>
                <AlertDialogDescription class="flex items-center gap-3">
                    <component :is="confirmState.options.icon" v-if="confirmState.options?.icon" class="size-6 shrink-0" />
                    <span>{{ confirmState.options?.message }}</span>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button variant="outline" data-testid="confirm-reject" @click="rejectConfirm">{{ confirmState.options?.rejectLabel ?? 'No' }}</Button>
                <Button :variant="confirmState.options?.acceptVariant ?? 'default'" data-testid="confirm-accept" @click="acceptConfirm">{{ confirmState.options?.acceptLabel ?? 'Yes' }}</Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
```
Plain `Button`s are used instead of `AlertDialogAction` and `AlertDialogCancel` on purpose: those close the dialog through Reka before our click handler runs, which would turn every accept into a reject.

Run the test again: 2 pass.

- [ ] **Step 5: Mount the host, verify, commit**

Add to `src/App.vue`: import `ConfirmDialogHost from '@/components/ConfirmDialogHost.vue'` and render `<ConfirmDialogHost />` after the `<Toaster />`.

`bun run type-check`, `bun run lint`, `bun run test`, `bun run build` green.
```bash
git add src/composables/useConfirm.ts src/composables/useConfirm.test.ts src/components/ConfirmDialogHost.vue src/components/ConfirmDialogHost.test.ts src/App.vue
```
```bash
git commit -m "feat: add useConfirm composable with an AlertDialog host"
```

---

### Task 12: `AppChart` wrapper over chart.js

**Files:**
- Create: `src/components/AppChart.vue`, `src/components/AppChart.test.ts`

**Interfaces:**
- Produces: `AppChart` with props `type: ChartType`, `data: ChartData`, `options?: ChartOptions`, `plugins?: Plugin[]`, `class?`; exposes `getChart(): Chart | null`. Same prop names as PrimeVue's `Chart`.

- [ ] **Step 1: Write the failing test**

`src/components/AppChart.test.ts`:
```ts
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppChart from './AppChart.vue';

const { MockChart } = vi.hoisted(() => {
    class MockChart {
        static register = vi.fn();
        static instances: MockChart[] = [];
        data: unknown;
        options: unknown;
        update = vi.fn();
        destroy = vi.fn();
        constructor(
            public canvas: HTMLCanvasElement,
            public config: { type: string; data: unknown; options?: unknown }
        ) {
            this.data = config.data;
            this.options = config.options;
            MockChart.instances.push(this);
        }
    }
    return { MockChart };
});

vi.mock('chart.js', () => ({ Chart: MockChart, registerables: [] }));

const data = { labels: ['a', 'b'], datasets: [{ label: 'Sales', data: [1, 2] }] };

beforeEach(() => {
    MockChart.instances.length = 0;
});

describe('AppChart', () => {
    it('creates one chart on its canvas with the given type and data', () => {
        mount(AppChart, { props: { type: 'bar', data } });
        expect(MockChart.instances).toHaveLength(1);
        const instance = MockChart.instances[0]!;
        expect(instance.canvas.tagName).toBe('CANVAS');
        expect(instance.config.type).toBe('bar');
        // Vue hands components a readonly proxy of the prop, so compare by value.
        expect(instance.config.data).toEqual(data);
    });

    it('pushes new data and options into the chart and calls update', async () => {
        const wrapper = mount(AppChart, { props: { type: 'line', data } });
        const next = { labels: ['c'], datasets: [{ label: 'Sales', data: [3] }] };
        await wrapper.setProps({ data: next, options: { responsive: false } });
        const instance = MockChart.instances[0]!;
        expect(instance.update).toHaveBeenCalledTimes(1);
        expect(instance.data).toEqual(next);
        expect(instance.options).toEqual({ responsive: false });
    });

    it('destroys the chart when unmounted', () => {
        const wrapper = mount(AppChart, { props: { type: 'pie', data } });
        wrapper.unmount();
        expect(MockChart.instances[0]!.destroy).toHaveBeenCalledTimes(1);
    });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

Run: `bun run test src/components/AppChart.test.ts` and expect an unresolved import. Create `src/components/AppChart.vue`:
```vue
<script setup lang="ts">
    import { Chart, registerables, type ChartData, type ChartOptions, type ChartType, type Plugin } from 'chart.js';
    import { onBeforeUnmount, onMounted, ref, watch, type HTMLAttributes } from 'vue';

    Chart.register(...registerables);

    const props = defineProps<{
        type: ChartType;
        data: ChartData;
        options?: ChartOptions;
        plugins?: Plugin[];
        class?: HTMLAttributes['class'];
    }>();

    const canvas = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;

    onMounted(() => {
        if (!canvas.value) return;
        chart = new Chart(canvas.value, { type: props.type, data: props.data, options: props.options, plugins: props.plugins });
    });

    watch(
        () => [props.data, props.options],
        () => {
            if (!chart) return;
            chart.data = props.data;
            chart.options = props.options ?? {};
            chart.update();
        },
        { deep: true }
    );

    onBeforeUnmount(() => {
        chart?.destroy();
        chart = null;
    });

    defineExpose({ getChart: () => chart });
</script>

<template>
    <div :class="props.class" data-slot="chart">
        <canvas ref="canvas" />
    </div>
</template>
```
Run the test again: 3 pass.

- [ ] **Step 3: Verify and commit**

`bun run type-check`, `bun run lint`, `bun run test`, `bun run build` green.
```bash
git add src/components/AppChart.vue src/components/AppChart.test.ts
```
```bash
git commit -m "feat: add AppChart wrapper over chart.js"
```

---

### Task 13: `QuillEditor` wrapper over quill

**Files:**
- Create: `src/components/QuillEditor.vue`, `src/components/quill-toolbar.ts`, `src/components/QuillEditor.test.ts`

**Interfaces:**
- Produces: `QuillEditor` with `v-model` (HTML string), props `readonly`, `placeholder`, `toolbar`, `editorStyle`, `class`; emits `update:modelValue` and `text-change` (`{ htmlValue, textValue }`). `DEFAULT_QUILL_TOOLBAR` from `@/components/quill-toolbar`. Consumers must pass the emitted HTML through `sanitizeHtml()` before `v-html`, as the CLAUDE.md rule requires.

- [ ] **Step 1: Write the failing test**

`src/components/QuillEditor.test.ts`:
```ts
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import QuillEditor from './QuillEditor.vue';

const { MockQuill } = vi.hoisted(() => {
    class MockQuill {
        static instances: MockQuill[] = [];
        root = document.createElement('div');
        handlers = new Map<string, () => void>();
        clipboard = { convert: vi.fn((input: { html: string }) => ({ ops: [{ insert: input.html }] })) };
        setContents = vi.fn();
        getText = vi.fn(() => 'plain text');
        enable = vi.fn();
        on = vi.fn((event: string, handler: () => void) => {
            this.handlers.set(event, handler);
        });
        off = vi.fn((event: string) => {
            this.handlers.delete(event);
        });
        constructor(
            public host: HTMLElement,
            public options: Record<string, unknown>
        ) {
            MockQuill.instances.push(this);
        }
    }
    return { MockQuill };
});

vi.mock('quill', () => ({ default: MockQuill }));

beforeEach(() => {
    MockQuill.instances.length = 0;
});

describe('QuillEditor', () => {
    it('creates a snow-themed Quill on its host element', () => {
        mount(QuillEditor, { props: { placeholder: 'Write' } });
        const instance = MockQuill.instances[0]!;
        expect(instance.host.tagName).toBe('DIV');
        expect(instance.options.theme).toBe('snow');
        expect(instance.options.readOnly).toBe(false);
        expect(instance.options.placeholder).toBe('Write');
    });

    it('loads the initial value through the clipboard converter, silently', () => {
        mount(QuillEditor, { props: { modelValue: '<p>Hi</p>' } });
        const instance = MockQuill.instances[0]!;
        expect(instance.clipboard.convert).toHaveBeenCalledWith({ html: '<p>Hi</p>' });
        expect(instance.setContents).toHaveBeenCalledWith({ ops: [{ insert: '<p>Hi</p>' }] }, 'silent');
    });

    it('emits the editor HTML on every text change', () => {
        const wrapper = mount(QuillEditor);
        const instance = MockQuill.instances[0]!;
        instance.root.innerHTML = '<p>Changed</p>';
        instance.handlers.get('text-change')!();
        expect(wrapper.emitted('update:modelValue')![0]).toEqual(['<p>Changed</p>']);
        expect(wrapper.emitted('text-change')![0]).toEqual([{ htmlValue: '<p>Changed</p>', textValue: 'plain text' }]);
    });

    it('applies external model changes and readonly toggles', async () => {
        const wrapper = mount(QuillEditor, { props: { modelValue: '' } });
        const instance = MockQuill.instances[0]!;
        await wrapper.setProps({ modelValue: '<p>External</p>' });
        expect(instance.setContents).toHaveBeenLastCalledWith({ ops: [{ insert: '<p>External</p>' }] }, 'silent');
        await wrapper.setProps({ readonly: true });
        expect(instance.enable).toHaveBeenCalledWith(false);
    });

    it('removes its listener on unmount', () => {
        const wrapper = mount(QuillEditor);
        const instance = MockQuill.instances[0]!;
        wrapper.unmount();
        expect(instance.off).toHaveBeenCalledWith('text-change', expect.any(Function));
    });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

Run: `bun run test src/components/QuillEditor.test.ts` and expect an unresolved import.

Create `src/components/quill-toolbar.ts`:
```ts
// Toolbar layout for QuillEditor. Lives outside the SFC because defineProps defaults may only
// reference imports, never locals of the same <script setup>.
export const DEFAULT_QUILL_TOOLBAR: unknown[] = [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link', 'image', 'code-block'],
    ['clean']
];
```

Create `src/components/QuillEditor.vue`:
```vue
<script setup lang="ts">
    import Quill from 'quill';
    import 'quill/dist/quill.snow.css';
    import { onBeforeUnmount, onMounted, ref, watch, type HTMLAttributes } from 'vue';
    import { DEFAULT_QUILL_TOOLBAR } from './quill-toolbar';

    const props = withDefaults(
        defineProps<{
            modelValue?: string;
            readonly?: boolean;
            placeholder?: string;
            toolbar?: unknown[];
            editorStyle?: string;
            class?: HTMLAttributes['class'];
        }>(),
        { modelValue: '', readonly: false, placeholder: '', toolbar: () => DEFAULT_QUILL_TOOLBAR, editorStyle: 'height: 320px', class: undefined }
    );

    const emit = defineEmits<{
        'update:modelValue': [html: string];
        'text-change': [payload: { htmlValue: string; textValue: string }];
    }>();

    const host = ref<HTMLDivElement | null>(null);
    let quill: Quill | null = null;

    function currentHtml(): string {
        return quill?.root.innerHTML ?? '';
    }

    function setHtml(html: string): void {
        if (!quill) return;
        quill.setContents(quill.clipboard.convert({ html }), 'silent');
    }

    function onTextChange(): void {
        if (!quill) return;
        const htmlValue = currentHtml();
        emit('update:modelValue', htmlValue);
        emit('text-change', { htmlValue, textValue: quill.getText() });
    }

    onMounted(() => {
        if (!host.value) return;
        quill = new Quill(host.value, {
            theme: 'snow',
            readOnly: props.readonly,
            placeholder: props.placeholder,
            modules: { toolbar: props.toolbar }
        });
        if (props.modelValue) setHtml(props.modelValue);
        quill.on('text-change', onTextChange);
    });

    watch(
        () => props.modelValue,
        (value) => {
            if (quill && value !== currentHtml()) setHtml(value);
        }
    );

    watch(
        () => props.readonly,
        (readonly) => quill?.enable(!readonly)
    );

    onBeforeUnmount(() => {
        quill?.off('text-change', onTextChange);
        quill = null;
    });
</script>

<template>
    <div :class="props.class" data-slot="quill-editor">
        <div ref="host" :style="props.editorStyle" />
    </div>
</template>
```
Run the test again: 5 pass.

- [ ] **Step 3: Verify and commit**

`bun run type-check`, `bun run lint`, `bun run test`, `bun run build` green.
```bash
git add src/components/QuillEditor.vue src/components/quill-toolbar.ts src/components/QuillEditor.test.ts
```
```bash
git commit -m "feat: add QuillEditor wrapper with v-model over quill"
```

---

### Task 14: `DataTable` wrapper on TanStack Table 9

**Files:**
- Create: `src/components/data-table/features.ts`, `src/components/data-table/DataTable.vue`, `src/components/data-table/index.ts`, `src/components/data-table/DataTable.test.ts`
- Modify: `package.json`, `bun.lock`

**Interfaces:**
- Consumes: `Button`, `Checkbox`, `Select*`, `Table*`, `TableEmpty` (Task 2), `cn` (Task 1).
- Produces from `@/components/data-table`: `DataTable` (generic component), `createColumns<TData>()` (a `createColumnHelper` bound to the shared feature set), `type DataTableColumn<TData>`, `features`, `type DataTableFeatures`. `DataTable` props: `columns`, `data`, `rowKey`, `paginator` (default false), `pageSize` (10), `pageSizeOptions` ([5, 10, 25]), `reportTemplate` (`'Showing {first} to {last} of {totalRecords} entries'`), `selectable` (false), `subRowsKey`, `class`; models `v-model:selection` (`TData[]`) and `v-model:globalFilter` (`string`); emits `row-click`; slots `header`, `empty`; exposes `table`, `visibleRows()`, `selectedRows()`. Column defs opt out of sorting with `enableSorting: false`. Per-column filters, a frozen first column and a slot-based expansion row are added in Plan 3 when TableDoc is ported.

- [ ] **Step 1: Install the table engine**

Run: `bun add @tanstack/vue-table`
Expected: `installed @tanstack/vue-table@9.2.4` (v9 is required; the wrapper uses `useTable` and `tableFeatures`, which v8 does not have).

- [ ] **Step 2: Write the feature set and the index**

`src/components/data-table/features.ts`:
```ts
import {
    columnFilteringFeature,
    columnVisibilityFeature,
    createExpandedRowModel,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    filterFn_includesString,
    globalFilteringFeature,
    rowExpandingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    sortFn_basic,
    sortFn_text,
    tableFeatures
} from '@tanstack/vue-table';

// One feature set for every table in the template. TanStack v9 only ships the code for the
// features listed here, so adding a capability means adding it in this one place.
export const features = tableFeatures({
    columnFilteringFeature,
    columnVisibilityFeature,
    globalFilteringFeature,
    rowExpandingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    expandedRowModel: createExpandedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
    filterFns: { includesString: filterFn_includesString },
    sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text }
});

export type DataTableFeatures = typeof features;
```

`src/components/data-table/index.ts`:
```ts
import { createColumnHelper, type ColumnDef, type RowData } from '@tanstack/vue-table';
import type { DataTableFeatures } from './features';

export { default as DataTable } from './DataTable.vue';
export { features, type DataTableFeatures } from './features';

export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;

// Consumers build columns with this helper so they never import the feature set themselves.
export function createColumns<TData extends RowData>() {
    return createColumnHelper<DataTableFeatures, TData>();
}
```

- [ ] **Step 3: Write the failing test**

`src/components/data-table/DataTable.test.ts`:
```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { createColumns, DataTable } from './index';

interface Product extends Record<string, unknown> {
    id: string;
    name: string;
    price: number;
    children?: Product[];
}

const helper = createColumns<Product>();
const columns = helper.columns([helper.accessor('name', { header: 'Name' }), helper.accessor('price', { header: 'Price', cell: (ctx) => `$${ctx.getValue()}` })]);

const products: Product[] = [
    { id: '1', name: 'banana', price: 3, children: [{ id: '1a', name: 'banana child', price: 1 }] },
    { id: '2', name: 'apple', price: 5 },
    { id: '3', name: 'cherry', price: 2 },
    { id: '4', name: 'date', price: 9 },
    { id: '5', name: 'elder', price: 4 }
];

type Exposed = { visibleRows: () => Product[]; selectedRows: () => Product[] };

function make(extra: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
    return mount(DataTable<Product>, { props: { columns, data: products, rowKey: 'id', paginator: true, pageSize: 2, ...extra }, slots });
}

function report(wrapper: ReturnType<typeof make>): string {
    return wrapper.get('[data-testid=data-table-report]').text();
}

describe('DataTable', () => {
    it('paginates and reports the visible range', async () => {
        const wrapper = make();
        expect(wrapper.findAll('tbody tr')).toHaveLength(2);
        expect(report(wrapper)).toBe('Showing 1 to 2 of 5 entries');
        await wrapper.get('[aria-label="Next page"]').trigger('click');
        expect(report(wrapper)).toBe('Showing 3 to 4 of 5 entries');
        await wrapper.get('[aria-label="Last page"]').trigger('click');
        expect(report(wrapper)).toBe('Showing 5 to 5 of 5 entries');
        expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    });

    it('sorts when a sortable header is clicked', async () => {
        const wrapper = make();
        const nameHeader = wrapper.findAll('thead th button')[0]!;
        await nameHeader.trigger('click');
        expect(wrapper.findAll('tbody tr')[0]!.text()).toContain('apple');
        await nameHeader.trigger('click');
        expect(wrapper.findAll('tbody tr')[0]!.text()).toContain('elder');
    });

    it('applies the global filter model', async () => {
        const wrapper = make({ globalFilter: 'an' });
        await nextTick();
        expect(wrapper.findAll('tbody tr')).toHaveLength(1);
        expect(wrapper.findAll('tbody tr')[0]!.text()).toContain('banana');
        expect(report(wrapper)).toBe('Showing 1 to 1 of 1 entries');
        expect((wrapper.vm as unknown as Exposed).visibleRows()).toHaveLength(1);
    });

    it('selects rows through the checkbox column and clears from the model', async () => {
        const wrapper = make({ selectable: true });
        const boxes = wrapper.findAll('[data-slot=checkbox]');
        expect(boxes).toHaveLength(3);
        await boxes[1]!.trigger('click');
        const emitted = wrapper.emitted('update:selection');
        expect(emitted).toBeTruthy();
        const last = emitted![emitted!.length - 1]![0] as Product[];
        expect(last.map((p) => p.name)).toEqual(['banana']);
        expect(wrapper.findAll('tbody tr[data-state=selected]')).toHaveLength(1);
        await wrapper.setProps({ selection: [] });
        await nextTick();
        expect(wrapper.findAll('tbody tr[data-state=selected]')).toHaveLength(0);
        expect((wrapper.vm as unknown as Exposed).selectedRows()).toHaveLength(0);
    });

    it('selects every row on the page from the header checkbox', async () => {
        const wrapper = make({ selectable: true });
        await wrapper.findAll('[data-slot=checkbox]')[0]!.trigger('click');
        expect((wrapper.vm as unknown as Exposed).selectedRows().map((p) => p.name)).toEqual(['banana', 'apple']);
    });

    it('expands sub rows from the row toggle', async () => {
        const wrapper = make({ subRowsKey: 'children' });
        await wrapper.get('[aria-label="Expand row"]').trigger('click');
        const rows = wrapper.findAll('tbody tr');
        expect(rows[1]!.attributes('data-depth')).toBe('1');
        expect(rows[1]!.text()).toContain('banana child');
    });

    it('renders custom cells and the empty slot', () => {
        expect(make().findAll('tbody tr')[0]!.text()).toContain('$3');
        const empty = make({ data: [] }, { empty: 'Nothing here' });
        expect(empty.text()).toContain('Nothing here');
        expect(report(empty)).toBe('Showing 0 to 0 of 0 entries');
    });

    it('emits row-click with the original record', async () => {
        const wrapper = make();
        await wrapper.findAll('tbody tr')[0]!.trigger('click');
        expect((wrapper.emitted('row-click')![0]![0] as Product).name).toBe('banana');
    });
});
```

Run: `bun run test src/components/data-table` and expect a failure resolving `./DataTable.vue`.

- [ ] **Step 4: Implement the component**

`src/components/data-table/DataTable.vue`:
```vue
<script setup lang="ts" generic="TData extends Record<string, unknown>">
    import type { ColumnDef, ExpandedState, PaginationState, RowSelectionState, SortingState, Updater } from '@tanstack/vue-table';
    import { FlexRender, useTable } from '@tanstack/vue-table';
    import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/vue';
    import { computed, h, ref, watch, type HTMLAttributes } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { cn } from '@/lib/utils';
    import { features, type DataTableFeatures } from './features';

    const props = withDefaults(
        defineProps<{
            columns: ColumnDef<DataTableFeatures, TData>[];
            data: TData[];
            rowKey: keyof TData & string;
            paginator?: boolean;
            pageSize?: number;
            pageSizeOptions?: number[];
            reportTemplate?: string;
            selectable?: boolean;
            subRowsKey?: keyof TData & string;
            class?: HTMLAttributes['class'];
        }>(),
        {
            paginator: false,
            pageSize: 10,
            pageSizeOptions: () => [5, 10, 25],
            reportTemplate: 'Showing {first} to {last} of {totalRecords} entries',
            selectable: false,
            subRowsKey: undefined,
            class: undefined
        }
    );

    const selection = defineModel<TData[]>('selection', { default: () => [] });
    const globalFilter = defineModel<string>('globalFilter', { default: '' });
    const emit = defineEmits<{ 'row-click': [row: TData] }>();

    const sorting = ref<SortingState>([]);
    const rowSelection = ref<RowSelectionState>({});
    const expanded = ref<ExpandedState>({});
    const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: props.pageSize });
    const ALL_ROWS: PaginationState = { pageIndex: 0, pageSize: Number.MAX_SAFE_INTEGER };

    function apply<T>(target: { value: T }, updater: Updater<T>): void {
        target.value = typeof updater === 'function' ? (updater as (old: T) => T)(target.value) : updater;
    }

    const selectionColumn: ColumnDef<DataTableFeatures, TData> = {
        id: '__select',
        enableSorting: false,
        header: ({ table }) =>
            h(Checkbox, {
                'modelValue': table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false,
                'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(value === true),
                'aria-label': 'Select all rows'
            }),
        cell: ({ row }) =>
            h(Checkbox, {
                'modelValue': row.getIsSelected(),
                'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(value === true),
                'aria-label': 'Select row'
            })
    };

    const allColumns = computed(() => (props.selectable ? [selectionColumn, ...props.columns] : props.columns));

    const table = useTable({
        features,
        get data() {
            return props.data;
        },
        get columns() {
            return allColumns.value;
        },
        get enableRowSelection() {
            return props.selectable;
        },
        getRowId: (row: TData) => String(row[props.rowKey]),
        getSubRows: (row: TData) => (props.subRowsKey ? (row[props.subRowsKey] as TData[] | undefined) : undefined),
        globalFilterFn: 'includesString',
        state: {
            get sorting() {
                return sorting.value;
            },
            get globalFilter() {
                return globalFilter.value;
            },
            get rowSelection() {
                return rowSelection.value;
            },
            get expanded() {
                return expanded.value;
            },
            get pagination() {
                return props.paginator ? pagination.value : ALL_ROWS;
            }
        },
        onSortingChange: (updater) => apply(sorting, updater),
        onGlobalFilterChange: (updater) => apply(globalFilter, updater),
        onRowSelectionChange: (updater) => apply(rowSelection, updater),
        onExpandedChange: (updater) => apply(expanded, updater),
        onPaginationChange: (updater) => apply(pagination, updater)
    });

    watch(rowSelection, () => {
        selection.value = table.getSelectedRowModel().rows.map((row) => row.original);
    });
    watch(selection, (value) => {
        if ((!value || value.length === 0) && Object.keys(rowSelection.value).length > 0) rowSelection.value = {};
    });
    watch(
        () => props.pageSize,
        (size) => table.setPageSize(size)
    );

    const totalRows = computed(() => table.getPrePaginatedRowModel().rows.length);
    const report = computed(() => {
        const { pageIndex, pageSize } = pagination.value;
        const total = totalRows.value;
        const first = total === 0 ? 0 : pageIndex * pageSize + 1;
        const last = Math.min(total, (pageIndex + 1) * pageSize);
        return props.reportTemplate.replace('{first}', String(first)).replace('{last}', String(last)).replace('{totalRecords}', String(total));
    });
    const pageLinks = computed(() => {
        const count = table.getPageCount();
        const start = Math.max(0, Math.min(pagination.value.pageIndex - 2, count - 5));
        const end = Math.min(count, start + 5);
        return Array.from({ length: end - start }, (_, index) => start + index);
    });

    function onPageSize(value: unknown): void {
        const size = Number(value);
        if (Number.isFinite(size) && size > 0) table.setPageSize(size);
    }

    defineExpose({
        table,
        visibleRows: (): TData[] => table.getPrePaginatedRowModel().rows.map((row) => row.original),
        selectedRows: (): TData[] => table.getSelectedRowModel().rows.map((row) => row.original)
    });
</script>

<template>
    <div :class="cn('flex flex-col', props.class)" data-slot="data-table">
        <div v-if="$slots.header" class="mb-4"><slot name="header" /></div>
        <div class="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <TableHead v-for="header in headerGroup.headers" :key="header.id">
                            <template v-if="!header.isPlaceholder">
                                <Button v-if="header.column.getCanSort()" variant="ghost" size="sm" class="-ml-2" @click="header.column.toggleSorting(header.column.getIsSorted() === 'asc')">
                                    <FlexRender :header="header" />
                                    <ArrowUp v-if="header.column.getIsSorted() === 'asc'" />
                                    <ArrowDown v-else-if="header.column.getIsSorted() === 'desc'" />
                                    <ArrowUpDown v-else class="opacity-50" />
                                </Button>
                                <FlexRender v-else :header="header" />
                            </template>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableEmpty v-if="table.getRowModel().rows.length === 0" :colspan="allColumns.length">
                        <slot name="empty">No records found.</slot>
                    </TableEmpty>
                    <TableRow v-for="row in table.getRowModel().rows" :key="row.id" :data-state="row.getIsSelected() ? 'selected' : undefined" :data-depth="row.depth" @click="emit('row-click', row.original)">
                        <TableCell v-for="(cell, index) in row.getVisibleCells()" :key="cell.id" :style="index === 0 && row.depth > 0 ? { paddingLeft: `${row.depth * 1.5 + 0.5}rem` } : undefined">
                            <span v-if="index === 0 && row.getCanExpand()" class="inline-flex items-center gap-1">
                                <Button variant="ghost" size="icon-xs" :aria-label="row.getIsExpanded() ? 'Collapse row' : 'Expand row'" @click.stop="row.toggleExpanded()">
                                    <ChevronRight :class="cn('transition-transform', row.getIsExpanded() && 'rotate-90')" />
                                </Button>
                                <FlexRender :cell="cell" />
                            </span>
                            <FlexRender v-else :cell="cell" />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
        <div v-if="props.paginator" class="flex flex-wrap items-center justify-between gap-2 pt-4" data-slot="data-table-paginator">
            <span class="text-sm text-muted-foreground" data-testid="data-table-report">{{ report }}</span>
            <div class="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="First page" :disabled="!table.getCanPreviousPage()" @click="table.firstPage()"><ChevronsLeft /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Previous page" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()"><ChevronLeft /></Button>
                <Button v-for="page in pageLinks" :key="page" :variant="page === pagination.pageIndex ? 'default' : 'ghost'" size="icon-sm" :aria-label="`Page ${page + 1}`" @click="table.setPageIndex(page)">{{ page + 1 }}</Button>
                <Button variant="ghost" size="icon-sm" aria-label="Next page" :disabled="!table.getCanNextPage()" @click="table.nextPage()"><ChevronRight /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Last page" :disabled="!table.getCanNextPage()" @click="table.lastPage()"><ChevronsRight /></Button>
                <Select :model-value="String(pagination.pageSize)" @update:model-value="onPageSize">
                    <SelectTrigger class="w-20" aria-label="Rows per page"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="size in props.pageSizeOptions" :key="size" :value="String(size)">{{ size }}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    </div>
</template>
```

- [ ] **Step 5: Run to see it pass**

Run: `bun run test src/components/data-table`
Expected: 8 tests pass.

- [ ] **Step 6: Verify and commit**

`bun run type-check`, `bun run lint`, `bun run test`, `bun run build` green.
```bash
git add package.json bun.lock src/components/data-table
```
```bash
git commit -m "feat: add DataTable wrapper on TanStack Table 9 with selection, paging and sub rows"
```

---

### Task 15: Phase gate for Plan 1

**Files:**
- None modified. This task proves the branch state before Plan 2 is written.

- [ ] **Step 1: Full verification**

Run each and record the output in the task report:
```bash
bun run type-check
```
```bash
bun run lint
```
```bash
bun run test
```
```bash
bun run build
```
Expected: exit 0, 0 lint errors, `Test Files 12 passed (12)` with 62 tests, build succeeds.

- [ ] **Step 2: Browser pass**

`bun run dev`, then check every item, in light and dark mode:

1. `/` dashboard: cards, charts and tables render; nothing unstyled.
2. Palette panel: pick `noir`, `blue`, then `emerald`; PrimeVue buttons, the sidebar highlight and the topbar logo follow each pick.
3. Surface `zinc`, `ocean`, then reset by reloading with `localStorage.removeItem('layoutConfig')` in the console: default slate returns.
4. Presets Aura, Lara, Nora: radius and input height change; Nora has no hover transitions.
5. Dark toggle: `<html class="dark">`, PrimeVue dark theme, cards zinc 900; persists across reload.
6. `/pages/crud`: PrimeVue toasts still appear on Save; the shadcn toaster is not triggered yet (no call sites ported).
7. `/uikit/input`, `/uikit/table`, `/blocks/free`: unchanged PrimeVue rendering, no console errors.

Stop the dev server. Record what was seen; any deviation is a bug to fix before Plan 2, not a note.

- [ ] **Step 3: Report**

No commit. Reply with the verification output and the browser observations. Plan 2 (gap components, phase 4) is written from this state.

---

## Self-review against the spec

- Phase 1 (bootstrap, full component set, Vitest widened, setup file): Tasks 1 to 3.
- Phase 2 (theme.ts with tests, palettes.ts, presets.ts from installed PrimeVue values, composables/theme.ts, useLayout changes, `.dark` rename, SCSS re-point, configurator with preset control): Tasks 5 to 9. `layoutConfig.ts` implements the spec's "loadSavedTheme gains a try/catch and validates each field". The transitional bridge is an addition the spec's phase ordering requires (PrimeVue pages must keep following the picker until phase 6) and is marked for deletion.
- Phase 3 (csv.ts, DataTable, AppChart, QuillEditor, useToast and useConfirm shims, Toaster in App.vue, all test-first): Tasks 4, 10 to 14.
- Deferred to later plans, by design: `ConfirmPopover` (phase 4), per-column filters, frozen column and slot expansion on `DataTable` (with TableDoc, phase 6), the `v-styleclass` to `Popover` change in the topbar (phase 5), removal of `tailwindcss-primeui`, the PrimeVue plugin, the bridge and `components.d.ts` (phase 6).
- Names used across tasks: `applyTheme`, `themeVars`, `ThemeInput`, `syncPrimeVueTheme`, `layoutConfig`, `parseLayoutConfig`, `LayoutConfig`, `MenuMode`, `PresetName`, `presetNames`, `primaryPalettes`, `surfacePalettes`, `PaletteOption`, `showToast`, `useToast`, `requireConfirm`, `acceptConfirm`, `rejectConfirm`, `closeConfirm`, `confirmState`, `useConfirm`, `createColumns`, `DataTableColumn`, `features`, `DataTableFeatures`, `DEFAULT_QUILL_TOOLBAR`, `toCsv`, `downloadCsv`, `CsvColumn` are spelled identically in every task that references them.
