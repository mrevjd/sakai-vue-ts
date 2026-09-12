# Migrate the Sakai template from PrimeVue to shadcn-vue

Date: 2026-09-12
Status: draft for review
Branch: `worktree-shadcn-vue-migration`

## 1. Goal

Replace PrimeVue, its theme runtime and its utility plugin with shadcn-vue, so the
template keeps receiving upstream updates after PrimeTek's move to the commercial PrimeUI
licence. PrimeVue 4 stays MIT, so nothing breaks today; the risk is a template that stops
tracking its UI library. The result must remain a generic template that other projects copy,
with the tooling (type-check, lint, Vitest, review gate) intact.

## 2. Verified starting point

Everything below was checked by grep in this checkout on 2026-09-12.

- Tailwind 4 is already installed through `@tailwindcss/vite`, which is what shadcn-vue
  expects. The custom breakpoints and `text-xxl` token in `src/assets/tailwind.css` stay.
- The layout SCSS reads PrimeVue tokens only through `src/assets/layout/variables/_common.scss`,
  `_light.scss` and `_dark.scss` (24 lines). The rest of the shell is plain SCSS.
- The pages worth keeping (Dashboard and its 5 widgets, Crud, the 3 auth pages, Landing and its
  6 widgets, NotFound, Empty, Documentation, the layout) use 21 distinct PrimeVue components.
  All have a shadcn-vue equivalent except `Rating`, used once, readonly, in Crud.
- The 15 `src/views/uikit/*` pages, `src/views/utilities/Blocks.vue` and
  `src/components/BlockViewer.vue` are PrimeVue and PrimeBlocks showcases. They hold most of
  the `tailwindcss-primeui` utility usages and every component with no shadcn equivalent.
- `chart.js` and `quill` are direct dependencies already. `primeflex` is a dependency but is
  imported nowhere. `pinia` is a dependency with no stores and stays as is.
- `v-styleclass` is used 4 times (topbar palette popover, topbar mobile menu, floating
  configurator, landing topbar mobile menu). `v-tooltip` is used twice, both in OverlayDoc,
  which is deleted.
- `layoutState.configSidebarVisible` and `toggleConfigSidebar` are unused outside the composable.
  `_preloading.scss` styles nothing in the tree. `flags.css` is used only by deleted pages.
- Dark mode is the `.app-dark` class on `<html>`, toggled inside `document.startViewTransition`.
- ESLint already disables `vue/multi-word-component-names`, so single-word shadcn component
  files lint clean. `tsconfig.json` already maps `@/*` to `src/*`.
- Vitest is scoped to `src/utils/**/*.{test,spec}.ts` and runs 7 passing tests.

## 3. Decisions taken with the user

1. Keep the Sakai SCSS shell for the first passes so the component swap can be checked against
   the current look, then swap the shell to shadcn-vue's `Sidebar` as the final phase.
   The user's reply "pop the route change in too" is read as including that final phase; if it
   meant only router edits, drop phase 7 below and nothing else changes.
2. Delete the PrimeVue showcase pages and replace them with a small set of shadcn-vue showcase
   pages.
3. Keep the primary and surface colour picker, rebuilt on CSS variables and shadcn components.

## 4. Out of scope

- Any change to `src/utils/sanitize.ts` or its tests.
- Server-side rendering, Nuxt, or any deployment change.
- Adding form validation libraries (vee-validate, zod). The shadcn `Form` component is not
  installed; plain inputs with the existing `submitted` pattern are enough for a template.
- Component-level tests. Vitest stays scoped to `src/utils`.
- Reproducing the Aura, Lara and Nora presets. shadcn has a single style; the preset control is
  removed.

## 5. Architecture

### 5.1 Theme tokens

shadcn-vue defines its palette as CSS variables on `:root` and `.dark` in oklch, mapped to
Tailwind utilities by an `@theme inline` block, with `@custom-variant dark (&:is(.dark *))`
(shadcn-vue theming docs). The token set is: `--radius`, `--background`, `--foreground`,
`--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`,
`--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`,
`--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`,
`--input`, `--ring`, `--chart-1` to `--chart-5`, and the `--sidebar*` group. The CLI's `init`
writes this block into `src/assets/tailwind.css`; the existing breakpoint and `text-xxl`
entries are merged back in, the `.app-dark` custom variant and the `tailwindcss-primeui` plugin
line are removed, and the Tailwind 3 border-colour compatibility layer is dropped in favour of
the base layer the CLI writes.

