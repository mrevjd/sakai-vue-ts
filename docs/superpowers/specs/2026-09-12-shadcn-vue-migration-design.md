# Migrate the Sakai template from PrimeVue to shadcn-vue

Date: 2026-09-12
Status: draft for review (revision 2: full 1-for-1 scope)
Branch: `worktree-shadcn-vue-migration`

## 1. Goal

Replace PrimeVue, its theme runtime and its utility plugin with shadcn-vue, one for one: every
page, every component and every feature the template ships today has an equivalent afterwards.
The purpose is to keep receiving upstream updates after PrimeTek's move to the commercial
PrimeUI licence. PrimeVue 4 stays MIT, so nothing breaks today; the risk is a template that
stops tracking its UI library. The result must remain a generic template that other projects
copy, with the tooling (type-check, lint, Vitest, review gate) intact.

## 2. Verified starting point

Everything below was checked by grep in this checkout on 2026-09-12.

- Tailwind 4 is already installed through `@tailwindcss/vite`, which is what shadcn-vue
  expects. The custom breakpoints and `text-xxl` token in `src/assets/tailwind.css` stay.
- The layout SCSS reads PrimeVue tokens only through `src/assets/layout/variables/_common.scss`,
  `_light.scss` and `_dark.scss` (24 lines). The rest of the shell is plain SCSS.
- The application pages (Dashboard and its 5 widgets, Crud, the 3 auth pages, Landing and its 6
  widgets, NotFound, Empty, Documentation, the layout) use 21 distinct PrimeVue components.
- The 15 `src/views/uikit/*` pages, `src/views/utilities/Blocks.vue` and
  `src/components/BlockViewer.vue` use a further 60 or so distinct components and directives.
  Section 5.11 lists every one per page.
- `chart.js` and `quill` are direct dependencies already. `primeflex` is a dependency but is
  imported nowhere. `pinia` is a dependency with no stores and stays as is.
- `v-styleclass` is used 4 times (topbar palette popover, topbar mobile menu, floating
  configurator, landing topbar mobile menu). `v-tooltip` is used twice, both in OverlayDoc.
- `layoutState.configSidebarVisible` and `toggleConfigSidebar` are unused outside the composable.
  `_preloading.scss` styles nothing in the tree. `flags.css` is used by InputDoc and TableDoc.
- All five services are used: ProductService (Crud, RecentSales, TableDoc, ListDoc, OverlayDoc),
  CountryService (InputDoc), CustomerService (TableDoc), NodeService (InputDoc, TreeDoc),
  PhotoService (MediaDoc).
- Dark mode is the `.app-dark` class on `<html>`, toggled inside `document.startViewTransition`.
- ESLint already disables `vue/multi-word-component-names`, so single-word shadcn component
  files lint clean. `tsconfig.json` already maps `@/*` to `src/*`.
- Vitest is scoped to `src/utils/**/*.{test,spec}.ts` and runs 7 passing tests.

## 3. Decisions taken with the user

1. Keep the Sakai SCSS shell for the first passes so the component swap can be checked against
   the current look, then swap the shell to shadcn-vue's `Sidebar` as the final layout phase.
   The user's reply "pop the route change in too" is read as including that phase.
2. Every showcase page stays, at its current route and menu entry, rebuilt on shadcn-vue
   components. Where shadcn-vue has no equivalent, a local component under `src/components/`
   provides one. No page, component or demo is dropped.
3. Keep the primary and surface colour picker, rebuilt on CSS variables and shadcn components,
   and keep the preset selector as three token sets that emulate Aura, Lara and Nora.
4. Items the first draft listed as out of scope are in scope: presets, the shadcn `Form`
   component with validation, component-level tests for the local components, and the Nuxt
   section of the documentation page.

## 4. Scope boundary

In scope: everything that imports from `primevue`, `@primevue/*`, `@primeuix/*`, `primeicons`,
`primeflex` or `tailwindcss-primeui`, every page, the layout, the configurator, the services and
the docs.

Unaffected because they do not depend on PrimeVue: `src/utils/sanitize.ts` and its tests, the
`scripts/update-deps.ts` script, the Vite and ESLint toolchain. No deployment or hosting change
is involved.

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
`layout.ts` on `primary`, `surface`, `preset` and `darkTheme` calls it with `flush: 'sync'`,
so the colours are in place inside the view-transition callback. Static `:root` and `.dark`
values from the CLI remain as the fallback before the watcher runs.

Whether the installed Sidebar component reads `--sidebar` (theming docs) or
`--sidebar-background` (sidebar docs) is checked from the generated component in phase 7 and the
mapping follows the code, not the docs.

### 5.3 Presets

`src/layout/presets.ts` defines `Aura`, `Lara` and `Nora` as token sets: `--radius`, a control
height and padding pair (`--control-height`, `--control-padding-x`, consumed by the vendored
`button`, `input`, `select` variants), and a border emphasis flag for Nora's heavier borders.
The numeric values are read from the PrimeVue preset definitions installed under
`node_modules/@primeuix/themes/` while the package is still present in phase 2, and recorded in
the file with a comment naming the source, so the emulation is checked rather than eyeballed.
`presetVars(name)` in `src/utils/theme.ts` returns the record and is applied by the same
watcher. `layoutConfig.preset` stays persisted, default `Aura`.

### 5.4 Dark mode

The class becomes `.dark`. `useLayout()` keeps `toggleDarkMode`, `isDarkTheme` and the
view-transition wrapper, and the SCSS dark selector is renamed in phase 2 (and deleted in phase
7). Every shadcn registry component assumes `.dark`, so no alternative is considered.

### 5.5 Layout state

`layoutConfig` stays a reactive object persisted to the `layoutConfig` localStorage key. Fields
after the migration: `preset`, `primary`, `surface`, `darkTheme`, `menuMode`, `sidebarOpen`.
Unknown keys in stored JSON are ignored. `loadSavedTheme()` gains a try/catch around
`JSON.parse` and validates each field's type, falling back to the default, because a corrupt
value currently throws at module load and blanks the app. `layoutState`, `isDesktop`,
`toggleMenu`, `hideMobileMenu`, `changeMenuMode`, `toggleConfigSidebar` and `hasOpenOverlay`
are removed in phase 7 when the shadcn `SidebarProvider` takes over open state. Until then they
are untouched.

### 5.6 Component layer

Components are added with `bunx shadcn-vue@latest add <name>` into `src/components/ui/<name>/`
with `components.json` set to the `new-york` style, base colour `zinc`, CSS variables on, CSS
path `src/assets/tailwind.css`, aliases `@/components/ui` and `@/lib/utils`. Files under
`src/components/ui` are vendored: formatted once with the repo's Prettier settings, then edited
only to add variants (for example `success`, `warning`, `info`, `contrast` on `Badge` to cover
`Tag` severities, and `severity` colour variants on `Button` to cover PrimeVue's
`secondary`/`success`/`info`/`warn`/`help`/`danger`/`contrast`). Imports are explicit
(`import { Button } from '@/components/ui/button'`); `unplugin-vue-components` and
`PrimeVueResolver` are removed, and `components.d.ts` is deleted if present.

Component set from the registry (all present on the shadcn-vue components page): accordion,
alert, alert-dialog, avatar, badge, breadcrumb, button, button-group, calendar, card, carousel,
checkbox, collapsible, combobox, command, context-menu, date-picker, dialog, dropdown-menu,
field, form, input, input-group, label, menubar, navigation-menu, number-field, pagination,
popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar,
skeleton, slider, sonner, spinner, stepper, switch, table, tabs, tags-input, textarea, toggle,
toggle-group, tooltip.

### 5.7 Local wrappers and gap components (in `src/components/`)

Every PrimeVue component with no registry equivalent gets a local component with the same
public shape (props and events named as the PrimeVue original where sensible) so a derived
project's muscle memory carries over. Each is one focused file, styled with the shadcn tokens,
and the ones with logic have tests (section 8).