### 5.2 Runtime palettes (the colour picker)

The 17 primary and 8 surface palettes now literal in `AppConfigurator.vue` move to
`src/layout/palettes.ts` as data. A pure module `src/utils/theme.ts` maps a palette and a mode
to token values:

- `primaryVars(palette, mode, surface)` returns `--primary`, `--primary-foreground`, `--ring`,
  `--sidebar-primary`, `--sidebar-primary-foreground` and `--chart-1`. Light uses shade 500 with
  white foreground; dark uses shade 400 with the surface 900 shade as foreground, matching the
  mapping the configurator applies today. The `noir` entry uses the surface scale (950 on light,
  50 on dark) exactly as the current `getPresetExt()` special case does.
- `surfaceVars(palette, mode)` returns `--background`, `--foreground`, `--card`,
  `--card-foreground`, `--popover`, `--popover-foreground`, `--secondary`,
  `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`,
  `--accent-foreground`, `--border`, `--input`, `--sidebar`, `--sidebar-foreground`,
  `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`. Light: background 100,
  card and popover 0, foreground 700, muted foreground 500, border 200. Dark: background 950,
  card and popover 900, foreground 0, muted foreground 400, border 700. This keeps Sakai's grey
  ground with white cards rather than shadcn's all-white default.
- A `null` surface resolves to `slate` in light mode and `zinc` in dark mode, which is what the
  configurator highlights today when no surface is chosen.

`src/layout/composables/theme.ts` owns the DOM side: `applyTheme(config)` writes the merged
record onto `document.documentElement.style` with `setProperty`. A module-level watcher in
`layout.ts` on `primary`, `surface` and `darkTheme` calls it with `flush: 'sync'`, so the
colours are in place inside the view-transition callback. Static `:root` and `.dark` values from
the CLI remain as the fallback before the watcher runs.

Whether the installed Sidebar component reads `--sidebar` (theming docs) or
`--sidebar-background` (sidebar docs) is checked from the generated component in phase 7 and the
mapping follows the code, not the docs.

### 5.3 Dark mode

The class becomes `.dark`. `useLayout()` keeps `toggleDarkMode`, `isDarkTheme` and the
view-transition wrapper, and the SCSS dark selector is renamed in phase 2 (and deleted in phase
7). Every shadcn registry component assumes `.dark`, so no alternative is considered.

### 5.4 Layout state

`layoutConfig` stays a reactive object persisted to the `layoutConfig` localStorage key. Fields
after the migration: `primary`, `surface`, `darkTheme`, `menuMode`, `sidebarOpen`. `preset` is
removed; unknown keys in stored JSON are ignored. `loadSavedTheme()` gains a try/catch around
`JSON.parse` and validates each field's type, falling back to the default, because a corrupt
value currently throws at module load and blanks the app. `layoutState`, `isDesktop`,
`toggleMenu`, `hideMobileMenu`, `changeMenuMode`, `toggleConfigSidebar` and `hasOpenOverlay`
are removed in phase 7 when the shadcn `SidebarProvider` takes over open state. Until then they
are untouched.

### 5.5 Component layer

Components are added with `bunx shadcn-vue@latest add <name>` into `src/components/ui/<name>/`
with `components.json` set to the `new-york` style, base colour `zinc`, CSS variables on, CSS
path `src/assets/tailwind.css`, aliases `@/components/ui` and `@/lib/utils`. Files under
`src/components/ui` are vendored: formatted once with the repo's Prettier settings, then edited
only to add variants (for example `success` and `warning` on `Badge` to replace `Tag`
severities). Imports are explicit (`import { Button } from '@/components/ui/button'`);
`unplugin-vue-components` and `PrimeVueResolver` are removed, and `components.d.ts` is deleted if
present.

Initial component set: button, badge, input, textarea, label, field, input-group, checkbox,
radio-group, select, combobox, number-field, switch, slider, calendar, date-picker, dialog,
alert-dialog, sheet, popover, dropdown-menu, tooltip, table, tabs, accordion, card, separator,
skeleton, progress, spinner, alert, avatar, scroll-area, toggle-group, sonner, and, in phase 7,
sidebar. Anything the showcase pages turn out not to need is not added.

### 5.6 Local wrappers (in `src/components/`)

- `data-table/DataTable.vue`: generic table on `@tanstack/vue-table` and the shadcn `Table`
  primitives, following the shadcn-vue data-table pattern. Props: `columns`, `data`, `rowKey`,
  `pageSize`, `pageSizeOptions`, `selectable`, `globalFilter` (v-model). Emits
  `update:selection`. Exposes the table instance and a `visibleRows()` helper for export. Header
  click sorts. Pagination is first, previous, page links, next, last, a "Showing x to y of z"
  report and a rows-per-page select, matching what Crud shows today. Used by Crud and
  RecentSalesWidget.
- `AppChart.vue`: props `type`, `data`, `options`. Registers chart.js `registerables`, creates
  the chart on mount, updates on deep change, destroys on unmount, guards a null canvas.
- `QuillEditor.vue`: `v-model` of HTML on a Quill `snow` instance, `readonly` and `placeholder`
  props, listeners removed on unmount. Consumers must pass output through `sanitizeHtml()`
  before any `v-html`, exactly as the CLAUDE.md rule says today; the rule's path changes.
- `StarRating.vue`: readonly star row on lucide `Star`, props `value` and `max`.
- Toasts: the shadcn `Sonner` `<Toaster />` mounts once in `App.vue`; callers use
  `toast.success(...)` from `vue-sonner`. `ToastService` and `ConfirmationService` leave
  `main.ts`. Confirmations become `AlertDialog`.
- `src/utils/csv.ts`: `toCsv(rows, columns)` with RFC 4180 quoting. String cells starting with
  `=`, `+`, `-`, `@`, tab or carriage return get a leading apostrophe so a spreadsheet does not
  evaluate them; numbers pass through untouched. `downloadCsv(filename, csv)` triggers the
  download. Replaces `DataTable.exportCSV()`.

### 5.7 Layout shell, phase A (phase 2, Sakai SCSS kept)

The three variable files are re-pointed: `--primary-color` to `--primary`, `--text-color` to
`--foreground`, `--text-color-secondary` to `--muted-foreground`, `--surface-border` to
`--border`, `--surface-card` to `--card`, `--surface-hover` to `--accent`, `--surface-overlay`
to `--popover`, `--surface-ground` to `--background`, `--content-border-radius` to `--radius`,
the focus-ring group to `--ring` with literal width and offset, `--maskbg` to a literal
`rgba(0,0,0,0.4)`, transition durations to literal `0.2s`, and `--code-*` to literal zinc
values. The `--p-editor-content-background` line and the `.p-toast` rule go. `.app-dark`
becomes `.dark`. The `layout-mask` animation uses `tw-animate-css` classes.

In the topbar and floating configurator, `v-styleclass` popovers become shadcn `Popover`; the
two mobile menus (topbar, landing topbar) become a local `ref` toggle with `v-show` since they
only show or hide a block; the profile `Menu` becomes `DropdownMenu`. `AppMenuItem.vue` renders
`item.icon` with `<component :is>`; the menu model holds lucide components instead of
`pi pi-*` strings.

### 5.8 Layout shell, phase B (phase 7, shadcn Sidebar)

`AppLayout.vue` wraps everything in `SidebarProvider` bound to `layoutConfig.sidebarOpen`, with
`AppSidebar` and a `SidebarInset` holding the topbar (`SidebarTrigger` plus actions), the
`router-view` and the footer. `AppSidebar.vue` becomes `Sidebar` with `variant="floating"` and
`:collapsible="layoutConfig.menuMode"`. `menuMode` values become `offcanvas` and `icon`, the
two the component supports (sidebar docs). Sakai's `overlay` mode has no shadcn equivalent on
desktop and is dropped; stored `static` and `overlay` values migrate to `offcanvas`. The
configurator labels them "Static" and "Icon rail". Mobile uses the provider's built-in sheet.

`AppMenu.vue` keeps the data model. `AppMenuItem.vue` is rewritten on `SidebarGroup`,
`SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` (as `router-link`, `:is-active` on route
match) and `SidebarMenuSub`, with `Collapsible` for nested groups so the three-level Hierarchy
demo still works. Active state derives from the current route, not from `layoutState`.

`src/assets/layout/`, `src/assets/demo/` and `styles.scss` are deleted. The `html`/`body` font
rules, the `.card` utility, `pre.app-code` and the heading typography move into
`src/assets/tailwind.css` under `@layer base` and `@layer components`, with Lato declared as
`--font-sans` in `@theme`. `sass` and the `css.preprocessorOptions` block in `vite.config.ts`
go with them.