| PrimeVue | Local component | Built on | Behaviour to preserve |
|---|---|---|---|
| DataTable, Column, TreeTable | `data-table/DataTable.vue` | `@tanstack/vue-table` + `Table` | sorting, global and per-column filters, row selection (single, multiple, checkbox), pagination with page report and rows-per-page, row expansion, frozen first column via sticky class, `subRows` expansion for TreeTable, CSV export via `toCsv` |
| Chart | `AppChart.vue` | `chart.js` | `type`, `data`, `options`; create on mount, update on change, destroy on unmount |
| Editor | `QuillEditor.vue` | `quill` | v-model HTML, snow toolbar, readonly, placeholder; output sanitised by consumers with `sanitizeHtml()` |
| Rating | `StarRating.vue` | lucide `Star` | interactive and readonly, `cancel`, keyboard |
| Timeline | `Timeline.vue` | markup | `value`, `align` (left, right, alternate), `layout` (vertical, horizontal), `marker`, `content`, `opposite` slots |
| Tree, TreeSelect | `Tree.vue`, `TreeSelect.vue` | `Collapsible`, `Checkbox`, `Popover` | expand and collapse, single and multiple selection, checkbox selection with partial state propagation, filter, lazy `children` |
| OrderList, PickList | `OrderList.vue`, `PickList.vue` | `Button`, list markup | move up, down, top, bottom; move to and from target, all and selected; multi-select with shift and ctrl |
| DataView | `DataView.vue` | `ToggleGroup`, pagination from DataTable | list and grid layouts, `sortField` and `sortOrder`, pagination, `list` and `grid` slots |
| FileUpload | `FileUpload.vue` | `Input type=file`, `Progress` | basic and advanced modes, drag and drop, multiple, `accept`, `maxFileSize` with message, file list with remove, `upload`, `select`, `clear` events, `auto` |
| Galleria, Image | `Galleria.vue`, `ImagePreview.vue` | `Carousel` (embla), `Dialog` | thumbnails, indicators, autoplay, fullscreen; image preview overlay with zoom |
| Knob | `Knob.vue` | SVG | v-model, min, max, step, `valueTemplate`, readonly, keyboard and drag |
| ColorPicker | `ColorPicker.vue` | native `input type=color` | v-model hex, inline and overlay display |
| InputMask | `MaskedInput.vue` + `src/utils/mask.ts` | `Input` | `mask` with `9`, `a`, `*`, optional `?` section, `slotChar`, `unmask` |
| Password | `PasswordInput.vue` + `src/utils/passwordStrength.ts` | `Input`, `Popover` | toggle mask, strength meter with weak, medium, strong labels, `feedback` off |
| FloatLabel | `FloatLabel.vue` | `Label` | label floats on focus or value, `variant` over and in |
| Listbox | `Listbox.vue` | `Command` list | single and multiple, filter, option groups, `optionLabel`, `optionValue` |
| MultiSelect | `MultiSelect.vue` | `Combobox` multiple + `Badge` chips | filter, select all, chip display, max selected labels |
| Chip | `Chip.vue` | `Badge` | label, icon, image, removable |
| AvatarGroup, OverlayBadge | `AvatarGroup.vue`, `OverlayBadge.vue` | `Avatar`, `Badge` | stacked overlap; badge anchored top-right, dot mode |
| ScrollTop | `ScrollTop.vue` | `@vueuse/core` scroll | appears past threshold, smooth scroll to top, `target` parent or window |
| Panel, Fieldset, Toolbar, Divider | `Panel.vue`, `Fieldset.vue`, `Toolbar.vue`, `Divider.vue` | `Card`, `Collapsible`, `Separator` | toggleable header, legend, start/center/end slots, divider with centred text and vertical layout |
| Menu (inline and popup), TieredMenu, PanelMenu | `MenuList.vue`, `PanelMenu.vue`; popup uses `DropdownMenu` | `DropdownMenu`, `Collapsible` | model-driven items with `label`, `icon`, `command`, `to`, `url`, `items`, `separator`, `disabled`; nested submenus |
| MegaMenu, Menubar, ContextMenu, Breadcrumb, Steps | registry `NavigationMenu`, `Menubar`, `ContextMenu`, `Breadcrumb`, `Stepper` driven by the same model shape through thin `App*` wrappers | | model-driven, `home` item for breadcrumb, orientation for megamenu |
| ConfirmPopup, ConfirmDialog | `ConfirmPopover.vue`, `useConfirm()` composable, `AlertDialog` | `Popover`, `AlertDialog` | `require({ target, message, icon, accept, reject })` API kept |
| Toast | registry `Sonner` + `useToast()` shim | `vue-sonner` | `add({ severity, summary, detail, life })` API kept as a thin shim so call sites stay readable |
| Drawer | registry `Sheet` | | positions left, right, top, bottom, and `fullScreen` via class |
| Splitter | registry `Resizable` | | horizontal and vertical, `minSize` |
| Tag, Message, InlineMessage | registry `Badge`, `Alert` | | severities via added variants, `closable`, icon slot |