### 5.9 Configurator

`AppConfigurator.vue` becomes Popover content with three groups: primary swatches, surface
swatches and a `ToggleGroup` for menu mode. Swatch buttons keep the current
`outline-primary` selected state. Preset selection is removed. `@primeuix/themes` imports go.

### 5.10 Pages

Kept and ported: Dashboard and widgets, Crud, Login, Access, Error, NotFound, Empty, Landing and
widgets, Documentation, FloatingConfigurator.

- Crud: `Toolbar` becomes a flex row of buttons; `DataTable`/`Column` become the wrapper with
  column defs (selection, code, name, image, price, category, rating via `StarRating`, status
  via `Badge`, actions); the product dialog uses `Dialog`, `Input`, `Textarea`, `Select`,
  `RadioGroup`, `NumberField`; both delete confirmations use `AlertDialog`; `FilterMatchMode`
  from `@primevue/core/api` goes with the global filter prop. Export uses `toCsv`.
- Login: `Input`, a password `Input` with an eye toggle, `Checkbox`, `Button` as `router-link`.
- Dashboard widgets: `RecentSalesWidget` uses the wrapper; `BestSellingWidget` and
  `NotificationsWidget` use `DropdownMenu`; `RevenueStreamWidget` uses `AppChart` and reads
  `--foreground`, `--muted-foreground`, `--border` for chart colours instead of `--p-*`.
- Landing: `Button` and `Separator`; fixed dark sections use Tailwind's built-in zinc scale.
- Utility classes in kept files: `bg-surface-0 dark:bg-surface-900` to `bg-card`,
  `text-surface-900 dark:text-surface-0` to `text-foreground`, `text-muted-color` to
  `text-muted-foreground`, `border-surface` to `border-border`, `bg-highlight` to `bg-accent`,
  `rounded-border` to `rounded-lg`, `text-primary` unchanged. No custom `surface` colour scale is
  added to `@theme`.

Deleted: the 15 uikit views, `Blocks.vue`, `BlockViewer.vue`, their routes and menu entries,
the "Prime Blocks" menu group, `NodeService`, `CustomerService`, `PhotoService` and their
types, `src/types/tailwindcss-primeui.d.ts`. `ProductService` (Crud, RecentSales) and
`CountryService` (combobox demo) stay, with the two-tier shape unchanged. `public/demo` is
removed only if a grep of the kept files shows no reference to it.

Added under `src/views/uikit/` with routes `/uikit/forms`, `/uikit/feedback`,
`/uikit/overlays`, `/uikit/data`:

- `FormsDemo.vue`: Input, Textarea, Select, Combobox (CountryService), Checkbox, RadioGroup,
  Switch, Slider, NumberField, DatePicker, InputGroup, and `QuillEditor` with the
  `sanitizeHtml()` round-trip that `FormLayout.vue` demonstrates today.
- `FeedbackDemo.vue`: Button variants and sizes, Badge, Alert, Sonner toasts, Progress,
  Skeleton, Spinner, Tooltip, Avatar.
- `OverlaysDemo.vue`: Dialog, AlertDialog, Sheet, Popover, DropdownMenu.
- `DataDemo.vue`: the DataTable wrapper with selection, filter and pagination, plain Table,
  Tabs, Accordion, Card, and `AppChart` line, bar and doughnut examples.

`Documentation.vue` is rewritten for the new stack (bun commands, structure, menu model,
layout composable, palettes, adding components, rich-text sanitisation). The Nuxt section is
dropped. `AppFooter.vue` links to this repository instead of primevue.org.

### 5.11 Icons

`lucide-vue-next` replaces `primeicons`. Kept files reference 60 distinct icons (`pi-fw` excluded); each maps
to the nearest lucide name during the port. The menu model stores the component, so a derived
project adds an icon with one import.

### 5.12 Dependencies

Added at runtime: `reka-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`,
`lucide-vue-next`, `@vueuse/core`, `@tanstack/vue-table`, `vue-sonner`,
`@internationalized/date`. Added as dev: `tw-animate-css`. The CLI decides the exact set when
`init` and `add` run; the PR body lists what was actually added, and any package outside this
list is raised before it is kept.