The `useConfirm()` and `useToast()` shims exist because 5 files call them today; keeping the
call shape makes the port a rename rather than a rewrite and gives derived projects a stable
API.

`src/utils/csv.ts`: `toCsv(rows, columns)` with RFC 4180 quoting. String cells starting with
`=`, `+`, `-`, `@`, tab or carriage return get a leading apostrophe so a spreadsheet does not
evaluate them; numbers pass through untouched. `downloadCsv(filename, csv)` triggers the
download.

### 5.8 Layout shell, phase A (phase 2, Sakai SCSS kept)

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

### 5.9 Layout shell, phase B (phase 7, shadcn Sidebar)

`AppLayout.vue` wraps everything in `SidebarProvider` bound to `layoutConfig.sidebarOpen`, with
`AppSidebar` and a `SidebarInset` holding the topbar (`SidebarTrigger` plus actions), the
`router-view` and the footer. `AppSidebar.vue` becomes `Sidebar` with `variant="floating"` and
`:collapsible="layoutConfig.menuMode"`. `menuMode` values become `offcanvas` and `icon`, the
two the component supports (sidebar docs). Sakai's `overlay` mode has no shadcn equivalent on
desktop; to keep parity, `overlay` stays as a third value implemented locally: `offcanvas`
collapsing plus a `fixed` positioned sidebar that does not push content and closes on outside
click, driven by the same `useSidebar()` state. The configurator labels the three "Static",
"Overlay" and "Icon rail". Mobile uses the provider's built-in sheet.

`AppMenu.vue` keeps the data model. `AppMenuItem.vue` is rewritten on `SidebarGroup`,
`SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` (as `router-link`, `:is-active` on route
match) and `SidebarMenuSub`, with `Collapsible` for nested groups so the three-level Hierarchy
demo still works. Active state derives from the current route, not from `layoutState`.

`src/assets/layout/` and `styles.scss` are deleted. The `html`/`body` font rules, the `.card`
utility, `pre.app-code` (from `demo/code.scss`) and the heading typography move into
`src/assets/tailwind.css` under `@layer base` and `@layer components`, with Lato declared as
`--font-sans` in `@theme`. `src/assets/demo/flags/flags.css` stays and is imported from
`main.ts`. `sass` and the `css.preprocessorOptions` block in `vite.config.ts` go.

### 5.10 Configurator

`AppConfigurator.vue` becomes Popover content with four groups: primary swatches, surface
swatches, a `ToggleGroup` for presets (Aura, Lara, Nora) and a `ToggleGroup` for menu mode.
Swatch buttons keep the current `outline-primary` selected state. `@primeuix/themes` imports go.

### 5.11 Pages, one for one

Application pages:

- Crud: `Toolbar` local; `DataTable` wrapper with column defs (selection, code, name, image,
  price, category, rating via `StarRating`, status via `Badge`, actions); the product dialog uses
  `Dialog`, `Input`, `Textarea`, `Select`, `RadioGroup`, `NumberField`; delete confirmations use
  `AlertDialog` through `useConfirm()`; `FilterMatchMode` from `@primevue/core/api` goes with the
  wrapper's own filter prop. Export uses `toCsv`.
- Login: `Input`, `PasswordInput`, `Checkbox`, `Button` as `router-link`.
- Dashboard widgets: `RecentSalesWidget` uses the wrapper; `BestSellingWidget` and
  `NotificationsWidget` use `DropdownMenu`; `RevenueStreamWidget` uses `AppChart` and reads
  `--foreground`, `--muted-foreground`, `--border` for chart colours instead of `--p-*`.
- Landing: `Button` and `Divider`; fixed dark sections use Tailwind's built-in zinc scale.
- Access, Error, NotFound, Empty: `Button` and class rewrite only.
- Documentation: rewritten for the new stack (bun commands, structure, menu model, layout
  composable, palettes and presets, adding components, rich-text sanitisation). The Nuxt section
  stays and is rewritten against the shadcn-vue Nuxt installation guide, with its URL checked
  when the section is written.
- `AppFooter.vue` links to this repository instead of primevue.org.

Showcase pages, every component listed is from the grep of that file:

| Page | PrimeVue components used | Replacement |
|---|---|---|
| ButtonDoc | Button, ButtonGroup, SplitButton | `Button` with severity and `text`/`outlined`/`rounded`/`raised` variants, `ButtonGroup`, `ButtonGroup` + `DropdownMenu` |
| ChartDoc | Chart, Fluid | `AppChart` for line, bar, pie, doughnut, polarArea, radar; `w-full` |
| FileDoc | FileUpload, Button, Toast | `FileUpload` basic and advanced, `useToast()` |
| FormLayout | Editor, InputText, Select, Textarea, Button, Fluid | `QuillEditor` with the `sanitizeHtml()` round-trip, `Input`, `Select`, `Textarea`, plus a validated form on the registry `Form` (`vee-validate` + `zod`) as the new "Validation" section |
| InputDoc | AutoComplete, Checkbox, ColorPicker, DatePicker, FloatLabel, IconField, InputGroup, InputGroupAddon, InputIcon, InputNumber, InputText, Knob, Listbox, MultiSelect, RadioButton, Rating, Select, SelectButton, Slider, Textarea, ToggleButton, ToggleSwitch, TreeSelect, Fluid | `Combobox`, `Checkbox`, `ColorPicker`, `DatePicker`, `FloatLabel`, `InputGroup`, `NumberField`, `Input`, `Knob`, `Listbox`, `MultiSelect`, `RadioGroup`, `StarRating`, `Select`, `ToggleGroup`, `Slider` (single and range), `Textarea`, `Toggle`, `Switch`, `TreeSelect`, `MaskedInput` for the mask example |
| ListDoc | DataView, OrderList, PickList, SelectButton, Tag, Button | `DataView`, `OrderList`, `PickList`, `ToggleGroup`, `Badge` |
| MediaDoc | Carousel, Galleria, Image, Tag, Button | `Carousel`, `Galleria`, `ImagePreview`, `Badge` |
| MenuDoc | Breadcrumb, ContextMenu, MegaMenu, Menu, Menubar, PanelMenu, Stepper (Step, StepList), Tabs (Tab, TabList), TieredMenu, IconField, InputIcon, InputText, Button | `Breadcrumb`, `ContextMenu`, `NavigationMenu`, `MenuList` and `DropdownMenu`, `Menubar`, `PanelMenu`, `Stepper`, `Tabs`, `DropdownMenu` with `Sub`, `InputGroup` |
| MessagesDoc | Message, InputText, Button | `Alert` with severity variants and `closable`, `Input` with `invalid` state, `useToast()` |
| MiscDoc | Avatar, AvatarGroup, Badge, Chip, OverlayBadge, ProgressBar, ScrollPanel, ScrollTop, Skeleton, Tag, Button | `Avatar`, `AvatarGroup`, `Badge`, `Chip`, `OverlayBadge`, `Progress` (determinate and indeterminate), `ScrollArea`, `ScrollTop`, `Skeleton` |
| OverlayDoc | Dialog, Drawer, Popover, ConfirmPopup, DataTable, Column, InputText, Button, `v-tooltip` | `Dialog`, `Sheet` in all positions, `Popover`, `ConfirmPopover`, the `DataTable` wrapper inside a popover, `Tooltip` |
| PanelsDoc | Accordion, Card, Divider, Fieldset, Panel, Splitter, Tabs, Toolbar, Menu, SplitButton, IconField, InputIcon, InputText, Button | `Accordion`, `Card`, `Divider`, `Fieldset`, `Panel`, `Resizable`, `Tabs`, `Toolbar`, `DropdownMenu`, `InputGroup` |
| TableDoc | DataTable, Column, Checkbox, DatePicker, IconField, InputIcon, InputNumber, InputText, MultiSelect, ProgressBar, Rating, Select, Slider, Tag, ToggleButton, Button | the `DataTable` wrapper exercising filters (text, date, numeric range, multi-select), row expansion, frozen column, selection modes, `Progress`, `StarRating`, `Badge`, `Toggle`; the country flag classes from `flags.css` stay |
| TimelineDoc | Timeline, Card, Button | `Timeline` in every alignment and layout, `Card` |
| TreeDoc | Tree, TreeTable, Column | `Tree` with selection modes and filter, `DataTable` wrapper with `subRows` expansion |
| Blocks | Button, Checkbox, Chip, IconField, InputIcon, InputText, Password | `Button`, `Checkbox`, `Chip`, `InputGroup`, `Input`, `PasswordInput`, and a full utility class rewrite; the "All Blocks" menu link points at the shadcn-vue blocks page, URL checked at implementation |
| BlockViewer | none (reads two `--p-*` tokens) | reads `--muted` and `--border` |