Removed: `primevue`, `@primeuix/themes`, `@primevue/auto-import-resolver`, `primeflex`,
`primeicons`, `tailwindcss-primeui`, `unplugin-vue-components`, and `sass` in phase 7.

Unchanged: `chart.js`, `quill`, `dompurify`, `pinia`, `vue-router`, `tailwindcss`,
`@tailwindcss/vite`, and the whole dev toolchain. `scripts/update-deps.ts` reads installed
packages and needs no change.

## 6. Data flow

`AppConfigurator` writes `layoutConfig.primary` or `.surface`. The module watcher in
`layout.ts` calls `applyTheme`, which asks `theme.ts` for the token record and sets it on
`<html>`. The same watcher persists `layoutConfig`. Tailwind utilities read the tokens through
`@theme inline`, so every shadcn component and every `bg-card`, `text-primary` class updates in
place. Dark toggle: flag flips, `.dark` toggles, watcher re-applies the dark mapping, all inside
one view transition.

## 7. Error handling

- Corrupt or stale `layoutConfig` JSON: caught, defaults used, nothing thrown at module load.
- Unknown palette name in storage: `theme.ts` returns the default palette's values.
- `AppChart` and `QuillEditor` destroy their instances on unmount and tolerate a missing
  element ref.
- `toCsv` with no rows returns the header line only; Export stays enabled as today.
- The shadcn CLI failing on this toolchain (Vite 8, TypeScript 6, Tailwind 4.3 are newer than
  the docs assume) is handled by adding components from the registry JSON by hand; the
  `components.json` and `cn` helper are two small files.

## 8. Testing

Vitest scope stays `src/utils/**/*.{test,spec}.ts`, written test-first:

- `sanitize.test.ts`: unchanged, must stay green.
- `csv.test.ts`: header row; quoting of comma, quote and newline; apostrophe prefix on
  formula-leading strings and none on numbers; null and undefined render empty.
- `theme.test.ts`: light and dark shade selection for primary; `noir` uses the surface scale;
  surface mapping light and dark; `null` surface resolves to slate or zinc by mode; the returned
  key set equals the documented token list so a typo cannot silently drop a token.

Components and layout are verified by `bun run type-check`, `bun run lint`, `bun run build`, and
a browser pass over every route in light and dark mode at desktop and mobile widths.

## 9. Phases

Each phase ends with type-check, lint, test and build green, and is its own commit or short
series. PrimeVue and shadcn coexist in the tree from phase 1 until the end of phase 4.

1. Bootstrap: `init`, merge `tailwind.css`, add the initial component set, format, remove the
   Tailwind 3 border compatibility layer.
2. Theme: `theme.ts` with tests, `palettes.ts`, `composables/theme.ts`, `useLayout` changes,
   `.dark` rename, SCSS token re-point, configurator on shadcn.
3. Wrappers: `csv.ts` with tests, `DataTable`, `AppChart`, `QuillEditor`, `StarRating`,
   `Toaster` in `App.vue`.
4. Port and purge: delete showcase pages, Blocks and unused services first; port layout pieces,
   dashboard, Crud, auth, landing, NotFound, Empty; rewrite utility classes; remove the PrimeVue
   plugin, resolver, type shim and packages. Exit criterion: a search for `primevue` under `src`
   finds nothing and the build passes.
5. Showcase pages: the four new views, routes and menu entries.
6. Icons: `lucide-vue-next` in, `primeicons` out (folded into 4 and 5 where files are touched;
   this phase is the sweep for stragglers).
7. Sidebar swap: add `sidebar`, rewrite the shell, migrate `menuMode`, retire SCSS and `sass`.
8. Docs: CLAUDE.md (auto-import rule removed, layout fields updated, Quill path updated,
   component-add instructions), README, `Documentation.vue`.
9. Verification, then the review gate (`claude-review-suite:code-review` and
   `claude-review-suite:security-review` over the branch diff against main), then push and PR.

## 10. Open points for review

1. Phase 7 (Sidebar swap) is in scope on my reading of "pop the route change in too".
2. Overlay menu mode is dropped in phase 7 because the shadcn Sidebar offers `offcanvas` and
   `icon` only.
3. The dependency list in 5.12 is the request for approval under the ask-before-adding rule.
4. Four showcase pages replace fifteen; the split is forms, feedback, overlays, data.
5. SCSS is retired entirely in phase 7, removing `sass`.