Utility classes across every page: `bg-surface-0 dark:bg-surface-900` to `bg-card`,
`text-surface-900 dark:text-surface-0` to `text-foreground`, `text-muted-color` to
`text-muted-foreground`, `border-surface` to `border-border`, `bg-highlight` to `bg-accent`,
`rounded-border` to `rounded-lg`, `text-primary` unchanged. Fixed numeric shades that are part
of a design (dark hero sections, Blocks) use Tailwind's built-in zinc scale. No custom `surface`
colour scale is added to `@theme`.

Routes and the menu model are unchanged except the "All Blocks" external URL and the icon
values. All five services stay with their two-tier shape.

### 5.12 Icons

`lucide-vue-next` replaces `primeicons`. The tree references 94 distinct icons (`pi-fw`
excluded); each maps to the nearest lucide name during the port, recorded once in
`src/components/icons.ts` as a named re-export map so the mapping is reviewable in one file. The
menu model stores the component, so a derived project adds an icon with one import.

### 5.13 Dependencies

Added at runtime: `reka-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`,
`lucide-vue-next`, `@vueuse/core`, `@tanstack/vue-table`, `vue-sonner`,
`@internationalized/date`, `embla-carousel-vue`, `vee-validate`, `zod`, `@vee-validate/zod`.
Added as dev: `tw-animate-css`, `@vue/test-utils`. The CLI decides part of the set when `init`
and `add` run; the PR body lists what was actually added, and any package outside this list is
raised before it is kept.

Removed: `primevue`, `@primeuix/themes`, `@primevue/auto-import-resolver`, `primeflex`,
`primeicons`, `tailwindcss-primeui`, `unplugin-vue-components`, and `sass` in phase 7.

Unchanged: `chart.js`, `quill`, `dompurify`, `pinia`, `vue-router`, `tailwindcss`,
`@tailwindcss/vite`, and the whole dev toolchain. `scripts/update-deps.ts` reads installed
packages and needs no change.

## 6. Data flow

`AppConfigurator` writes `layoutConfig.primary`, `.surface` or `.preset`. The module watcher in
`layout.ts` calls `applyTheme`, which asks `theme.ts` for the token record and sets it on
`<html>`. The same watcher persists `layoutConfig`. Tailwind utilities read the tokens through
`@theme inline`, so every shadcn component, every local component and every `bg-card`,
`text-primary` class updates in place. Dark toggle: flag flips, `.dark` toggles, watcher
re-applies the dark mapping, all inside one view transition.

## 7. Error handling

- Corrupt or stale `layoutConfig` JSON: caught, defaults used, nothing thrown at module load.
- Unknown palette or preset name in storage: `theme.ts` returns the default's values.
- `AppChart`, `QuillEditor`, `Galleria` and `ScrollTop` release their instances and listeners
  on unmount and tolerate a missing element ref.
- `FileUpload` reports files over `maxFileSize` or outside `accept` in its message area rather
  than silently dropping them.
- `toCsv` with no rows returns the header line only.
- The shadcn CLI failing on this toolchain (Vite 8, TypeScript 6, Tailwind 4.3 are newer than
  the docs assume) is handled by adding components from the registry JSON by hand; the
  `components.json` and `cn` helper are two small files.

## 8. Testing

The Vitest `include` glob widens to `src/**/*.{test,spec}.ts` and gains a setup file plus
`@vue/test-utils`, which is the step the project CLAUDE.md already describes for when real logic
moves beyond `src/utils`. That condition is now met by the local components. Vendored
`src/components/ui` files and the demo pages are not tested; local components with logic are,
written test-first:

- `sanitize.test.ts`: unchanged, must stay green.
- `csv.test.ts`: header row; quoting of comma, quote and newline; apostrophe prefix on
  formula-leading strings and none on numbers; null and undefined render empty.
- `theme.test.ts`: light and dark shade selection for primary; `noir` uses the surface scale;
  surface mapping light and dark; `null` surface resolves to slate or zinc by mode; preset
  records; the returned key set equals the documented token list.
- `mask.test.ts`: `9`, `a`, `*` placeholders, optional sections, `slotChar`, `unmask`.
- `passwordStrength.test.ts`: the three thresholds and empty input.
- Component tests (`@vue/test-utils`): `Tree` (expand, select modes, checkbox partial-state
  propagation, filter), `OrderList` and `PickList` (every move operation, selection), `DataTable`
  (sort, filter, selection, pagination report, expansion), `FileUpload` (size and type
  rejection, remove, events), `Knob` (clamping, step, keyboard), `StarRating` (click, keyboard,
  readonly, cancel), `Timeline` (alignment classes and slots), `DataView` (layout toggle,
  sort, pagination), `ScrollTop` (threshold), `MultiSelect` and `Listbox` (selection, filter),
  `ConfirmPopover` and `useConfirm()` (accept and reject callbacks), `useToast()` shim (maps
  severity and life to Sonner calls).

Pages and layout are verified by `bun run type-check`, `bun run lint`, `bun run build`, and a
browser pass over every route in light and dark mode, all three presets, at desktop and mobile
widths.

## 9. Phases

Each phase ends with type-check, lint, test and build green, and is its own commit or short
series. PrimeVue and shadcn coexist in the tree from phase 1 until the end of phase 6, because
PrimeVue can only be removed once the last page is ported.

1. Bootstrap: `init`, merge `tailwind.css`, add the full component set, format, remove the
   Tailwind 3 border compatibility layer, widen the Vitest glob and add the setup file.
2. Theme: `theme.ts` with tests, `palettes.ts`, `presets.ts` (values read from the installed
   PrimeVue presets), `composables/theme.ts`, `useLayout` changes, `.dark` rename, SCSS token
   re-point, configurator on shadcn with the preset control.
3. Wrappers: `csv.ts`, `DataTable`, `AppChart`, `QuillEditor`, `useToast()` and `useConfirm()`
   shims, `Toaster` in `App.vue`, all test-first.
4. Gap components from 5.7, test-first, each with a minimal usage in the page that needs it so
   nothing lands unused.
5. Port the application pages and the layout pieces of phase A.
6. Port the fifteen showcase pages, Blocks and BlockViewer, page by page, each its own commit.
   Then the sweep: remove the PrimeVue plugin, resolver, type shim and packages, `primeicons`
   out and the icon map in. Exit criterion: a search for `primevue`, `primeuix`, `primeicons`
   and `tailwindcss-primeui` under `src` finds nothing and the build passes.
7. Sidebar swap: add `sidebar`, rewrite the shell, implement the local overlay mode, retire SCSS
   and `sass`.
8. Docs: CLAUDE.md (auto-import rule removed, layout fields updated, Quill path updated, testing
   section widened, component-add instructions), README, `Documentation.vue` including the
   Nuxt section.
9. Verification, then the review gate (`claude-review-suite:code-review` and
   `claude-review-suite:security-review` over the branch diff against main), then push and PR.

## 10. Open points for review

1. The dependency list in 5.13 is the request for approval under the ask-before-adding rule.
   The parity additions over the first draft are `embla-carousel-vue`, `vee-validate`, `zod`,
   `@vee-validate/zod` and `@vue/test-utils`.
2. Preset emulation covers radius, control sizing and border weight. Aura, Lara and Nora also
   differ in shadows and some per-component details that a token set cannot reproduce exactly;
   the three will be recognisably distinct but not pixel-identical.
3. Widening the Vitest glob and adding component tests changes the project CLAUDE.md's stated
   testing scope. The spec treats that as the CLAUDE.md's own trigger condition being met and
   updates the text in phase 8.
4. Overlay menu mode is kept in phase 7 through a local implementation on top of the shadcn
   Sidebar, since the component has only `offcanvas` and `icon`.
