# shadcn-vue Migration, Plan 3: Gap Components and DataTable Extensions

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land every local component the fifteen showcase pages, Blocks and BlockViewer still need (spec 5.7) and extend the `DataTable` wrapper with per-column filters, frozen columns, an expansion slot and row grouping, all test-first, so that Plan 4 can port those pages as renames rather than rewrites.

**Architecture:** Each gap component is one focused file under `src/components/` (or a small folder when it ships a helper), named and shaped after the PrimeVue original so a ported page changes its import line and prop spellings, not its structure. Components with logic get a Vitest suite written before the implementation. Building blocks are the vendored shadcn components under `src/components/ui`, Reka UI primitives for keyboard and ARIA behaviour (`TreeRoot`, `ListboxRoot`, `ComboboxRoot`, `PopoverAnchor`), `@vueuse/core` for scroll, drop-zone and interval handling, embla through the vendored `Carousel`, and TanStack Table 9 features already wired in `src/components/data-table/features.ts`. No page is ported here; that is Plan 4.

**Tech Stack:** Vue 3.5, Vite 8.3, TypeScript 6 strict, Tailwind 4.3, vendored shadcn-vue (nova) components, Reka UI 2.10, `@lucide/vue` 1.45, `@vueuse/core` 14.4 (re-exports `@vueuse/shared`), TanStack Table 9.2.4, `embla-carousel-vue` 8.6, `@internationalized/date` (installed), `vee-validate` 4.15 and `zod` 3.25 (for Plan 4's validation demo), Vitest 4.1.11 with jsdom 29 and `@vue/test-utils` 2.5, Bun.

**Spec:** `docs/superpowers/specs/2026-09-12-shadcn-vue-migration-design.md` (revision 3). This plan implements the remainder of spec phase 4 (section 5.7 components not yet landed) and the `DataTable` behaviours section 5.7 lists for TableDoc and TreeDoc. Plan 4 takes phase 6 (the fifteen showcase pages, Blocks, BlockViewer, the sweep that removes PrimeVue). Plan 5 takes phases 7 to 9 (Sidebar swap, docs, final gate).

**Prior plan:** Plan 2 landed on this branch through commit `0fff84e` (Plan 2 code ends at `179959e`; the four commits after it are the lodash-es override, the in-range dependency update, the vitest bump and prettier 3.9 formatting). Its reviews and the review gate deferred these component-level items, each of which is a step below: the `DataTable` selection model is only synced inward when it empties (Task 2); `PasswordInput` hard-codes `autocomplete="current-password"` (Task 9); `StarRating` accepts `NaN` for `stars` and does not `preventDefault` on boundary arrow keys (Task 9); `IconQuestion` and `IconQuestionCircle` render the same glyph (Task 1). Page-level and layout-level deferrals (dead `ready` guard in `RevenueStreamWidget`, three `formatCurrency` copies, `_topbar.scss:120`, `aria-expanded` on the two panel toggles, `rel` on the `target=_blank` menu links, the sidebar cookie attributes, the `onClickOutside` ignore selector, `DialogDescription` on the Crud dialog) belong to Plan 4's sweep.

## Global Constraints

- Work only in the worktree `.claude/worktrees/shadcn-vue-migration` on branch `worktree-shadcn-vue-migration`. Never touch the main checkout.
- Bun only: `bun run <script>`, `bunx`. Never `npm`, `npx`, `yarn`, bare `bun test` or bare `bun build`. No new dependencies in this plan; everything needed is installed (checked in the Verified facts below).
- Git commands are single plain commands, one per shell invocation (`git add <paths>` then `git commit -m ...`); the harness refuses compound git lines and heredocs. Use the Write and Edit tools for file content.
- Formatting is the repo's Prettier config: 4-space indent, single quotes, semicolons, no trailing commas, `printWidth` 250, indented script blocks in `.vue` files. Run `bunx prettier --check` on every changed file before committing and `--write` where it differs.
- TypeScript strict with `noUnusedLocals` and `noUnusedParameters`. Every new file is TypeScript (`<script setup lang="ts">`). Tests import `describe`, `it`, `expect`, `vi` from `vitest` explicitly and mount with `@vue/test-utils`.
- Test-first for every component with logic: write the test, run it and see it fail for the right reason, implement, run it green, commit. A test that passes before the implementation exists is a wrong test.
- Every task ends green on all of: `bun run type-check`, `bun run lint` (0 errors; 5 pre-existing warnings are expected: `scripts/update-deps.ts` x2, `src/components/ui/calendar/CalendarHeading.vue`, `src/service/types.ts`, `src/types/tailwindcss-primeui.d.ts`), `bun run test` (baseline at the start of this plan: 82 tests in 17 files; each task states its expected count), `bun run build`.
- PrimeVue stays installed and registered until Plan 4's sweep: `@plugin 'tailwindcss-primeui'` in `src/assets/tailwind.css`, `app.use(PrimeVue, ...)` in `src/main.ts`, `<Toast />` in `AppLayout.vue`, the `Components({ resolvers: [PrimeVueResolver()] })` plugin and `components.d.ts` all stay.
- Component API shapes follow the PrimeVue original's prop and event names where the spec table (5.7) says so, so Plan 4's ports are renames. Where shadcn's composition differs (a popup menu is a `DropdownMenu` around a trigger slot rather than a `toggle(event)` call on a ref), the component documents the difference in a one-line comment at the top of its script.
- Styling uses shadcn tokens only (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-muted`, `bg-accent`, `ring-ring`); no `surface-*` or `--p-*` names. Icons come from `@/components/icons`; a new glyph is added to that map (Task 1), never imported from `@lucide/vue` in a component file. The two exceptions are the vendored `src/components/ui` files, which are not edited except to add variants, and this plan's own additions to `icons.ts`.
- Comment why, not what. Handle errors explicitly. No em dashes in any file or commit message. No AI attribution lines in commits.
- `data-slot` attributes: every local component's root carries `data-slot="<kebab-name>"` (the convention Plan 1 and 2 set), and tests select by `data-slot` or `data-testid`, never by Tailwind class.

## Verified facts this plan relies on

Checked in the worktree on 2026-09-14 at commit `0fff84e`:

- `@tanstack/table-core` 9.2.4 exports these filter functions: `filterFn_arrHas`, `filterFn_arrIncludes`, `filterFn_arrIncludesAll`, `filterFn_arrIncludesSome`, `filterFn_between`, `filterFn_betweenInclusive`, `filterFn_empty`, `filterFn_endsWith`, `filterFn_equals`, `filterFn_equalsString`, `filterFn_equalsStringSensitive`, `filterFn_greaterThan`, `filterFn_greaterThanOrEqualTo`, `filterFn_includesString`, `filterFn_includesStringSensitive`, `filterFn_inDateRange`, `filterFn_inNumberRange`, `filterFn_lessThan`, `filterFn_lessThanOrEqualTo`, `filterFn_notEmpty`, `filterFn_startsWith`, `filterFn_weakEquals`; and these features and row models: `columnPinningFeature`, `columnOrderingFeature`, `columnResizingFeature`, `rowPinningFeature`, `createGroupedRowModel`, `createExpandedRowModel`, `createFacetedRowModel`. `tableFeatures()` accepts `filterFns?: Record<string, FilterFn>` and a type-only `columnMeta: {} as MyColumnMeta` slot that types `columnDef.meta` (comment in `node_modules/@tanstack/table-core/dist/types/ColumnDef.d.ts`).
- The current `DataTable` (`src/components/data-table/DataTable.vue`, 208 lines) uses `useTable`, `tableFeatures`, `FlexRender`, `getRowId`, `getSubRows`, `globalFilterFn: 'includesString'`, state getters for `sorting`, `globalFilter`, `rowSelection`, `expanded`, `pagination`, and exposes `table`, `visibleRows()`, `selectedRows()`. Its tests (`DataTable.test.ts`, 9 tests) cover pagination report, sorting, global filter, checkbox selection, header select-all, sub-row expansion, custom cells and the empty slot, and row-click.
- `reka-ui` 2.10.4 exports `TreeRoot` and `TreeItem`; the `TreeItem` slot exposes `isExpanded`, `isSelected`, `isIndeterminate`, `handleToggle`, `handleSelect`, and each flattened item carries `_id`, `bind`, `level`, `hasChildren`, `value` (all in `dist/index4.d.ts`). `PopperAnchorProps.reference?: ReferenceElement` is the anchor element prop. `ComboboxRootProps` has `ignoreFilter`, `openOnFocus`, `openOnClick`, `resetSearchTermOnSelect`. `TreeRootProps`: `modelValue`, `defaultValue`, `items`, `expanded`, `defaultExpanded`, `getKey: (val) => string`, `getChildren?: (val) => T[] | undefined`, `selectionBehavior?: 'toggle' | 'replace'`, `multiple`, `dir`, `disabled`, `propagateSelect`, `bubbleSelect`; emits `update:modelValue` and `update:expanded` (`string[]`); its default slot receives `flattenItems: FlattenedItem<T>[]`, `modelValue`, `expanded`. `ListboxRootProps`: `modelValue`, `defaultValue`, `multiple`, `orientation`, `dir`, `disabled`, `selectionBehavior`, `highlightOnHover`, `by`; it exports `ListboxContent`, `ListboxFilter`, `ListboxGroup`, `ListboxGroupLabel`, `ListboxItem`, `ListboxItemIndicator`. Also exported: `ComboboxRoot`, `TagsInputRoot`, `ProgressRoot`, `PopoverRoot`, `VisuallyHidden`, `Primitive`, `useForwardPropsEmits`, `useId`, `useFilter`, `StepperRoot`, `SplitterGroup`.
- `@vueuse/core` 14.4 declares `useScroll`, `useDropZone`, `useFileDialog`, `useEventListener`, `onClickOutside`, `useVModel`, `useElementSize`, `useResizeObserver`, `useFullscreen`, `useWindowSize`, and re-exports everything from `@vueuse/shared` (`export * from "@vueuse/shared"` at line 3 of its `index.d.ts`), which declares `useIntervalFn` and `useDebounceFn`.
- `@lucide/vue` 1.45 exports (checked against `node_modules/@lucide/vue/dist/lucide-vue.d.ts`): `MessageCircleQuestionMark`, `ThumbsUp`, `Video`, `RefreshCw`, `Printer`, `Save`, `LogOut`, `Compass`, `MapPin`, `UserPen`, `UserPlus`, `Tag`, `Mail`, `Bookmark`, `FunnelX`, `Minus`, `LockOpen`, `Info`, `CircleCheck`, `SquarePen`, `Smile`, `Shield`, `Clock`, `ChevronRight`, `ChevronLeft`, `ChevronDown`, `ChevronUp`, `ChevronsUp`, `ChevronsDown`, `ChevronsLeft`, `ChevronsRight`, `LoaderCircle`, `ArrowLeft`, `ArrowDown`, `ExternalLink`, `CalendarPlus`, `Apple`, `LayoutGrid`, `MessageCircle`, `Paperclip`, `CloudUpload`, `Ban`, `Maximize`, `Minimize`, `ZoomIn`, `ZoomOut`, `RotateCw`, `Play`, `Pause`, `ArrowUpToLine`, `ArrowDownToLine`, `GripVertical`, `Funnel`, `Copy`. It exports no brand icons: `Facebook`, `Twitter`, `Github`, `Chrome`, `Slack`, `Youtube`, `Instagram`, `Linkedin`, `Figma`, `Codepen`, `Trello`, `Pocket`, `Framer`, `Gitlab`, `Twitch`, `Dribbble` are all absent, so the Chip demo's Facebook, Google and Microsoft glyphs and the Blocks page's Discord glyph get generic replacements (Task 1 records which).
- The vendored `Carousel` (`src/components/ui/carousel`) takes `opts` (embla options), `plugins`, `orientation`, emits `init-api` with the embla API and exposes `carouselApi`, `scrollNext`, `scrollPrev`, `canScrollNext`, `canScrollPrev`. `CarouselContent`, `CarouselItem`, `CarouselNext`, `CarouselPrevious` are the children. `embla-carousel-autoplay` is not installed, so autoplay is an interval calling `scrollNext`.
- The vendored `Calendar` binds Reka's `CalendarRoot` (`modelValue` is a `DateValue` from `@internationalized/date`, `placeholder`, `minValue`, `maxValue`, `locale`) and already imports `today`, `getLocalTimeZone` from `@internationalized/date` and `toDate` from `reka-ui/date`; `@internationalized/date` is installed (`node_modules/@internationalized/date`).
- `SheetContent` has `side?: 'top' | 'right' | 'bottom' | 'left'` (default `right`) and `showCloseButton`. `DialogContent` has `showCloseButton`. `PopoverContent` defaults `align: 'center'`, `sideOffset: 4`. `Alert` has variants `default` and `destructive` only. `Avatar` has `size` `sm | default | lg` and the folder ships `AvatarGroup`, `AvatarGroupCount`, `AvatarBadge`, `AvatarImage`, `AvatarFallback`. `Toggle` has `variant` `default | outline` and `size` `default | sm | lg`. `Tabs` list has `variant` `default | line`. `Switch` has `size` `sm | default`. `Progress` binds Reka `ProgressRoot` with `modelValue` default 0. `Stepper*` are thin wrappers over Reka `StepperRoot`, `StepperItem` (`step`), `StepperTrigger`, `StepperIndicator`, `StepperTitle`, `StepperSeparator`. `Resizable*` wrap Reka `SplitterGroup` (`direction`), `SplitterPanel` (`defaultSize`, `minSize`), `SplitterResizeHandle` (`withHandle`). `ScrollArea` wraps Reka `ScrollAreaRoot`. `Skeleton` is a `div` with a `class` prop. `Badge` forwards `PrimitiveProps` and `variant`. `Input` and `Textarea` use `useVModel` on `modelValue: string | number`. `InputGroup` ships `InputGroupAddon` (`align` `inline-start | inline-end | block-start | block-end`), `InputGroupButton`, `InputGroupInput`, `InputGroupText`, `InputGroupTextarea`. `ButtonGroup` has `orientation`. `Field` ships `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`, `FieldLegend`. `Form` re-exports vee-validate's `Form`, `Field as FormField`, `FieldArray as FormFieldArray` plus `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`.
- `src/components/icons.ts` maps 60 PrimeIcons names today, one export per line with a `// pi-name` comment; `src/components/icons.test.ts` mounts every export and asserts it renders an `svg`.
- PrimeIcons glyphs the unported files still reference and the map lacks (from `grep -rhoE 'pi-[a-z0-9-]+' src/views/uikit src/views/utilities src/service src/components/BlockViewer.vue`): `pi-check-circle`, `pi-pen-to-square`, `pi-star-fill`, `pi-envelope`, `pi-user-plus`, `pi-map-marker`, `pi-bookmark`, `pi-video`, `pi-user-edit`, `pi-refresh`, `pi-discord`, `pi-copy`, `pi-compass`, `pi-clock`, `pi-calendar-plus`, `pi-sign-out`, `pi-shield`, `pi-save`, `pi-face-smile`, `pi-angle-right`, `pi-tag`, `pi-spinner`, `pi-print`, `pi-minus`, `pi-microsoft`, `pi-lock-open`, `pi-info-circle`, `pi-google`, `pi-filter-slash`, `pi-facebook`, `pi-external-link`, `pi-arrow-left`, `pi-arrow-down`, `pi-apple`.
- `NodeService.getTreeNodes()` returns `TreeNode[]` (`key`, `label`, `data`, `icon` as a `pi pi-fw pi-x` string, `children?`); `getTreeTableNodes()` returns `TreeTableNode[]` (`key`, `data: { name, size, type }`, `children?`). `ProductService.getProductsWithOrdersSmall()` returns products with `orders?: ProductOrder[]`. `CustomerService.getCustomersLarge()` returns `Customer[]` (`id`, `name`, `country: { name, code }`, `company`, `date` string, `status`, `verified`, `activity`, `representative: { name, image }`, `balance`). `PhotoService.getImages()` returns `Photo[]` (`itemImageSrc`, `thumbnailImageSrc`, `alt`, `title`).
- TanStack v9 method names used by Tasks 2 and 3, each present in `node_modules/@tanstack/table-core/dist/*.d.ts`: `resetColumnFilters`, `getColumnCanGlobalFilter`, `setFilterValue`, `getFilterValue`, `getIsFiltered`, `getIsPinned`, `getStart`, `getAfter`, `getIsGrouped`, `toggleAllRowsExpanded`, `getRowCanExpand`.
- PrimeVue 4's `FileUpload.formatSize` (`node_modules/primevue/fileupload/index.mjs:172`): `k = 1024`, `dm = 3`, `parseFloat((bytes / k ** i).toFixed(dm))`, units `B KB MB GB TB PB EB ZB YB`. Task 7 copies it so rejection messages read as before.
- `InputMask` is used by no page in the tree (`grep -rln InputMask src` finds nothing), so spec 5.7's `MaskedInput` and `src/utils/mask.ts` have no consumer. This plan leaves them out and records the omission for the user; adding them later is one task.
- `AvatarGroup` and `OverlayBadge`: the vendored avatar folder already ships `AvatarGroup`, `AvatarGroupCount` and `AvatarBadge`, so no local `AvatarGroup` is written; `OverlayBadge` (a badge anchored on any child, not only an avatar) is still local (Task 11).

## File structure

New files, one responsibility each. Folder names group a component with its own helpers and tests only.

| Path | Responsibility |
|---|---|
| `src/components/icons.ts` (modify), `src/components/resolveIcon.ts` (+test) | PrimeIcons-named lucide map, plus a resolver from a `pi pi-fw pi-x` string to the mapped component for data-driven icons (NodeService, menu models) |
| `src/components/data-table/filters.ts` (+test) | Match-mode filter functions and the dispatcher TanStack calls; typed column meta |
| `src/components/data-table/features.ts` (modify) | Registers the filter functions, pinning, grouping, typed meta |
| `src/components/data-table/DataTableFilterMenu.vue` | Header popover: match mode, value, Apply, Clear |
| `src/components/data-table/DataTable.vue` (modify) | Filters, loading, gridlines, hover, global filter fields, frozen columns, scroll height, expansion slot, grouping, expand and collapse all, selection inbound sync |
| `src/components/Paginator.vue` | First, previous, page links, next, last, rows per page, report; used by `DataTable` and `DataView` |
| `src/components/tree/Tree.vue` (+test), `src/components/tree/TreeSelect.vue` (+test), `src/components/tree/model.ts` | Tree on Reka `TreeRoot`; popover select on top of it; shared node type and key helpers |
| `src/components/list/moves.ts` (+test), `src/components/list/useListSelection.ts`, `src/components/list/OrderList.vue` (+test), `src/components/list/PickList.vue` (+test) | Pure reorder and transfer functions; click, ctrl and shift selection; the two list components |
| `src/components/DataView.vue` (+test) | List and grid layouts, sort, paginate, `list` and `grid` slots |
| `src/components/file-upload/FileUpload.vue` (+test), `src/components/file-upload/validate.ts` (+test) | Basic and advanced upload with drop zone, size and type validation, previews |
| `src/components/Galleria.vue` (+test), `src/components/ImagePreview.vue` (+test) | Carousel-backed gallery with thumbnails, indicators, autoplay, fullscreen; image with zoomable overlay |
| `src/components/Knob.vue` (+test), `src/components/knob-math.ts` (+test), `src/components/ColorPicker.vue` (+test), `src/components/FloatLabel.vue` | Dial input with SVG arc; native colour input; floating label wrapper |
| `src/components/Listbox.vue` (+test), `src/components/MultiSelect.vue` (+test), `src/components/AutoComplete.vue` (+test), `src/components/SelectButton.vue` (+test), `src/components/ToggleButton.vue` (+test), `src/components/DatePicker.vue` (+test), `src/utils/dateFormat.ts` (+test) | Form controls with PrimeVue prop shapes; `dd/mm/yy` style formatting |
| `src/components/Chip.vue`, `src/components/OverlayBadge.vue`, `src/components/ScrollTop.vue` (+test), `src/components/Message.vue` (+test), `src/components/ui/alert/index.ts` (modify: severity variants) | Misc page components |
| `src/components/Panel.vue`, `src/components/Fieldset.vue`, `src/components/Divider.vue`, `src/components/Timeline.vue` (+test) | Panels page components |
| `src/components/menu/model.ts`, `src/components/menu/MenuList.vue` (+test), `src/components/menu/TieredMenu.vue`, `src/components/menu/PanelMenu.vue` (+test), `src/components/menu/AppMenubar.vue`, `src/components/menu/AppBreadcrumb.vue`, `src/components/menu/AppContextMenu.vue`, `src/components/menu/AppMegaMenu.vue`, `src/components/menu/AppSteps.vue`, `src/components/menu/MenuItemContent.vue`, `src/components/SplitButton.vue` (+test) | Model-driven menus over the vendored menu primitives |
| `src/components/ConfirmDialogHost.vue` (modify), `src/components/ConfirmPopover.vue` (+test), `src/composables/useConfirm.ts` (modify) | Popover branch of the confirm service, keyed on `target` |
| `src/components/PasswordInput.vue`, `src/components/StarRating.vue` (modify, +tests) | Plan 2 deferrals |

---

### Task 1: Icon map extension and `resolveIcon`

**Files:**
- Modify: `src/components/icons.ts`
- Create: `src/components/resolveIcon.ts`
- Test: `src/components/resolveIcon.test.ts`, `src/components/icons.test.ts` (unchanged, must stay green)

**Interfaces:**
- Produces: the exports listed in Step 3 from `@/components/icons`; `resolveIcon(className: string | undefined): Component | undefined` from `@/components/resolveIcon`.

- [ ] **Step 1: Write the failing resolver test**

Create `src/components/resolveIcon.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { IconCalendarPlus, IconInbox, IconQuestion } from '@/components/icons';
import { resolveIcon } from './resolveIcon';

describe('resolveIcon', () => {
    it('maps a PrimeIcons class string to the icon component', () => {
        expect(resolveIcon('pi pi-fw pi-inbox')).toBe(IconInbox);
        expect(resolveIcon('pi-calendar-plus')).toBe(IconCalendarPlus);
    });

    it('ignores the pi and pi-fw tokens', () => {
        expect(resolveIcon('pi pi-fw')).toBeUndefined();
        expect(resolveIcon('pi')).toBeUndefined();
    });

    it('returns undefined for an unknown glyph, an empty string and undefined', () => {
        expect(resolveIcon('pi pi-fw pi-no-such-icon')).toBeUndefined();
        expect(resolveIcon('')).toBeUndefined();
        expect(resolveIcon(undefined)).toBeUndefined();
    });

    it('derives the glyph name from the export name, so a one-word and a multi-word name both resolve', () => {
        expect(resolveIcon('pi-question')).toBe(IconQuestion);
        expect(resolveIcon('pi-calendar-plus')).toBe(IconCalendarPlus);
    });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test src/components/resolveIcon.test.ts`
Expected: FAIL, `Cannot find module './resolveIcon'` and `IconCalendarPlus` not exported.

- [ ] **Step 3: Extend the icon map**

In `src/components/icons.ts`, inside the existing `export { ... } from '@lucide/vue';` block, add these lines in alphabetical order of the export alias (the file is one export per line with a `// pi-name` comment; keep that shape). Replace the existing `CircleQuestionMark as IconQuestion` line with the `MessageCircleQuestionMark` line shown, so the two question icons stop sharing a glyph:

```ts
    ChevronLeft as IconAngleLeft, // pi-angle-left
    ChevronRight as IconAngleRight, // pi-angle-right
    Apple as IconApple, // pi-apple
    ArrowDown as IconArrowDown, // pi-arrow-down
    ArrowLeft as IconArrowLeft, // pi-arrow-left
    Bookmark as IconBookmark, // pi-bookmark
    CalendarPlus as IconCalendarPlus, // pi-calendar-plus
    CircleCheck as IconCheckCircle, // pi-check-circle
    Clock as IconClock, // pi-clock
    Compass as IconCompass, // pi-compass
    Copy as IconCopy, // pi-copy
    MessageCircle as IconDiscord, // pi-discord (lucide ships no brand icons)
    Mail as IconEnvelope, // pi-envelope
    ExternalLink as IconExternalLink, // pi-external-link
    ThumbsUp as IconFacebook, // pi-facebook (lucide ships no brand icons)
    Smile as IconFaceSmile, // pi-face-smile
    FunnelX as IconFilterSlash, // pi-filter-slash
    Search as IconGoogle, // pi-google (lucide ships no brand icons)
    Info as IconInfoCircle, // pi-info-circle
    LockOpen as IconLockOpen, // pi-lock-open
    MapPin as IconMapMarker, // pi-map-marker
    LayoutGrid as IconMicrosoft, // pi-microsoft (lucide ships no brand icons)
    Minus as IconMinus, // pi-minus
    SquarePen as IconPenToSquare, // pi-pen-to-square
    Printer as IconPrint, // pi-print
    MessageCircleQuestionMark as IconQuestion, // pi-question
    RefreshCw as IconRefresh, // pi-refresh
    Save as IconSave, // pi-save
    Shield as IconShield, // pi-shield
    LogOut as IconSignOut, // pi-sign-out
    LoaderCircle as IconSpinner, // pi-spinner
    Tag as IconTag, // pi-tag
    UserPen as IconUserEdit, // pi-user-edit
    UserPlus as IconUserPlus, // pi-user-plus
    Video as IconVideo, // pi-video
```

Also add, for the list and tree components later in this plan (not PrimeIcons names, so the comment says what they are for):

```ts
    ChevronUp as IconAngleUp, // pi-angle-up
    ChevronsDown as IconAngleDoubleDown, // pi-angle-double-down
    ChevronsLeft as IconAngleDoubleLeft, // pi-angle-double-left
    ChevronsRight as IconAngleDoubleRight, // pi-angle-double-right
    ChevronsUp as IconAngleDoubleUp, // pi-angle-double-up
    Ban as IconBan, // pi-ban
    CloudUpload as IconCloudUpload, // pi-cloud-upload
    Maximize as IconWindowMaximize, // pi-window-maximize
    Minimize as IconWindowMinimize, // pi-window-minimize
    Paperclip as IconPaperclip, // pi-paperclip
    Pause as IconPause, // pi-pause
    Play as IconPlay, // pi-play
    RotateCw as IconRotate, // pi-refresh (rotate variant for ImagePreview)
    ZoomIn as IconSearchPlus, // pi-search-plus
    ZoomOut as IconSearchMinus, // pi-search-minus
```

`pi-star-fill` gets no new export: consumers use `IconStar` with `class="fill-current"`, the same way `StarRating` fills its stars. Note that in a comment above the `Star as IconStar` line.

Every bare lucide name above was checked against `node_modules/@lucide/vue/dist/lucide-vue.d.ts` when this plan was written (see the Verified facts); `vue-tsc` re-checks them in Step 6. If one has gone missing after a dependency update, pick the nearest lucide name that does exist and record the substitution in the task report; do not leave the export out.

- [ ] **Step 4: Write the resolver**

Create `src/components/resolveIcon.ts`:

```ts
import type { Component } from 'vue';
import * as icons from '@/components/icons';

// Every export in icons.ts is named after the PrimeIcons glyph it replaces (IconCalendarPlus for
// pi-calendar-plus), so the glyph name is derived from the export name rather than kept in a second
// hand-written table that could drift from the first.
function glyphName(exportName: string): string {
    return exportName
        .slice('Icon'.length)
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase();
}

const byGlyph: ReadonlyMap<string, Component> = new Map(Object.entries(icons).map(([name, component]) => [`pi-${glyphName(name)}`, component as Component]));

// Accepts the class strings the demo data carries ('pi pi-fw pi-inbox') and returns the mapped
// component, so services and menu models keep their string icons untouched.
export function resolveIcon(className: string | undefined): Component | undefined {
    if (!className) return undefined;
    const token = className.split(/\s+/).find((part) => part.startsWith('pi-') && part !== 'pi-fw');
    return token ? byGlyph.get(token) : undefined;
}
```

- [ ] **Step 5: Run the tests**

Run: `bun run test src/components/resolveIcon.test.ts src/components/icons.test.ts`
Expected: PASS, 5 tests (4 new, 1 existing). The icons test still asserts every export starts with `Icon` and renders an `svg`.

- [ ] **Step 6: Verify and commit**

Run `bunx prettier --check src/components/icons.ts src/components/resolveIcon.ts src/components/resolveIcon.test.ts`, then `bun run type-check`, `bun run lint`, `bun run test` (86 tests in 18 files), `bun run build`.

```bash
git add src/components/icons.ts src/components/resolveIcon.ts src/components/resolveIcon.test.ts
```
```bash
git commit -m "feat: extend the icon map for the showcase pages and add resolveIcon"
```

---

### Task 2: DataTable column filters, loading, gridlines, hover, global filter fields

**Files:**
- Create: `src/components/data-table/filters.ts`, `src/components/data-table/DataTableFilterMenu.vue`
- Modify: `src/components/data-table/features.ts`, `src/components/data-table/DataTable.vue`, `src/components/data-table/index.ts`
- Test: `src/components/data-table/filters.test.ts`, `src/components/data-table/DataTable.test.ts`

**Interfaces:**
- Consumes: `createColumns`, `DataTable`, `features` from Plan 1; `IconFilter`, which Task 1 does not add, so this task's Step 4 adds `Funnel as IconFilter, // pi-filter` to `icons.ts` (`Funnel` is in the installed lucide typings).
- Produces: `MatchMode` union, `MatchModeFilterValue`, `matchModeFilter`, `matchModeFns` from `@/components/data-table/filters`; `DataTableColumnMeta` (`filter`, `frozen`, `class`, `headerClass`) typed onto `columnDef.meta`; `DataTable` props `loading`, `showGridlines`, `rowHover`, `globalFilterFields`; slot `loading`; named slots `filter-<columnId>` with `{ value, setValue, matchMode, setMatchMode, apply, clear }`; exposed `clearFilters()`; the inbound `selection` sync.

- [ ] **Step 0: Confirm the TanStack 9 method names used below**

Run these greps; each must print at least one line. They are the APIs the implementation calls, and v9 renamed a few v8 names:

```bash
grep -c 'resetColumnFilters' node_modules/@tanstack/table-core/dist/index.d.ts
grep -c 'getColumnCanGlobalFilter' node_modules/@tanstack/table-core/dist/index.d.ts
grep -rc 'setFilterValue\|getFilterValue\|getIsFiltered' node_modules/@tanstack/table-core/dist/types/ColumnDef.d.ts node_modules/@tanstack/table-core/dist/index.d.ts
```

If `dist/index.d.ts` is not where the declarations live, `grep -rl 'resetColumnFilters' node_modules/@tanstack/table-core/dist` finds the file. If any name is absent, stop and report the v9 name found next to it (`grep -n 'ColumnFilters' <file>`) before continuing; the plan's names come from the v8 to v9 migration guide and the review checks them against what the implementer found.

- [ ] **Step 1: Write the failing filter-function tests**

Create `src/components/data-table/filters.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Row } from '@tanstack/vue-table';
import type { DataTableFeatures } from './features';
import { matchModeFilter, matchModeFns, type MatchModeFilterValue } from './filters';

type AnyRow = Row<DataTableFeatures, Record<string, unknown>>;

function row(cell: unknown): AnyRow {
    return { getValue: () => cell } as unknown as AnyRow;
}

function run(cell: unknown, filter: MatchModeFilterValue): boolean {
    return matchModeFilter(row(cell), 'col', filter);
}

describe('matchModeFns', () => {
    it('text modes are case-insensitive', () => {
        expect(run('James Butt', { matchMode: 'startsWith', value: 'ja' })).toBe(true);
        expect(run('James Butt', { matchMode: 'contains', value: 'BUTT' })).toBe(true);
        expect(run('James Butt', { matchMode: 'notContains', value: 'x' })).toBe(true);
        expect(run('James Butt', { matchMode: 'endsWith', value: 'tt' })).toBe(true);
        expect(run('James Butt', { matchMode: 'equals', value: 'james butt' })).toBe(true);
        expect(run('James Butt', { matchMode: 'notEquals', value: 'james butt' })).toBe(false);
    });

    it('numeric modes compare numbers', () => {
        expect(run(70663, { matchMode: 'equals', value: 70663 })).toBe(true);
        expect(run(5, { matchMode: 'lt', value: 10 })).toBe(true);
        expect(run(10, { matchMode: 'lte', value: 10 })).toBe(true);
        expect(run(11, { matchMode: 'gt', value: 10 })).toBe(true);
        expect(run(10, { matchMode: 'gte', value: 10 })).toBe(true);
        expect(run(50, { matchMode: 'between', value: [0, 100] })).toBe(true);
        expect(run(150, { matchMode: 'between', value: [0, 100] })).toBe(false);
    });

    it('date modes compare calendar days and accept Date or ISO string cells', () => {
        const day = new Date(2020, 4, 15, 13, 0);
        expect(run(new Date(2020, 4, 15, 9, 0), { matchMode: 'dateIs', value: day })).toBe(true);
        expect(run('2020-05-15T00:00:00', { matchMode: 'dateIs', value: day })).toBe(true);
        expect(run(new Date(2020, 4, 16), { matchMode: 'dateIsNot', value: day })).toBe(true);
        expect(run(new Date(2020, 4, 14), { matchMode: 'dateBefore', value: day })).toBe(true);
        expect(run(new Date(2020, 4, 16), { matchMode: 'dateAfter', value: day })).toBe(true);
    });

    it('in matches any of the given options, comparing objects by their fields', () => {
        const amy = { name: 'Amy Elsner', image: 'amyelsner.png' };
        expect(run(amy, { matchMode: 'in', value: [{ name: 'Amy Elsner', image: 'amyelsner.png' }] })).toBe(true);
        expect(run(amy, { matchMode: 'in', value: [{ name: 'Anna Fali', image: 'annafali.png' }] })).toBe(false);
        expect(run('qualified', { matchMode: 'in', value: ['new', 'qualified'] })).toBe(true);
    });

    it('passes every row when the filter value is empty', () => {
        expect(run('anything', { matchMode: 'contains', value: '' })).toBe(true);
        expect(run('anything', { matchMode: 'contains', value: null })).toBe(true);
        expect(run('anything', { matchMode: 'in', value: [] })).toBe(true);
        expect(matchModeFilter(row('anything'), 'col', undefined)).toBe(true);
    });

    it('exposes one function per match mode', () => {
        expect(Object.keys(matchModeFns).sort()).toEqual(['between', 'contains', 'dateAfter', 'dateBefore', 'dateIs', 'dateIsNot', 'endsWith', 'equals', 'gt', 'gte', 'in', 'lt', 'lte', 'notContains', 'notEquals', 'startsWith']);
    });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test src/components/data-table/filters.test.ts`
Expected: FAIL, `Cannot find module './filters'`.

- [ ] **Step 3: Write `filters.ts`**

```ts
import type { FilterFn, Row, RowData } from '@tanstack/vue-table';
import type { DataTableFeatures } from './features';

export type MatchMode = 'startsWith' | 'contains' | 'notContains' | 'endsWith' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte' | 'between' | 'dateIs' | 'dateIsNot' | 'dateBefore' | 'dateAfter';

export interface MatchModeFilterValue {
    matchMode: MatchMode;
    value: unknown;
}

export interface DataTableColumnFilter {
    type: 'text' | 'numeric' | 'date' | 'custom';
    /** Match modes offered in the menu; the first is the default. Omit for the type's default list. */
    matchModes?: MatchMode[];
    /** Hide the match-mode select and keep the first (or only) mode. */
    showMatchModes?: boolean;
    placeholder?: string;
}

export interface DataTableColumnMeta {
    filter?: DataTableColumnFilter;
    frozen?: 'left' | 'right';
    /** Extra classes on every body cell of the column. */
    class?: string;
    headerClass?: string;
}

export const DEFAULT_MATCH_MODES: Record<DataTableColumnFilter['type'], MatchMode[]> = {
    text: ['startsWith', 'contains', 'notContains', 'endsWith', 'equals', 'notEquals'],
    numeric: ['equals', 'notEquals', 'lt', 'lte', 'gt', 'gte'],
    date: ['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter'],
    custom: ['equals']
};

export const MATCH_MODE_LABELS: Record<MatchMode, string> = {
    startsWith: 'Starts with',
    contains: 'Contains',
    notContains: 'Not contains',
    endsWith: 'Ends with',
    equals: 'Equals',
    notEquals: 'Not equals',
    in: 'In',
    lt: 'Less than',
    lte: 'Less than or equal to',
    gt: 'Greater than',
    gte: 'Greater than or equal to',
    between: 'Between',
    dateIs: 'Date is',
    dateIsNot: 'Date is not',
    dateBefore: 'Date is before',
    dateAfter: 'Date is after'
};

type Predicate = (cell: unknown, value: unknown) => boolean;

function text(cell: unknown): string {
    return cell == null ? '' : String(cell).toLowerCase();
}

function num(value: unknown): number {
    return typeof value === 'number' ? value : Number(value);
}

function day(value: unknown): number | null {
    const date = value instanceof Date ? value : typeof value === 'string' || typeof value === 'number' ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

// Objects from a demo service compare by their fields (PrimeVue's `in` used deep equality); primitives by value.
function sameValue(a: unknown, b: unknown): boolean {
    if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') return JSON.stringify(a) === JSON.stringify(b);
    return a === b;
}

const predicates: Record<MatchMode, Predicate> = {
    startsWith: (cell, value) => text(cell).startsWith(text(value)),
    contains: (cell, value) => text(cell).includes(text(value)),
    notContains: (cell, value) => !text(cell).includes(text(value)),
    endsWith: (cell, value) => text(cell).endsWith(text(value)),
    equals: (cell, value) => (typeof cell === 'number' || typeof value === 'number' ? num(cell) === num(value) : text(cell) === text(value)),
    notEquals: (cell, value) => !predicates.equals(cell, value),
    in: (cell, value) => Array.isArray(value) && value.some((option) => sameValue(option, cell)),
    lt: (cell, value) => num(cell) < num(value),
    lte: (cell, value) => num(cell) <= num(value),
    gt: (cell, value) => num(cell) > num(value),
    gte: (cell, value) => num(cell) >= num(value),
    between: (cell, value) => {
        if (!Array.isArray(value) || value.length !== 2) return true;
        const n = num(cell);
        return n >= num(value[0]) && n <= num(value[1]);
    },
    dateIs: (cell, value) => day(cell) !== null && day(cell) === day(value),
    dateIsNot: (cell, value) => day(cell) !== null && day(cell) !== day(value),
    dateBefore: (cell, value) => {
        const a = day(cell);
        const b = day(value);
        return a !== null && b !== null && a < b;
    },
    dateAfter: (cell, value) => {
        const a = day(cell);
        const b = day(value);
        return a !== null && b !== null && a > b;
    }
};

function isEmpty(value: unknown): boolean {
    return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

export const matchModeFns: Record<MatchMode, FilterFn<DataTableFeatures, RowData>> = Object.fromEntries(
    (Object.keys(predicates) as MatchMode[]).map((mode) => [mode, (row: Row<DataTableFeatures, RowData>, columnId: string, value: unknown) => predicates[mode](row.getValue(columnId), value)])
) as Record<MatchMode, FilterFn<DataTableFeatures, RowData>>;

// One TanStack filter function per column; the match mode travels inside the filter value so the
// menu can change it at runtime without swapping the column definition.
export const matchModeFilter: FilterFn<DataTableFeatures, RowData> = (row, columnId, filterValue: MatchModeFilterValue | undefined) => {
    if (!filterValue || isEmpty(filterValue.value)) return true;
    return predicates[filterValue.matchMode](row.getValue(columnId), filterValue.value);
};
```

If `FilterFn` in the installed typings takes a different generic arity than `<DataTableFeatures, RowData>` (Step 0 shows the declaration), match the declaration and keep the two exports' names; `vue-tsc` is the check.

- [ ] **Step 4: Register the functions and the typed meta in `features.ts`**

Replace `src/components/data-table/features.ts` with:

```ts
import {
    columnFilteringFeature,
    columnPinningFeature,
    columnVisibilityFeature,
    createExpandedRowModel,
    createFilteredRowModel,
    createGroupedRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    filterFn_includesString,
    globalFilteringFeature,
    rowExpandingFeature,
    rowGroupingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    sortFn_basic,
    sortFn_text,
    tableFeatures
} from '@tanstack/vue-table';
import type { DataTableColumnMeta } from './filters';
import { matchModeFilter } from './filters';

// One feature set for every table in the template. TanStack v9 only ships the code for the
// features listed here, so adding a capability means adding it in this one place.
export const features = tableFeatures({
    columnFilteringFeature,
    columnPinningFeature,
    columnVisibilityFeature,
    globalFilteringFeature,
    rowExpandingFeature,
    rowGroupingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    expandedRowModel: createExpandedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    groupedRowModel: createGroupedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
    filterFns: { includesString: filterFn_includesString, matchMode: matchModeFilter },
    sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text },
    // Type-only: makes `columnDef.meta` carry DataTableColumnMeta for every consumer of createColumns().
    columnMeta: {} as DataTableColumnMeta
});

export type DataTableFeatures = typeof features;
```

`filters.ts` imports the `DataTableFeatures` type from `features.ts` and `features.ts` imports `matchModeFilter` from `filters.ts`. That is a type-only cycle on one side (`import type`) and is legal; if `vue-tsc` reports an implicit-any on `matchModeFilter` because of the cycle, type `matchModeFilter` as `FilterFn<any, any>` with a comment naming this cycle as the reason, and keep the test.

Add `Funnel as IconFilter, // pi-filter` to `src/components/icons.ts` (alphabetical position). Export the new types from `src/components/data-table/index.ts`:

```ts
export type { DataTableColumnFilter, DataTableColumnMeta, MatchMode, MatchModeFilterValue } from './filters';
export { DEFAULT_MATCH_MODES, MATCH_MODE_LABELS } from './filters';
```

- [ ] **Step 5: Run the filter tests**

Run: `bun run test src/components/data-table/filters.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 6: Write the failing DataTable tests**

Append to `src/components/data-table/DataTable.test.ts` (inside the existing `describe`), and extend the fixture at the top of the file so the columns carry filter meta and a date column:

Replace the `columns` and `products` fixtures with:

```ts
interface Product extends Record<string, unknown> {
    id: string;
    name: string;
    price: number;
    added: Date;
    children?: Product[];
}

const helper = createColumns<Product>();
const columns = helper.columns([
    helper.accessor('name', { header: 'Name', meta: { filter: { type: 'text' } } }),
    helper.accessor('price', { header: 'Price', cell: (ctx) => `$${ctx.getValue()}`, meta: { filter: { type: 'numeric', matchModes: ['gt', 'lt'] } } }),
    helper.accessor('added', { header: 'Added', cell: (ctx) => ctx.getValue().toDateString(), enableGlobalFilter: false, meta: { filter: { type: 'custom' } } })
]);

const products: Product[] = [
    { id: '1', name: 'banana', price: 3, added: new Date(2024, 0, 1), children: [{ id: '1a', name: 'banana child', price: 1, added: new Date(2024, 0, 2) }] },
    { id: '2', name: 'apple', price: 5, added: new Date(2024, 1, 1) },
    { id: '3', name: 'cherry', price: 2, added: new Date(2024, 2, 1) },
    { id: '4', name: 'date', price: 9, added: new Date(2024, 3, 1) },
    { id: '5', name: 'elder', price: 4, added: new Date(2024, 4, 1) }
];

type Exposed = { visibleRows: () => Product[]; selectedRows: () => Product[]; clearFilters: () => void };
```

The existing sort test clicks `thead th button` index 0; with a filter trigger now also a `button` in the header, change that selector to `[data-slot=data-table-sort]` (the sort button gets that attribute in Step 8) and keep the rest of the existing tests unchanged. Then add:

```ts
    it('filters a text column from the header menu and clears it', async () => {
        const wrapper = make({ paginator: false }, {}, { attachTo: document.body });
        await wrapper.get('[aria-label="Filter Name"]').trigger('click');
        const input = document.body.querySelector<HTMLInputElement>('[data-slot=data-table-filter-value]')!;
        input.value = 'an';
        input.dispatchEvent(new Event('input'));
        await nextTick();
        document.body.querySelector<HTMLButtonElement>('[data-slot=data-table-filter-apply]')!.click();
        await nextTick();
        expect(wrapper.findAll('tbody tr').map((r) => r.text())).toEqual([expect.stringContaining('banana')]);
        expect(wrapper.get('[aria-label="Filter Name"]').attributes('data-active')).toBe('true');
        (wrapper.vm as unknown as Exposed).clearFilters();
        await nextTick();
        expect(wrapper.findAll('tbody tr')).toHaveLength(5);
        wrapper.unmount();
    });

    it('changes the match mode from the menu select', async () => {
        const wrapper = make({ paginator: false }, {}, { attachTo: document.body });
        await wrapper.get('[aria-label="Filter Price"]').trigger('click');
        const select = document.body.querySelector<HTMLSelectElement>('[data-slot=data-table-filter-mode]')!;
        expect(Array.from(select.options).map((o) => o.value)).toEqual(['gt', 'lt']);
        select.value = 'lt';
        select.dispatchEvent(new Event('change'));
        const input = document.body.querySelector<HTMLInputElement>('[data-slot=data-table-filter-value]')!;
        input.value = '4';
        input.dispatchEvent(new Event('input'));
        await nextTick();
        document.body.querySelector<HTMLButtonElement>('[data-slot=data-table-filter-apply]')!.click();
        await nextTick();
        expect(wrapper.findAll('tbody tr').map((r) => r.text().includes('$'))).toHaveLength(2);
        wrapper.unmount();
    });

    it('renders a custom filter slot with the apply and clear callbacks', async () => {
        const wrapper = mount(DataTable<Product>, {
            props: { columns, data: products, rowKey: 'id' },
            slots: {
                'filter-added': `<template #filter-added="{ value, setValue, apply }"><button data-testid="pick" @click="setValue(new Date(2024, 3, 1)); apply()">pick</button></template>`
            },
            attachTo: document.body
        });
        await wrapper.get('[aria-label="Filter Added"]').trigger('click');
        document.body.querySelector<HTMLButtonElement>('[data-testid=pick]')!.click();
        await nextTick();
        expect(wrapper.findAll('tbody tr')).toHaveLength(1);
        expect(wrapper.findAll('tbody tr')[0]!.text()).toContain('date');
        wrapper.unmount();
    });

    it('limits the global filter to globalFilterFields', async () => {
        const wrapper = make({ paginator: false, globalFilter: '3', globalFilterFields: ['name'] });
        await nextTick();
        expect(wrapper.findAll('tbody tr')).toHaveLength(0);
        await wrapper.setProps({ globalFilterFields: ['name', 'price'] });
        await nextTick();
        expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    });

    it('shows the loading slot over the body and gridline and hover classes on request', () => {
        const loading = make({ loading: true }, { loading: 'Loading customers.' });
        expect(loading.get('[data-slot=data-table-loading]').text()).toBe('Loading customers.');
        const styled = make({ showGridlines: true, rowHover: true });
        expect(styled.get('[data-slot=data-table]').attributes('data-gridlines')).toBe('true');
        expect(styled.get('[data-slot=data-table]').attributes('data-row-hover')).toBe('true');
    });

    it('checks rows that the parent puts in the selection model', async () => {
        const wrapper = make({ selectable: true, selection: [products[1]] });
        await nextTick();
        expect(wrapper.findAll('tbody tr[data-state=selected]')).toHaveLength(1);
        expect(wrapper.findAll('tbody tr[data-state=selected]')[0]!.text()).toContain('apple');
        expect((wrapper.vm as unknown as Exposed).selectedRows().map((p) => p.name)).toEqual(['apple']);
    });
```

`make` gains a third parameter: `function make(extra = {}, slots = {}, options: { attachTo?: Element } = {})` spreading `...options` into `mount`. The menu content is portaled to `document.body`, which is why those tests attach and query `document.body`.

- [ ] **Step 7: Run to verify the new tests fail**

Run: `bun run test src/components/data-table/DataTable.test.ts`
Expected: the six new tests FAIL (`[aria-label="Filter Name"]` not found, `clearFilters` not a function, `data-slot=data-table-loading` not found, no selected row); the original nine still pass except the sort test, which fails until Step 8 adds `data-slot="data-table-sort"`.

- [ ] **Step 8: Write the filter menu**

Create `src/components/data-table/DataTableFilterMenu.vue`:

```vue
<script setup lang="ts" generic="TData extends Record<string, unknown>">
    import type { Column } from '@tanstack/vue-table';
    import { computed, ref, watch } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { IconFilter } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import type { DataTableFeatures } from './features';
    import { DEFAULT_MATCH_MODES, MATCH_MODE_LABELS, type DataTableColumnFilter, type MatchMode, type MatchModeFilterValue } from './filters';

    const props = defineProps<{
        column: Column<DataTableFeatures, TData>;
        filter: DataTableColumnFilter;
        label: string;
    }>();

    const modes = computed<MatchMode[]>(() => props.filter.matchModes ?? DEFAULT_MATCH_MODES[props.filter.type]);
    const showModes = computed(() => props.filter.showMatchModes !== false && modes.value.length > 1);

    // The draft lives here until Apply, matching PrimeVue's menu display where typing does not filter.
    const open = ref(false);
    const draftMode = ref<MatchMode>(modes.value[0]!);
    const draftValue = ref<unknown>(undefined);

    function current(): MatchModeFilterValue | undefined {
        return props.column.getFilterValue() as MatchModeFilterValue | undefined;
    }

    watch(open, (isOpen) => {
        if (!isOpen) return;
        const applied = current();
        draftMode.value = applied?.matchMode ?? modes.value[0]!;
        draftValue.value = applied?.value;
    });

    function setValue(value: unknown): void {
        draftValue.value = value;
    }

    function setMatchMode(mode: MatchMode): void {
        draftMode.value = mode;
    }

    function apply(): void {
        const empty = draftValue.value === undefined || draftValue.value === null || draftValue.value === '' || (Array.isArray(draftValue.value) && draftValue.value.length === 0);
        props.column.setFilterValue(empty ? undefined : { matchMode: draftMode.value, value: draftValue.value });
        open.value = false;
    }

    function clear(): void {
        draftValue.value = undefined;
        draftMode.value = modes.value[0]!;
        props.column.setFilterValue(undefined);
        open.value = false;
    }

    function onInput(event: Event): void {
        const raw = (event.target as HTMLInputElement).value;
        setValue(props.filter.type === 'numeric' ? (raw === '' ? '' : Number(raw)) : raw);
    }

    const active = computed(() => props.column.getIsFiltered());
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button variant="ghost" size="icon-xs" :aria-label="`Filter ${props.label}`" :data-active="active || undefined" :class="cn(active && 'text-primary')">
                <IconFilter class="size-3.5" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="start" class="flex w-56 flex-col gap-3" data-slot="data-table-filter-menu">
            <select v-if="showModes" v-model="draftMode" class="h-8 rounded-lg border border-input bg-background px-2 text-sm" data-slot="data-table-filter-mode" @change="setMatchMode(($event.target as HTMLSelectElement).value as MatchMode)">
                <option v-for="mode in modes" :key="mode" :value="mode">{{ MATCH_MODE_LABELS[mode] }}</option>
            </select>
            <slot :value="draftValue" :set-value="setValue" :match-mode="draftMode" :set-match-mode="setMatchMode" :apply="apply" :clear="clear">
                <Input v-if="props.filter.type === 'text' || props.filter.type === 'numeric'" :type="props.filter.type === 'numeric' ? 'number' : 'text'" :model-value="(draftValue as string | number | undefined) ?? ''" :placeholder="props.filter.placeholder ?? `Search by ${props.label.toLowerCase()}`" data-slot="data-table-filter-value" @input="onInput" />
            </slot>
            <div class="flex justify-between gap-2">
                <Button variant="outline" size="sm" data-slot="data-table-filter-clear" @click="clear">Clear</Button>
                <Button size="sm" data-slot="data-table-filter-apply" @click="apply">Apply</Button>
            </div>
        </PopoverContent>
    </Popover>
</template>
```

The native `<select>` is deliberate: a Reka `Select` inside a Reka `Popover` nests two portaled layers and the test would need to drive two popups. The native element is keyboard accessible and styled with the same tokens.

- [ ] **Step 9: Wire the menu, the props and the selection sync into `DataTable.vue`**

Edit `src/components/data-table/DataTable.vue`:

1. Imports: add `DataTableFilterMenu from './DataTableFilterMenu.vue'`, `type ColumnFiltersState` from `@tanstack/vue-table`, `useSlots` from `vue`, and `type DataTableColumnMeta` from `./filters`.
2. Props: add `loading?: boolean`, `showGridlines?: boolean`, `rowHover?: boolean`, `globalFilterFields?: string[]` (defaults `false`, `false`, `false`, `undefined`).
3. State: `const columnFilters = ref<ColumnFiltersState>([]);` and in `useTable` options add `get columnFilters() { return columnFilters.value; }` under `state`, `onColumnFiltersChange: (updater) => apply(columnFilters, updater)`, and `getColumnCanGlobalFilter: (column) => (props.globalFilterFields ? props.globalFilterFields.includes(column.id) : column.columnDef.enableGlobalFilter !== false)`.
4. `allColumns`: columns whose `meta?.filter` is set and that have no `filterFn` get `filterFn: 'matchMode'`:

```ts
    const allColumns = computed(() => {
        const withFilters = props.columns.map((column) => {
            const meta = column.meta as DataTableColumnMeta | undefined;
            return meta?.filter && !column.filterFn ? { ...column, filterFn: 'matchMode' as const } : column;
        });
        return props.selectable ? [selectionColumn, ...withFilters] : withFilters;
    });
```

5. Selection inbound sync (Plan 2 deferral): replace the `watch(selection, ...)` with one that mirrors the model into TanStack by row id, both ways, without echo loops:

```ts
    // Rows are keyed by rowKey on both sides, so a parent can pre-select or extend the model and see the checkboxes follow.
    watch(
        selection,
        (value) => {
            const next: RowSelectionState = {};
            for (const row of value ?? []) next[String(row[props.rowKey])] = true;
            const same = Object.keys(next).length === Object.keys(rowSelection.value).length && Object.keys(next).every((key) => rowSelection.value[key]);
            if (!same) rowSelection.value = next;
        },
        { immediate: true, deep: true }
    );
```

Keep the existing `watch(rowSelection, ...)` that writes `selection.value` from `table.getSelectedRowModel()`.

6. Expose `clearFilters`:

```ts
    function clearFilters(): void {
        table.resetColumnFilters();
        globalFilter.value = '';
    }
```

and add `clearFilters` to `defineExpose`.

7. Template: the root `div` gains `:data-gridlines="props.showGridlines || undefined"` and `:data-row-hover="props.rowHover || undefined"` and these classes on the `Table` wrapper: `cn('overflow-x-auto rounded-lg border', props.showGridlines && '[&_td]:border [&_th]:border')`; `TableRow` in the body gains `:class="cn(props.rowHover && 'hover:bg-muted/50')"`. Header cells: wrap the existing sort button and add the menu:

```vue
<TableHead v-for="header in headerGroup.headers" :key="header.id" :class="(header.column.columnDef.meta as DataTableColumnMeta | undefined)?.headerClass">
    <div v-if="!header.isPlaceholder" class="flex items-center gap-1">
        <Button v-if="header.column.getCanSort()" variant="ghost" size="sm" class="-ml-2" data-slot="data-table-sort" @click="header.column.toggleSorting(header.column.getIsSorted() === 'asc')">
            <FlexRender :header="header" />
            <ArrowUp v-if="header.column.getIsSorted() === 'asc'" />
            <ArrowDown v-else-if="header.column.getIsSorted() === 'desc'" />
            <ArrowUpDown v-else class="opacity-50" />
        </Button>
        <FlexRender v-else :header="header" />
        <DataTableFilterMenu v-if="filterOf(header.column)" :column="header.column" :filter="filterOf(header.column)!" :label="headerLabel(header)">
            <template v-if="slots[`filter-${header.column.id}`]" #default="scope">
                <slot :name="`filter-${header.column.id}`" v-bind="scope" />
            </template>
        </DataTableFilterMenu>
    </div>
</TableHead>
```

with, in the script:

```ts
    const slots = useSlots();
    function filterOf(column: Column<DataTableFeatures, TData>): DataTableColumnMeta['filter'] | undefined {
        return (column.columnDef.meta as DataTableColumnMeta | undefined)?.filter;
    }
    function headerLabel(header: Header<DataTableFeatures, TData, unknown>): string {
        return typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id;
    }
```

(import `Column` and `Header` types from `@tanstack/vue-table`). Body cells gain `:class="(cell.column.columnDef.meta as DataTableColumnMeta | undefined)?.class"`.

8. Loading: inside `TableBody`, before the empty row:

```vue
<TableRow v-if="props.loading">
    <TableCell :colspan="allColumns.length" class="py-8 text-center text-muted-foreground" data-slot="data-table-loading"><slot name="loading">Loading.</slot></TableCell>
</TableRow>
```

and the empty and data rows get `v-else-if` / `v-else` so a loading table shows only the loading row.

- [ ] **Step 10: Run the DataTable tests**

Run: `bun run test src/components/data-table`
Expected: PASS, 21 tests (6 filter-function tests, 15 DataTable tests).

- [ ] **Step 11: Verify and commit**

Run `bunx prettier --check` on the five changed or new files, then `bun run type-check`, `bun run lint`, `bun run test` (98 tests in 19 files), `bun run build`.

```bash
git add src/components/data-table src/components/icons.ts
```
```bash
git commit -m "feat: add column filter menus, loading and gridline options to DataTable"
```

---

### Task 3: DataTable frozen columns, scroll height, expansion slot, grouping

**Files:**
- Create: `src/components/Paginator.vue`
- Modify: `src/components/data-table/DataTable.vue`
- Test: `src/components/data-table/DataTable.test.ts`

**Interfaces:**
- Consumes: `columnPinningFeature`, `rowGroupingFeature`, `createGroupedRowModel` (registered in Task 2), `DataTableColumnMeta.frozen`.
- Produces: `DataTable` props `scrollHeight?: string`, `expandable?: boolean`, `groupBy?: string`, `initialSorting?: { id: string; desc: boolean }[]`; slots `expansion` (`{ row }`), `groupHeader` (`{ row, value, count }`), `groupFooter` (`{ row, value, count }`); exposed `expandAll()`, `collapseAll()`; `Paginator` component with props `page` (0-based), `pageCount`, `pageSize`, `pageSizeOptions`, `total`, `reportTemplate` and emits `update:page`, `update:pageSize`.

- [ ] **Step 0: Confirm the pinning and grouping method names**

```bash
grep -rc 'getIsPinned\|getStart\|getAfter\|getIsGrouped\|toggleAllRowsExpanded\|getRowCanExpand\|getLeftVisibleCells' node_modules/@tanstack/table-core/dist/index.d.ts
```

Expected: a non-zero count. If `getStart`/`getAfter` are absent in v9, `grep -n 'Pinned' node_modules/@tanstack/table-core/dist/index.d.ts` lists the offset helper that replaced them (v9 documents `column.getStart('left')` and `column.getAfter('right')`); use that name and say so in the report.

- [ ] **Step 1: Write the failing tests**

Append to `DataTable.test.ts`:

```ts
    it('pins frozen columns with sticky offsets and marks them', () => {
        const frozenColumns = helper.columns([
            helper.accessor('name', { header: 'Name', meta: { frozen: 'left' } }),
            helper.accessor('price', { header: 'Price' }),
            helper.accessor('added', { header: 'Added', cell: (ctx) => ctx.getValue().toDateString(), meta: { frozen: 'right' } })
        ]);
        const wrapper = mount(DataTable<Product>, { props: { columns: frozenColumns, data: products, rowKey: 'id', scrollHeight: '200px' } });
        const heads = wrapper.findAll('thead th');
        expect(heads[0]!.attributes('data-pinned')).toBe('left');
        expect(heads[2]!.attributes('data-pinned')).toBe('right');
        expect(heads[1]!.attributes('data-pinned')).toBeUndefined();
        expect(heads[0]!.attributes('style')).toContain('left: 0px');
        expect(wrapper.get('[data-slot=data-table-scroller]').attributes('style')).toContain('max-height: 200px');
        expect(wrapper.findAll('tbody tr')[0]!.findAll('td')[0]!.attributes('data-pinned')).toBe('left');
    });

    it('renders the expansion slot for expanded rows and toggles all rows', async () => {
        const wrapper = mount(DataTable<Product>, {
            props: { columns, data: products, rowKey: 'id', expandable: true },
            slots: { expansion: `<template #expansion="{ row }"><div data-testid="expansion">Orders for {{ row.name }}</div></template>` }
        });
        expect(wrapper.findAll('[data-testid=expansion]')).toHaveLength(0);
        await wrapper.findAll('[aria-label="Expand row"]')[1]!.trigger('click');
        expect(wrapper.findAll('[data-testid=expansion]')).toHaveLength(1);
        expect(wrapper.get('[data-testid=expansion]').text()).toBe('Orders for apple');
        (wrapper.vm as unknown as Exposed & { expandAll: () => void; collapseAll: () => void }).expandAll();
        await nextTick();
        expect(wrapper.findAll('[data-testid=expansion]')).toHaveLength(5);
        (wrapper.vm as unknown as Exposed & { expandAll: () => void; collapseAll: () => void }).collapseAll();
        await nextTick();
        expect(wrapper.findAll('[data-testid=expansion]')).toHaveLength(0);
    });

    it('groups rows under header and footer rows when groupBy is set', () => {
        interface Sale extends Record<string, unknown> {
            id: string;
            rep: string;
            amount: number;
        }
        const saleHelper = createColumns<Sale>();
        const saleColumns = saleHelper.columns([saleHelper.accessor('rep', { header: 'Rep' }), saleHelper.accessor('amount', { header: 'Amount' })]);
        const sales: Sale[] = [
            { id: '1', rep: 'Amy', amount: 10 },
            { id: '2', rep: 'Bob', amount: 20 },
            { id: '3', rep: 'Amy', amount: 30 }
        ];
        const wrapper = mount(DataTable<Sale>, {
            props: { columns: saleColumns, data: sales, rowKey: 'id', groupBy: 'rep', initialSorting: [{ id: 'rep', desc: false }] },
            slots: {
                groupHeader: `<template #groupHeader="{ value, count }"><span data-testid="group-header">{{ value }} ({{ count }})</span></template>`,
                groupFooter: `<template #groupFooter="{ count }"><span data-testid="group-footer">Total: {{ count }}</span></template>`
            }
        });
        expect(wrapper.findAll('[data-testid=group-header]').map((h) => h.text())).toEqual(['Amy (2)', 'Bob (1)']);
        expect(wrapper.findAll('[data-testid=group-footer]').map((f) => f.text())).toEqual(['Total: 2', 'Total: 1']);
        const bodyRows = wrapper.findAll('tbody tr');
        expect(bodyRows).toHaveLength(7);
        expect(bodyRows[1]!.text()).toContain('10');
        expect(bodyRows[2]!.text()).toContain('30');
    });
```

- [ ] **Step 2: Run to verify they fail**

Run: `bun run test src/components/data-table/DataTable.test.ts`
Expected: the three new tests FAIL (`data-pinned` undefined, `expandAll` not a function, no group headers).

- [ ] **Step 3: Extract the paginator**

Create `src/components/Paginator.vue` with the markup that currently lives at the bottom of `DataTable.vue`, driven by props instead of the table instance:

```vue
<script setup lang="ts">
    import { computed } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { IconAngleDoubleLeft, IconAngleDoubleRight, IconAngleLeft, IconAngleRight } from '@/components/icons';

    const props = withDefaults(
        defineProps<{
            pageCount: number;
            total: number;
            pageSizeOptions?: number[];
            reportTemplate?: string;
        }>(),
        { pageSizeOptions: () => [5, 10, 25], reportTemplate: 'Showing {first} to {last} of {totalRecords} entries' }
    );

    const page = defineModel<number>('page', { default: 0 });
    const pageSize = defineModel<number>('pageSize', { default: 10 });

    const report = computed(() => {
        const first = props.total === 0 ? 0 : page.value * pageSize.value + 1;
        const last = Math.min(props.total, (page.value + 1) * pageSize.value);
        return props.reportTemplate.replace('{first}', String(first)).replace('{last}', String(last)).replace('{totalRecords}', String(props.total));
    });

    // Five page links centred on the current page, clamped to the ends, as PrimeVue's paginator does.
    const pageLinks = computed(() => {
        const start = Math.max(0, Math.min(page.value - 2, props.pageCount - 5));
        const end = Math.min(props.pageCount, start + 5);
        return Array.from({ length: Math.max(0, end - start) }, (_, index) => start + index);
    });

    const canPrevious = computed(() => page.value > 0);
    const canNext = computed(() => page.value < props.pageCount - 1);

    function onPageSize(value: unknown): void {
        const size = Number(value);
        if (Number.isFinite(size) && size > 0) {
            pageSize.value = size;
            page.value = 0;
        }
    }
</script>

<template>
    <div class="flex flex-wrap items-center justify-between gap-2 pt-4" data-slot="paginator">
        <span class="text-sm text-muted-foreground" data-testid="data-table-report">{{ report }}</span>
        <div class="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="First page" :disabled="!canPrevious" @click="page = 0"><IconAngleDoubleLeft /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Previous page" :disabled="!canPrevious" @click="page = page - 1"><IconAngleLeft /></Button>
            <Button v-for="link in pageLinks" :key="link" :variant="link === page ? 'default' : 'ghost'" size="icon-sm" :aria-label="`Page ${link + 1}`" @click="page = link">{{ link + 1 }}</Button>
            <Button variant="ghost" size="icon-sm" aria-label="Next page" :disabled="!canNext" @click="page = page + 1"><IconAngleRight /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Last page" :disabled="!canNext" @click="page = Math.max(0, props.pageCount - 1)"><IconAngleDoubleRight /></Button>
            <Select :model-value="String(pageSize)" @update:model-value="onPageSize">
                <SelectTrigger class="w-20" aria-label="Rows per page"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="size in props.pageSizeOptions" :key="size" :value="String(size)">{{ size }}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
</template>
```

In `DataTable.vue`, delete the `report`, `pageLinks` and `onPageSize` code and the paginator markup, and render instead:

```vue
<Paginator v-if="props.paginator" :page="pagination.pageIndex" :page-size="pagination.pageSize" :page-count="table.getPageCount()" :total="totalRows" :page-size-options="props.pageSizeOptions" :report-template="props.reportTemplate" @update:page="table.setPageIndex($event)" @update:page-size="table.setPageSize($event)" />
```

The existing pagination tests (report text, next and last page, rows-per-page) are the regression check for this extraction; the lucide `ChevronLeft` and friends imported directly in `DataTable.vue` go, replaced by the icon map names (`IconAngleDoubleLeft` and friends from Task 1). Keep `ArrowUp`, `ArrowDown`, `ArrowUpDown` for the sort glyphs but move them to the icon map too: add `ArrowUpDown as IconSort, // pi-sort-alt` and `ArrowDown as IconSortDown` is already `IconArrowDown`; use `IconArrowUp`, `IconArrowDown`, `IconSort`.

- [ ] **Step 4: Frozen columns and scroll height**

In `DataTable.vue`:

```ts
    // Pinning state is derived from column meta, not user-driven, so it is a computed rather than a ref.
    const columnPinning = computed<ColumnPinningState>(() => {
        const left: string[] = [];
        const right: string[] = [];
        for (const column of allColumns.value) {
            const frozen = (column.meta as DataTableColumnMeta | undefined)?.frozen;
            const id = column.id ?? ('accessorKey' in column && typeof column.accessorKey === 'string' ? column.accessorKey : undefined);
            if (frozen === 'left' && id) left.push(id);
            if (frozen === 'right' && id) right.push(id);
        }
        if (props.selectable) left.unshift('__select');
        return { left, right };
    });
    const hasFrozen = computed(() => columnPinning.value.left.length + columnPinning.value.right.length > (props.selectable ? 1 : 0));

    function pinStyle(column: Column<DataTableFeatures, TData>): Record<string, string> | undefined {
        if (!hasFrozen.value) return undefined;
        const pinned = column.getIsPinned();
        if (pinned === 'left') return { left: `${column.getStart('left')}px`, minWidth: `${column.getSize()}px` };
        if (pinned === 'right') return { right: `${column.getAfter('right')}px`, minWidth: `${column.getSize()}px` };
        return { minWidth: `${column.getSize()}px` };
    }
```

Add `get columnPinning() { return columnPinning.value; }` to `state` (import `ColumnPinningState`). Every `TableHead` and `TableCell` gets `:data-pinned="cell.column.getIsPinned() || undefined"`, `:style="pinStyle(cell.column)"` and the class `cn(pinned && 'sticky z-10 bg-card')`. The scroll wrapper becomes `<div data-slot="data-table-scroller" :class="cn('overflow-auto rounded-lg border', props.scrollHeight && '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-20 [&_thead]:bg-card')" :style="props.scrollHeight ? { maxHeight: props.scrollHeight } : undefined">`. TanStack orders headers and `row.getVisibleCells()` left-pinned, centre, right-pinned once the pinning feature is on, which is what the test's `heads[0]` and `heads[2]` assertions rely on.

- [ ] **Step 5: Expansion slot, expand and collapse all**

Props: `expandable?: boolean` (default `false`). Table options: `getRowCanExpand: (row) => props.expandable || (props.subRowsKey ? (row.subRows?.length ?? 0) > 0 : false)`. The existing chevron already renders when `row.getCanExpand()`. After each data `TableRow`, render:

```vue
<TableRow v-if="props.expandable && row.getIsExpanded()" :key="`${row.id}-expansion`" data-slot="data-table-expansion">
    <TableCell :colspan="allColumns.length" class="bg-muted/30 p-0"><slot name="expansion" :row="row.original" /></TableCell>
</TableRow>
```

Because `v-for` with two sibling rows per item needs a wrapping `<template v-for>`, change the body loop to `<template v-for="row in bodyRows" :key="row.id">` containing both rows. Expose:

```ts
    function expandAll(): void {
        table.toggleAllRowsExpanded(true);
    }
    function collapseAll(): void {
        table.toggleAllRowsExpanded(false);
    }
```

- [ ] **Step 6: Grouping**

Props: `groupBy?: string`, `initialSorting?: SortingState` (default `() => []`), and `sorting` initialises from it: `const sorting = ref<SortingState>(props.initialSorting);`. State: `get grouping() { return props.groupBy ? [props.groupBy] : []; }`. When grouping, every group must be expanded so the leaves render: `get expanded() { return props.groupBy ? true : expanded.value; }` (TanStack accepts `true` for "all"). Rendering: the body iterates `sections`:

```ts
    interface Section {
        header?: { row: TData; value: unknown; count: number };
        rows: Row<DataTableFeatures, TData>[];
    }
    // With groupBy set, the row model is [group, leaf, leaf, group, leaf, ...]; without it, one section of plain rows.
    const sections = computed<Section[]>(() => {
        const rows = table.getRowModel().rows;
        if (!props.groupBy) return [{ rows }];
        return rows
            .filter((row) => row.getIsGrouped())
            .map((group) => ({ header: { row: group.subRows[0]!.original, value: group.getValue(props.groupBy!), count: group.subRows.length }, rows: group.subRows }));
    });
```

The template renders, per section, an optional header row (`data-slot="data-table-group-header"`, one cell with `:colspan`, `<slot name="groupHeader" v-bind="section.header" />`), then the rows, then an optional footer row (`data-slot="data-table-group-footer"`, `<slot name="groupFooter" v-bind="section.header" />`) rendered only when `slots.groupFooter` exists. The empty and loading rows stay above the sections. `getRowModel()` with `paginator` and `groupBy` together is out of scope: document in a comment that grouping ignores pagination (PrimeVue's grouping demo has none).

- [ ] **Step 7: Run the tests**

Run: `bun run test src/components/data-table`
Expected: PASS, 24 tests.

- [ ] **Step 8: Verify and commit**

Run `bunx prettier --check src/components/Paginator.vue src/components/data-table/DataTable.vue src/components/data-table/DataTable.test.ts src/components/icons.ts`, then `bun run type-check`, `bun run lint`, `bun run test` (101 tests in 19 files), `bun run build`.

```bash
git add src/components/Paginator.vue src/components/data-table src/components/icons.ts
```
```bash
git commit -m "feat: add frozen columns, expansion rows and grouping to DataTable and extract Paginator"
```

---

### Task 4: `Tree` and `TreeSelect`

**Files:**
- Create: `src/components/tree/model.ts`, `src/components/tree/Tree.vue`, `src/components/tree/TreeSelect.vue`, `src/components/tree/index.ts`
- Test: `src/components/tree/model.test.ts`, `src/components/tree/Tree.test.ts`, `src/components/tree/TreeSelect.test.ts`

**Interfaces:**
- Consumes: Reka `TreeRoot`, `TreeItem` (props and slot shape in the Verified facts); `Checkbox`, `Input`, `Popover*`, `Button` from `src/components/ui`; `resolveIcon` (Task 1); `IconAngleRight`, `IconAngleDown`, `IconSearch`.
- Produces from `@/components/tree`: `Tree` with props `value: TreeNodeLike[]`, `selectionMode?: 'single' | 'multiple' | 'checkbox'`, `filter?: boolean`, `filterPlaceholder?: string`, models `v-model:selectionKeys` (`TreeSelectionKeys`) and `v-model:expandedKeys` (`Record<string, boolean>`), emits `node-select` and `node-unselect` (`{ node }`); `TreeSelect` with props `options: TreeNodeLike[]`, `selectionMode` (same union), `placeholder?: string`, `filter?: boolean`, model `v-model` (`TreeSelectionKeys`); types `TreeNodeLike`, `TreeSelectionKeys`, `CheckboxSelection`; pure helpers `flattenKeys`, `checkboxSelection`, `filterTree`.

- [ ] **Step 1: Write the failing model tests**

Create `src/components/tree/model.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { checkboxSelection, filterTree, findNode, selectedKeys, type TreeNodeLike } from './model';

const nodes: TreeNodeLike[] = [
    {
        key: '0',
        label: 'Documents',
        children: [
            { key: '0-0', label: 'Work', children: [{ key: '0-0-0', label: 'Expenses.doc' }, { key: '0-0-1', label: 'Resume.doc' }] },
            { key: '0-1', label: 'Home', children: [{ key: '0-1-0', label: 'Invoices.txt' }] }
        ]
    },
    { key: '1', label: 'Events', children: [{ key: '1-0', label: 'Meeting' }] }
];

describe('tree model helpers', () => {
    it('finds a node by key at any depth', () => {
        expect(findNode(nodes, '0-1-0')?.label).toBe('Invoices.txt');
        expect(findNode(nodes, 'missing')).toBeUndefined();
    });

    it('marks a parent checked when every leaf below it is checked and partial when some are', () => {
        const all = checkboxSelection(nodes, new Set(['0-0-0', '0-0-1', '0-1-0']));
        expect(all['0']).toEqual({ checked: true, partialChecked: false });
        expect(all['0-0']).toEqual({ checked: true, partialChecked: false });
        const some = checkboxSelection(nodes, new Set(['0-0-0']));
        expect(some['0-0']).toEqual({ checked: false, partialChecked: true });
        expect(some['0']).toEqual({ checked: false, partialChecked: true });
        expect(some['0-0-0']).toEqual({ checked: true, partialChecked: false });
        expect(some['1']).toBeUndefined();
    });

    it('reads the checked keys back out of a selection record in either shape', () => {
        expect(selectedKeys({ '0-0-0': { checked: true, partialChecked: false }, '0-0': { checked: false, partialChecked: true }, '1': true })).toEqual(['0-0-0', '1']);
        expect(selectedKeys(null)).toEqual([]);
    });

    it('filters to nodes whose label matches or that contain a match, and reports the ancestors to expand', () => {
        const result = filterTree(nodes, 'expenses');
        expect(result.nodes.map((n) => n.key)).toEqual(['0']);
        expect(result.nodes[0]!.children!.map((n) => n.key)).toEqual(['0-0']);
        expect(result.nodes[0]!.children![0]!.children!.map((n) => n.key)).toEqual(['0-0-0']);
        expect(result.expanded).toEqual(['0', '0-0']);
        expect(filterTree(nodes, '').nodes).toBe(nodes);
    });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun run test src/components/tree/model.test.ts`
Expected: FAIL, `Cannot find module './model'`.

- [ ] **Step 3: Write `model.ts`**

```ts
import type { Component } from 'vue';

export interface TreeNodeLike {
    key: string;
    label: string;
    /** A PrimeIcons class string from the demo data or a component; both render through resolveIcon. */
    icon?: string | Component;
    data?: unknown;
    children?: TreeNodeLike[];
    leaf?: boolean;
    selectable?: boolean;
}

export type TreeSelectionMode = 'single' | 'multiple' | 'checkbox';

export interface CheckboxSelection {
    checked: boolean;
    partialChecked: boolean;
}

// PrimeVue's selectionKeys shape: `true` per key in single and multiple modes, the object in checkbox mode.
export type TreeSelectionKeys = Record<string, boolean | CheckboxSelection>;

export function findNode(nodes: TreeNodeLike[], key: string): TreeNodeLike | undefined {
    for (const node of nodes) {
        if (node.key === key) return node;
        const child = node.children ? findNode(node.children, key) : undefined;
        if (child) return child;
    }
    return undefined;
}

export function selectedKeys(selection: TreeSelectionKeys | null | undefined): string[] {
    if (!selection) return [];
    return Object.entries(selection)
        .filter(([, value]) => value === true || (typeof value === 'object' && value.checked))
        .map(([key]) => key);
}

function leafKeys(node: TreeNodeLike): string[] {
    return node.children && node.children.length > 0 ? node.children.flatMap(leafKeys) : [node.key];
}

// Parent state follows its leaves: checked when all are, partial when some are, absent when none are.
export function checkboxSelection(nodes: TreeNodeLike[], checkedLeaves: ReadonlySet<string>): TreeSelectionKeys {
    const result: TreeSelectionKeys = {};
    const visit = (node: TreeNodeLike): void => {
        const leaves = leafKeys(node);
        const count = leaves.filter((key) => checkedLeaves.has(key)).length;
        if (count === leaves.length) result[node.key] = { checked: true, partialChecked: false };
        else if (count > 0) result[node.key] = { checked: false, partialChecked: true };
        node.children?.forEach(visit);
    };
    nodes.forEach(visit);
    return result;
}

export function filterTree(nodes: TreeNodeLike[], query: string): { nodes: TreeNodeLike[]; expanded: string[] } {
    const needle = query.trim().toLowerCase();
    if (!needle) return { nodes, expanded: [] };
    const expanded: string[] = [];
    const prune = (list: TreeNodeLike[]): TreeNodeLike[] =>
        list.flatMap((node) => {
            const children = node.children ? prune(node.children) : [];
            const matches = node.label.toLowerCase().includes(needle);
            if (children.length > 0) {
                expanded.push(node.key);
                return [{ ...node, children }];
            }
            return matches ? [{ ...node, children: node.children ? [] : undefined }] : [];
        });
    const result = prune(nodes);
    // prune pushes deepest-first; the tree wants ancestors first so expansion reads top down.
    return { nodes: result, expanded: expanded.reverse() };
}
```

If the last assertion's ordering (`['0', '0-0']`) differs because `flatMap` visits siblings before recursion returns, sort `expanded` by depth (`key.split('-').length`) instead of reversing; the test states the contract.

- [ ] **Step 4: Run the model tests**

Run: `bun run test src/components/tree/model.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write the failing Tree tests**

Create `src/components/tree/Tree.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import Tree from './Tree.vue';
import type { TreeNodeLike, TreeSelectionKeys } from './model';

const value: TreeNodeLike[] = [
    {
        key: '0',
        label: 'Documents',
        icon: 'pi pi-fw pi-inbox',
        children: [
            { key: '0-0', label: 'Work', children: [{ key: '0-0-0', label: 'Expenses.doc' }, { key: '0-0-1', label: 'Resume.doc' }] },
            { key: '0-1', label: 'Home', children: [{ key: '0-1-0', label: 'Invoices.txt' }] }
        ]
    },
    { key: '1', label: 'Events', children: [{ key: '1-0', label: 'Meeting' }] }
];

function rows(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('[data-slot=tree-node]');
}

function lastSelection(wrapper: ReturnType<typeof mount>): TreeSelectionKeys {
    const emitted = wrapper.emitted('update:selectionKeys')!;
    return emitted[emitted.length - 1]![0] as TreeSelectionKeys;
}

describe('Tree', () => {
    it('renders only root nodes until a toggle is clicked', async () => {
        const wrapper = mount(Tree, { props: { value } });
        expect(rows(wrapper).map((r) => r.text())).toEqual(['Documents', 'Events']);
        expect(wrapper.get('[data-slot=tree-node] svg').exists()).toBe(true);
        await wrapper.findAll('[aria-label="Toggle Documents"]')[0]!.trigger('click');
        expect(rows(wrapper).map((r) => r.text())).toEqual(['Documents', 'Work', 'Home', 'Events']);
        const emitted = wrapper.emitted('update:expandedKeys')!;
        expect(emitted[emitted.length - 1]![0]).toEqual({ '0': true });
    });

    it('expands from the expandedKeys model', () => {
        const wrapper = mount(Tree, { props: { value, expandedKeys: { '0': true, '0-0': true } } });
        expect(rows(wrapper).map((r) => r.text())).toEqual(['Documents', 'Work', 'Expenses.doc', 'Resume.doc', 'Home', 'Events']);
    });

    it('selects a single node on click and reports it as selectionKeys', async () => {
        const wrapper = mount(Tree, { props: { value, selectionMode: 'single' } });
        await rows(wrapper)[1]!.trigger('click');
        expect(lastSelection(wrapper)).toEqual({ '1': true });
        expect(wrapper.emitted('node-select')![0]![0]).toEqual({ node: value[1] });
    });

    it('checkbox mode propagates to descendants and reports partial parents', async () => {
        const wrapper = mount(Tree, { props: { value, selectionMode: 'checkbox', expandedKeys: { '0': true, '0-0': true } } });
        await wrapper.findAll('[data-slot=tree-checkbox]')[2]!.trigger('click');
        expect(lastSelection(wrapper)).toEqual({
            '0': { checked: false, partialChecked: true },
            '0-0': { checked: false, partialChecked: true },
            '0-0-0': { checked: true, partialChecked: false }
        });
        await wrapper.setProps({ selectionKeys: lastSelection(wrapper) });
        await wrapper.findAll('[data-slot=tree-checkbox]')[0]!.trigger('click');
        await nextTick();
        const all = lastSelection(wrapper);
        expect(all['0']).toEqual({ checked: true, partialChecked: false });
        expect(all['0-1-0']).toEqual({ checked: true, partialChecked: false });
        expect(all['1']).toBeUndefined();
    });

    it('filters nodes from the filter box and expands the matching path', async () => {
        const wrapper = mount(Tree, { props: { value, filter: true } });
        await wrapper.get('[data-slot=tree-filter]').setValue('invoices');
        expect(rows(wrapper).map((r) => r.text())).toEqual(['Documents', 'Home', 'Invoices.txt']);
        await wrapper.get('[data-slot=tree-filter]').setValue('');
        expect(rows(wrapper).map((r) => r.text())).toEqual(['Documents', 'Events']);
    });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `bun run test src/components/tree/Tree.test.ts`
Expected: FAIL, `Cannot find module './Tree.vue'`.

- [ ] **Step 7: Write `Tree.vue`**

```vue
<script setup lang="ts">
    import { TreeItem, TreeRoot } from 'reka-ui';
    import { computed, ref, watch, type Component } from 'vue';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Input } from '@/components/ui/input';
    import { IconAngleDown, IconAngleRight, IconSearch } from '@/components/icons';
    import { resolveIcon } from '@/components/resolveIcon';
    import { cn } from '@/lib/utils';
    import { checkboxSelection, filterTree, findNode, selectedKeys, type TreeNodeLike, type TreeSelectionKeys, type TreeSelectionMode } from './model';

    // Reka's TreeRoot owns keyboard navigation and selection; this file converts between its
    // node-array model and PrimeVue's selectionKeys and expandedKeys records so ported pages keep their shapes.
    const props = withDefaults(
        defineProps<{
            value: TreeNodeLike[];
            selectionMode?: TreeSelectionMode;
            filter?: boolean;
            filterPlaceholder?: string;
            class?: string;
        }>(),
        { selectionMode: undefined, filter: false, filterPlaceholder: 'Search', class: undefined }
    );

    const selectionKeysModel = defineModel<TreeSelectionKeys | null>('selectionKeys', { default: null });
    const expandedKeysModel = defineModel<Record<string, boolean> | null>('expandedKeys', { default: null });
    const emit = defineEmits<{ 'node-select': [payload: { node: TreeNodeLike }]; 'node-unselect': [payload: { node: TreeNodeLike }] }>();

    const query = ref('');
    const filtered = computed(() => filterTree(props.value, query.value));
    const multiple = computed(() => props.selectionMode === 'multiple' || props.selectionMode === 'checkbox');
    const checkbox = computed(() => props.selectionMode === 'checkbox');

    // Filtering opens the matched path on top of whatever the user expanded.
    const expanded = computed<string[]>(() => {
        const own = Object.entries(expandedKeysModel.value ?? {})
            .filter(([, open]) => open)
            .map(([key]) => key);
        return [...new Set([...own, ...filtered.value.expanded])];
    });

    function onExpanded(keys: string[]): void {
        const next: Record<string, boolean> = {};
        for (const key of keys) next[key] = true;
        expandedKeysModel.value = next;
    }

    const selectedNodes = computed<TreeNodeLike[]>(() => selectedKeys(selectionKeysModel.value).map((key) => findNode(props.value, key)).filter((node): node is TreeNodeLike => node !== undefined));

    function onSelect(nodes: TreeNodeLike | TreeNodeLike[] | undefined): void {
        if (!props.selectionMode) return;
        const list = nodes === undefined ? [] : Array.isArray(nodes) ? nodes : [nodes];
        const before = new Set(selectedKeys(selectionKeysModel.value));
        const after = new Set(list.map((node) => node.key));
        const next: TreeSelectionKeys = checkbox.value ? checkboxSelection(props.value, leafSet(list)) : Object.fromEntries(list.map((node) => [node.key, true]));
        selectionKeysModel.value = Object.keys(next).length > 0 ? next : null;
        for (const node of list) if (!before.has(node.key)) emit('node-select', { node });
        for (const key of before) if (!after.has(key)) {
            const node = findNode(props.value, key);
            if (node) emit('node-unselect', { node });
        }
    }

    // Reka reports every selected node including parents; the record derives parents from leaves, so only leaves feed it.
    function leafSet(nodes: TreeNodeLike[]): Set<string> {
        const leaves = new Set<string>();
        const collect = (node: TreeNodeLike): void => {
            if (node.children && node.children.length > 0) node.children.forEach(collect);
            else leaves.add(node.key);
        };
        nodes.forEach(collect);
        return leaves;
    }

    function iconOf(node: TreeNodeLike): Component | undefined {
        return typeof node.icon === 'string' ? resolveIcon(node.icon) : node.icon;
    }

    watch(
        () => props.selectionMode,
        () => {
            selectionKeysModel.value = null;
        }
    );
</script>

<template>
    <div :class="cn('flex flex-col gap-2', props.class)" data-slot="tree">
        <div v-if="props.filter" class="relative">
            <IconSearch class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="query" :placeholder="props.filterPlaceholder" class="pl-8" data-slot="tree-filter" />
        </div>
        <TreeRoot
            v-slot="{ flattenItems }"
            :items="filtered.nodes"
            :get-key="(node: TreeNodeLike) => node.key"
            :get-children="(node: TreeNodeLike) => node.children"
            :multiple="multiple"
            :propagate-select="checkbox"
            :bubble-select="checkbox"
            :model-value="multiple ? selectedNodes : selectedNodes[0]"
            :expanded="expanded"
            class="flex flex-col gap-0.5 outline-none"
            @update:model-value="onSelect"
            @update:expanded="onExpanded"
        >
            <TreeItem
                v-for="item in flattenItems"
                :key="item._id"
                v-slot="{ isExpanded, isSelected, isIndeterminate, handleToggle, handleSelect }"
                v-bind="item.bind"
                :style="{ paddingLeft: `${(item.level - 1) * 1.25}rem` }"
                :class="cn('flex items-center gap-1 rounded-md px-1 py-1 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[selected]:bg-accent', !props.selectionMode && 'cursor-default')"
                data-slot="tree-node"
            >
                <button v-if="item.hasChildren" type="button" class="flex size-6 items-center justify-center rounded-sm hover:bg-muted" :aria-label="`Toggle ${item.value.label}`" @click.stop="handleToggle()">
                    <IconAngleDown v-if="isExpanded" class="size-4" />
                    <IconAngleRight v-else class="size-4" />
                </button>
                <span v-else class="size-6 shrink-0" />
                <Checkbox v-if="checkbox" :model-value="isIndeterminate ? 'indeterminate' : isSelected" data-slot="tree-checkbox" @click.stop="handleSelect()" />
                <component :is="iconOf(item.value)" v-if="iconOf(item.value)" class="size-4 shrink-0 text-muted-foreground" />
                <span>{{ item.value.label }}</span>
            </TreeItem>
        </TreeRoot>
    </div>
</template>
```

The `v-slot` names `isExpanded`, `isSelected`, `isIndeterminate`, `handleToggle`, `handleSelect` and the `item._id`, `item.bind`, `item.level`, `item.hasChildren`, `item.value` fields are the installed 2.10.4 Tree slot shape (declared in `node_modules/reka-ui/dist/index4.d.ts`); `vue-tsc` is the check. When `selectionMode` is undefined, `onSelect` returns early so the model never changes, but Reka still highlights the clicked row; to stop that, bind `@select.prevent` on `TreeItem` when `!props.selectionMode`. Do not use `disabled` for this, because it also blocks expansion.

- [ ] **Step 8: Run the Tree tests**

Run: `bun run test src/components/tree/Tree.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 9: Write the failing TreeSelect test**

Create `src/components/tree/TreeSelect.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TreeSelect from './TreeSelect.vue';
import type { TreeNodeLike } from './model';

const options: TreeNodeLike[] = [
    { key: '0', label: 'Documents', children: [{ key: '0-0', label: 'Work' }] },
    { key: '1', label: 'Events' }
];

afterEach(() => {
    document.body.innerHTML = '';
});

describe('TreeSelect', () => {
    it('shows the placeholder, opens the tree, and reflects the picked node in the trigger', async () => {
        const wrapper = mount(TreeSelect, { props: { options, placeholder: 'Select Item' }, attachTo: document.body });
        const trigger = wrapper.get('[data-slot=tree-select-trigger]');
        expect(trigger.text()).toBe('Select Item');
        await trigger.trigger('click');
        await nextTick();
        const events = Array.from(document.body.querySelectorAll('[data-slot=tree-node]')).find((el) => el.textContent?.trim() === 'Events') as HTMLElement;
        events.click();
        await nextTick();
        const emitted = wrapper.emitted('update:modelValue')!;
        expect(emitted[emitted.length - 1]![0]).toEqual({ '1': true });
        await wrapper.setProps({ modelValue: { '1': true } });
        expect(trigger.text()).toBe('Events');
        wrapper.unmount();
    });

    it('lists every checked label in checkbox mode', () => {
        const wrapper = mount(TreeSelect, { props: { options, selectionMode: 'checkbox', modelValue: { '0-0': { checked: true, partialChecked: false }, '1': { checked: true, partialChecked: false } } } });
        expect(wrapper.get('[data-slot=tree-select-trigger]').text()).toBe('Work, Events');
    });
});
```

- [ ] **Step 10: Run to verify it fails, then write `TreeSelect.vue`**

Run: `bun run test src/components/tree/TreeSelect.test.ts` and expect the module-not-found failure. Then create:

```vue
<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { IconAngleDown } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import Tree from './Tree.vue';
    import { findNode, selectedKeys, type TreeNodeLike, type TreeSelectionKeys, type TreeSelectionMode } from './model';

    const props = withDefaults(
        defineProps<{
            options: TreeNodeLike[];
            selectionMode?: TreeSelectionMode;
            placeholder?: string;
            filter?: boolean;
            class?: string;
        }>(),
        { selectionMode: 'single', placeholder: '', filter: false, class: undefined }
    );

    const model = defineModel<TreeSelectionKeys | null>({ default: null });
    const open = ref(false);

    const label = computed(() => {
        const labels = selectedKeys(model.value)
            .map((key) => findNode(props.options, key)?.label)
            .filter((text): text is string => Boolean(text));
        return labels.length > 0 ? labels.join(', ') : props.placeholder;
    });

    function onSelectionKeys(keys: TreeSelectionKeys | null): void {
        model.value = keys;
        if (props.selectionMode === 'single') open.value = false;
    }
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button variant="outline" :class="cn('w-full justify-between font-normal', !selectedKeys(model).length && 'text-muted-foreground', props.class)" data-slot="tree-select-trigger">
                <span class="truncate">{{ label }}</span>
                <IconAngleDown class="size-4 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-(--reka-popover-trigger-width) p-2" data-slot="tree-select-content">
            <Tree :value="props.options" :selection-mode="props.selectionMode" :selection-keys="model" :filter="props.filter" @update:selection-keys="onSelectionKeys" />
        </PopoverContent>
    </Popover>
</template>
```

Create `src/components/tree/index.ts`:

```ts
export { default as Tree } from './Tree.vue';
export { default as TreeSelect } from './TreeSelect.vue';
export type { CheckboxSelection, TreeNodeLike, TreeSelectionKeys, TreeSelectionMode } from './model';
```

- [ ] **Step 11: Run the tree suites**

Run: `bun run test src/components/tree`
Expected: PASS, 11 tests.

- [ ] **Step 12: Verify and commit**

Run `bunx prettier --check src/components/tree`, then `bun run type-check`, `bun run lint`, `bun run test` (112 tests in 22 files), `bun run build`.

```bash
git add src/components/tree
```
```bash
git commit -m "feat: add Tree and TreeSelect on Reka TreeRoot with PrimeVue selection shapes"
```

---

### Task 5: `OrderList` and `PickList`

**Files:**
- Create: `src/components/list/moves.ts`, `src/components/list/useListSelection.ts`, `src/components/list/ListItems.vue`, `src/components/list/OrderList.vue`, `src/components/list/PickList.vue`, `src/components/list/index.ts`
- Test: `src/components/list/moves.test.ts`, `src/components/list/OrderList.test.ts`, `src/components/list/PickList.test.ts`

**Interfaces:**
- Consumes: `Button`, icons `IconAngleUp`, `IconAngleDown`, `IconAngleDoubleUp`, `IconAngleDoubleDown`, `IconAngleRight`, `IconAngleLeft`, `IconAngleDoubleRight`, `IconAngleDoubleLeft` (Task 1).
- Produces from `@/components/list`: `OrderList` (`v-model: T[]`, `dataKey: keyof T & string`, slot `option` `{ option, index }`, slot `header`), `PickList` (`v-model: [T[], T[]]`, `dataKey`, slots `option`, `sourceheader`, `targetheader`); pure `moveUp`, `moveTop`, `moveDown`, `moveBottom`, `transfer`, `transferAll`.

- [ ] **Step 1: Write the failing move tests**

Create `src/components/list/moves.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { moveBottom, moveDown, moveTop, moveUp, transfer, transferAll } from './moves';

const items = ['a', 'b', 'c', 'd', 'e'];
const id = (item: string) => item;

describe('list moves', () => {
    it('moves a selection one step up and keeps it together', () => {
        expect(moveUp(items, ['c', 'd'], id)).toEqual(['a', 'c', 'd', 'b', 'e']);
        expect(moveUp(items, ['a'], id)).toEqual(items);
    });

    it('moves a selection one step down', () => {
        expect(moveDown(items, ['b', 'c'], id)).toEqual(['a', 'd', 'b', 'c', 'e']);
        expect(moveDown(items, ['e'], id)).toEqual(items);
    });

    it('moves a selection to the top and bottom in its original order', () => {
        expect(moveTop(items, ['d', 'b'], id)).toEqual(['b', 'd', 'a', 'c', 'e']);
        expect(moveBottom(items, ['a', 'c'], id)).toEqual(['b', 'd', 'e', 'a', 'c']);
    });

    it('transfers the selection to the end of the other list and all when asked', () => {
        expect(transfer(items, ['x'], ['b', 'd'], id)).toEqual({ from: ['a', 'c', 'e'], to: ['x', 'b', 'd'] });
        expect(transferAll(items, ['x'])).toEqual({ from: [], to: ['x', 'a', 'b', 'c', 'd', 'e'] });
    });

    it('returns the same array instance when nothing is selected', () => {
        expect(moveUp(items, [], id)).toBe(items);
    });
});
```

- [ ] **Step 2: Run to verify it fails, then write `moves.ts`**

Run: `bun run test src/components/list/moves.test.ts` and expect module-not-found. Then create:

```ts
export type KeyOf<T> = (item: T) => string;

function selectedIndexes<T>(items: T[], selected: string[], keyOf: KeyOf<T>): number[] {
    const keys = new Set(selected);
    return items.map((item, index) => (keys.has(keyOf(item)) ? index : -1)).filter((index) => index >= 0);
}

export function moveUp<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const indexes = selectedIndexes(items, selected, keyOf);
    if (indexes.length === 0 || indexes[0] === 0) return items;
    const next = [...items];
    // Walk top down so a contiguous block shifts as one.
    for (const index of indexes) [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
    return next;
}

export function moveDown<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const indexes = selectedIndexes(items, selected, keyOf);
    if (indexes.length === 0 || indexes[indexes.length - 1] === items.length - 1) return items;
    const next = [...items];
    for (const index of [...indexes].reverse()) [next[index + 1], next[index]] = [next[index]!, next[index + 1]!];
    return next;
}

export function moveTop<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const indexes = selectedIndexes(items, selected, keyOf);
    if (indexes.length === 0) return items;
    const picked = indexes.map((index) => items[index]!);
    const rest = items.filter((_, index) => !indexes.includes(index));
    return [...picked, ...rest];
}

export function moveBottom<T>(items: T[], selected: string[], keyOf: KeyOf<T>): T[] {
    const indexes = selectedIndexes(items, selected, keyOf);
    if (indexes.length === 0) return items;
    const picked = indexes.map((index) => items[index]!);
    const rest = items.filter((_, index) => !indexes.includes(index));
    return [...rest, ...picked];
}

export function transfer<T>(from: T[], to: T[], selected: string[], keyOf: KeyOf<T>): { from: T[]; to: T[] } {
    const keys = new Set(selected);
    const moved = from.filter((item) => keys.has(keyOf(item)));
    if (moved.length === 0) return { from, to };
    return { from: from.filter((item) => !keys.has(keyOf(item))), to: [...to, ...moved] };
}

export function transferAll<T>(from: T[], to: T[]): { from: T[]; to: T[] } {
    return { from: [], to: [...to, ...from] };
}
```

Run the move tests: PASS, 5 tests.

- [ ] **Step 3: Write the selection composable and the shared list**

`src/components/list/useListSelection.ts`:

```ts
import { ref, type Ref } from 'vue';

// Click selects, ctrl or meta toggles, shift selects the range from the last plain click; the same rules PrimeVue's lists use.
export function useListSelection(): { selected: Ref<string[]>; onItemClick: (event: MouseEvent, key: string, orderedKeys: string[]) => void; clear: () => void; isSelected: (key: string) => boolean } {
    const selected = ref<string[]>([]);
    let anchor: string | null = null;

    function onItemClick(event: MouseEvent, key: string, orderedKeys: string[]): void {
        if (event.shiftKey && anchor !== null) {
            const start = orderedKeys.indexOf(anchor);
            const end = orderedKeys.indexOf(key);
            if (start >= 0 && end >= 0) {
                const [low, high] = start < end ? [start, end] : [end, start];
                selected.value = orderedKeys.slice(low, high + 1);
                return;
            }
        }
        if (event.ctrlKey || event.metaKey) {
            selected.value = selected.value.includes(key) ? selected.value.filter((k) => k !== key) : [...selected.value, key];
        } else {
            selected.value = [key];
        }
        anchor = key;
    }

    return { selected, onItemClick, clear: () => (selected.value = []), isSelected: (key) => selected.value.includes(key) };
}
```

`src/components/list/ListItems.vue` (the listbox both components render):

```vue
<script setup lang="ts" generic="T extends Record<string, unknown>">
    import { cn } from '@/lib/utils';

    const props = defineProps<{
        items: T[];
        keyOf: (item: T) => string;
        selected: string[];
        label: string;
        class?: string;
    }>();
    const emit = defineEmits<{ itemClick: [event: MouseEvent, key: string] }>();
</script>

<template>
    <ul role="listbox" :aria-label="props.label" aria-multiselectable="true" :class="cn('flex min-h-48 flex-col gap-0.5 overflow-auto rounded-lg border border-border bg-card p-1', props.class)" data-slot="list-items">
        <li
            v-for="(item, index) in props.items"
            :key="props.keyOf(item)"
            role="option"
            :aria-selected="props.selected.includes(props.keyOf(item))"
            :class="cn('cursor-pointer rounded-md px-3 py-2 text-sm select-none hover:bg-muted', props.selected.includes(props.keyOf(item)) && 'bg-accent text-accent-foreground')"
            data-slot="list-item"
            @click="emit('itemClick', $event, props.keyOf(item))"
        >
            <slot name="option" :option="item" :index="index">{{ props.keyOf(item) }}</slot>
        </li>
        <li v-if="props.items.length === 0" class="px-3 py-2 text-sm text-muted-foreground">No items</li>
    </ul>
</template>
```

- [ ] **Step 4: Write the failing OrderList test**

Create `src/components/list/OrderList.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import OrderList from './OrderList.vue';

interface Item extends Record<string, unknown> {
    id: string;
    name: string;
}

const items: Item[] = [
    { id: '1', name: 'Bamboo Watch' },
    { id: '2', name: 'Black Watch' },
    { id: '3', name: 'Blue Band' }
];

function make(modelValue = items) {
    return mount(OrderList<Item>, { props: { modelValue, dataKey: 'id' }, slots: { option: `<template #option="{ option }">{{ option.name }}</template>` } });
}

function lastModel(wrapper: ReturnType<typeof make>): Item[] {
    const emitted = wrapper.emitted('update:modelValue')!;
    return emitted[emitted.length - 1]![0] as Item[];
}

describe('OrderList', () => {
    it('renders the option slot per item and selects on click, with shift and ctrl modifiers', async () => {
        const wrapper = make();
        const options = wrapper.findAll('[role=option]');
        expect(options.map((o) => o.text())).toEqual(['Bamboo Watch', 'Black Watch', 'Blue Band']);
        await options[0]!.trigger('click');
        await options[2]!.trigger('click', { shiftKey: true });
        expect(wrapper.findAll('[role=option][aria-selected=true]')).toHaveLength(3);
        await options[0]!.trigger('click', { ctrlKey: true });
        expect(wrapper.findAll('[role=option][aria-selected=true]')).toHaveLength(2);
    });

    it('moves the selection with the four buttons and emits the new order', async () => {
        const wrapper = make();
        await wrapper.findAll('[role=option]')[1]!.trigger('click');
        await wrapper.get('[aria-label="Move up"]').trigger('click');
        expect(lastModel(wrapper).map((i) => i.id)).toEqual(['2', '1', '3']);
        await wrapper.setProps({ modelValue: lastModel(wrapper) });
        await wrapper.get('[aria-label="Move bottom"]').trigger('click');
        expect(lastModel(wrapper).map((i) => i.id)).toEqual(['1', '3', '2']);
        await wrapper.setProps({ modelValue: lastModel(wrapper) });
        await wrapper.get('[aria-label="Move top"]').trigger('click');
        expect(lastModel(wrapper).map((i) => i.id)).toEqual(['2', '1', '3']);
        await wrapper.setProps({ modelValue: lastModel(wrapper) });
        await wrapper.get('[aria-label="Move down"]').trigger('click');
        expect(lastModel(wrapper).map((i) => i.id)).toEqual(['1', '2', '3']);
    });

    it('does nothing with no selection', async () => {
        const wrapper = make();
        await wrapper.get('[aria-label="Move up"]').trigger('click');
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
});
```

- [ ] **Step 5: Run to verify it fails, then write `OrderList.vue`**

```vue
<script setup lang="ts" generic="T extends Record<string, unknown>">
    import { computed } from 'vue';
    import { Button } from '@/components/ui/button';
    import { IconAngleDoubleDown, IconAngleDoubleUp, IconAngleDown, IconAngleUp } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import ListItems from './ListItems.vue';
    import { moveBottom, moveDown, moveTop, moveUp } from './moves';
    import { useListSelection } from './useListSelection';

    const props = defineProps<{
        dataKey: keyof T & string;
        class?: string;
    }>();
    const model = defineModel<T[]>({ default: () => [] });

    const keyOf = (item: T): string => String(item[props.dataKey]);
    const { selected, onItemClick } = useListSelection();
    const orderedKeys = computed(() => model.value.map(keyOf));

    function apply(mover: (items: T[], selectedKeys: string[], key: (item: T) => string) => T[]): void {
        const next = mover(model.value, selected.value, keyOf);
        if (next !== model.value) model.value = next;
    }
</script>

<template>
    <div :class="cn('flex flex-col gap-4 sm:flex-row', props.class)" data-slot="order-list">
        <div class="flex flex-row gap-2 sm:flex-col">
            <Button variant="secondary" size="icon" aria-label="Move up" @click="apply(moveUp)"><IconAngleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move top" @click="apply(moveTop)"><IconAngleDoubleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move down" @click="apply(moveDown)"><IconAngleDown /></Button>
            <Button variant="secondary" size="icon" aria-label="Move bottom" @click="apply(moveBottom)"><IconAngleDoubleDown /></Button>
        </div>
        <div class="flex flex-1 flex-col gap-2">
            <div v-if="$slots.header" class="font-medium"><slot name="header" /></div>
            <ListItems :items="model" :key-of="keyOf" :selected="selected" label="Order list" @item-click="(event, key) => onItemClick(event, key, orderedKeys)">
                <template #option="scope"><slot name="option" v-bind="scope" /></template>
            </ListItems>
        </div>
    </div>
</template>
```

Run `bun run test src/components/list/OrderList.test.ts`: PASS, 3 tests.

- [ ] **Step 6: Write the failing PickList test**

Create `src/components/list/PickList.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PickList from './PickList.vue';

interface Item extends Record<string, unknown> {
    id: string;
    name: string;
}

const source: Item[] = [
    { id: '1', name: 'Bamboo Watch' },
    { id: '2', name: 'Black Watch' }
];

function make(modelValue: [Item[], Item[]] = [source, []]) {
    return mount(PickList<Item>, { props: { modelValue, dataKey: 'id' }, slots: { option: `<template #option="{ option }">{{ option.name }}</template>` } });
}

function lastModel(wrapper: ReturnType<typeof make>): [Item[], Item[]] {
    const emitted = wrapper.emitted('update:modelValue')!;
    return emitted[emitted.length - 1]![0] as [Item[], Item[]];
}

describe('PickList', () => {
    it('moves the source selection to the target and back', async () => {
        const wrapper = make();
        const sourceList = wrapper.findAll('[data-slot=list-items]')[0]!;
        await sourceList.findAll('[role=option]')[1]!.trigger('click');
        await wrapper.get('[aria-label="Move to target"]').trigger('click');
        expect(lastModel(wrapper).map((list) => list.map((i) => i.id))).toEqual([['1'], ['2']]);
        await wrapper.setProps({ modelValue: lastModel(wrapper) });
        const targetList = wrapper.findAll('[data-slot=list-items]')[1]!;
        await targetList.findAll('[role=option]')[0]!.trigger('click');
        await wrapper.get('[aria-label="Move to source"]').trigger('click');
        expect(lastModel(wrapper).map((list) => list.map((i) => i.id))).toEqual([['1', '2'], []]);
    });

    it('moves everything with the double arrows', async () => {
        const wrapper = make();
        await wrapper.get('[aria-label="Move all to target"]').trigger('click');
        expect(lastModel(wrapper).map((list) => list.length)).toEqual([0, 2]);
        await wrapper.setProps({ modelValue: lastModel(wrapper) });
        await wrapper.get('[aria-label="Move all to source"]').trigger('click');
        expect(lastModel(wrapper).map((list) => list.length)).toEqual([2, 0]);
    });

    it('reorders inside the target list', async () => {
        const wrapper = make([[], source]);
        const targetList = wrapper.findAll('[data-slot=list-items]')[1]!;
        await targetList.findAll('[role=option]')[1]!.trigger('click');
        await wrapper.findAll('[aria-label="Move up"]')[1]!.trigger('click');
        expect(lastModel(wrapper)[1].map((i) => i.id)).toEqual(['2', '1']);
    });
});
```

- [ ] **Step 7: Run to verify it fails, then write `PickList.vue`**

```vue
<script setup lang="ts" generic="T extends Record<string, unknown>">
    import { computed } from 'vue';
    import { Button } from '@/components/ui/button';
    import { IconAngleDoubleDown, IconAngleDoubleLeft, IconAngleDoubleRight, IconAngleDoubleUp, IconAngleDown, IconAngleLeft, IconAngleRight, IconAngleUp } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import ListItems from './ListItems.vue';
    import { moveBottom, moveDown, moveTop, moveUp, transfer, transferAll } from './moves';
    import { useListSelection } from './useListSelection';

    const props = defineProps<{
        dataKey: keyof T & string;
        class?: string;
    }>();
    const model = defineModel<[T[], T[]]>({ default: () => [[], []] });

    const keyOf = (item: T): string => String(item[props.dataKey]);
    const sourceSelection = useListSelection();
    const targetSelection = useListSelection();
    const sourceKeys = computed(() => model.value[0].map(keyOf));
    const targetKeys = computed(() => model.value[1].map(keyOf));

    type Mover = (items: T[], selectedKeys: string[], key: (item: T) => string) => T[];

    function reorder(side: 0 | 1, mover: Mover): void {
        const selection = side === 0 ? sourceSelection : targetSelection;
        const next = mover(model.value[side], selection.selected.value, keyOf);
        if (next === model.value[side]) return;
        model.value = side === 0 ? [next, model.value[1]] : [model.value[0], next];
    }

    function toTarget(all = false): void {
        const result = all ? transferAll(model.value[0], model.value[1]) : transfer(model.value[0], model.value[1], sourceSelection.selected.value, keyOf);
        if (result.from === model.value[0]) return;
        model.value = [result.from, result.to];
        sourceSelection.clear();
    }

    function toSource(all = false): void {
        const result = all ? transferAll(model.value[1], model.value[0]) : transfer(model.value[1], model.value[0], targetSelection.selected.value, keyOf);
        if (result.from === model.value[1]) return;
        model.value = [result.to, result.from];
        targetSelection.clear();
    }
</script>

<template>
    <div :class="cn('flex flex-col gap-4 lg:flex-row', props.class)" data-slot="pick-list">
        <div class="flex flex-row gap-2 lg:flex-col">
            <Button variant="secondary" size="icon" aria-label="Move up" @click="reorder(0, moveUp)"><IconAngleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move top" @click="reorder(0, moveTop)"><IconAngleDoubleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move down" @click="reorder(0, moveDown)"><IconAngleDown /></Button>
            <Button variant="secondary" size="icon" aria-label="Move bottom" @click="reorder(0, moveBottom)"><IconAngleDoubleDown /></Button>
        </div>
        <div class="flex flex-1 flex-col gap-2">
            <div class="font-medium"><slot name="sourceheader">Available</slot></div>
            <ListItems :items="model[0]" :key-of="keyOf" :selected="sourceSelection.selected.value" label="Source" @item-click="(event, key) => sourceSelection.onItemClick(event, key, sourceKeys)">
                <template #option="scope"><slot name="option" v-bind="scope" /></template>
            </ListItems>
        </div>
        <div class="flex flex-row gap-2 lg:flex-col">
            <Button variant="secondary" size="icon" aria-label="Move to target" @click="toTarget()"><IconAngleRight /></Button>
            <Button variant="secondary" size="icon" aria-label="Move all to target" @click="toTarget(true)"><IconAngleDoubleRight /></Button>
            <Button variant="secondary" size="icon" aria-label="Move to source" @click="toSource()"><IconAngleLeft /></Button>
            <Button variant="secondary" size="icon" aria-label="Move all to source" @click="toSource(true)"><IconAngleDoubleLeft /></Button>
        </div>
        <div class="flex flex-1 flex-col gap-2">
            <div class="font-medium"><slot name="targetheader">Selected</slot></div>
            <ListItems :items="model[1]" :key-of="keyOf" :selected="targetSelection.selected.value" label="Target" @item-click="(event, key) => targetSelection.onItemClick(event, key, targetKeys)">
                <template #option="scope"><slot name="option" v-bind="scope" /></template>
            </ListItems>
        </div>
        <div class="flex flex-row gap-2 lg:flex-col">
            <Button variant="secondary" size="icon" aria-label="Move up" @click="reorder(1, moveUp)"><IconAngleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move top" @click="reorder(1, moveTop)"><IconAngleDoubleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move down" @click="reorder(1, moveDown)"><IconAngleDown /></Button>
            <Button variant="secondary" size="icon" aria-label="Move bottom" @click="reorder(1, moveBottom)"><IconAngleDoubleDown /></Button>
        </div>
    </div>
</template>
```

Create `src/components/list/index.ts`:

```ts
export { default as OrderList } from './OrderList.vue';
export { default as PickList } from './PickList.vue';
export { moveBottom, moveDown, moveTop, moveUp, transfer, transferAll } from './moves';
```

- [ ] **Step 8: Run the list suites**

Run: `bun run test src/components/list`
Expected: PASS, 11 tests.

- [ ] **Step 9: Verify and commit**

Run `bunx prettier --check src/components/list`, then `bun run type-check`, `bun run lint`, `bun run test` (123 tests in 25 files), `bun run build`.

```bash
git add src/components/list
```
```bash
git commit -m "feat: add OrderList and PickList with keyboard-modifier selection"
```

---

### Task 6: `DataView`

**Files:**
- Create: `src/components/DataView.vue`
- Test: `src/components/DataView.test.ts`

**Interfaces:**
- Consumes: `Paginator` (Task 3).
- Produces: `DataView` with props `value: T[]`, `layout?: 'list' | 'grid'` (default `list`), `sortField?: keyof T & string`, `sortOrder?: 1 | -1` (default `1`), `paginator?: boolean`, `rows?: number` (default `10`), `rowsPerPageOptions?: number[]`; slots `header`, `list` and `grid` (`{ items }`), `empty`, `footer`.

- [ ] **Step 1: Write the failing test**

Create `src/components/DataView.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DataView from './DataView.vue';

interface Item extends Record<string, unknown> {
    id: string;
    name: string;
    price: number;
}

const items: Item[] = [
    { id: '1', name: 'Bamboo Watch', price: 65 },
    { id: '2', name: 'Black Watch', price: 72 },
    { id: '3', name: 'Blue Band', price: 79 }
];

const slots = {
    list: `<template #list="{ items }"><ul data-testid="list"><li v-for="item in items" :key="item.id">{{ item.name }}</li></ul></template>`,
    grid: `<template #grid="{ items }"><div data-testid="grid">{{ items.length }}</div></template>`,
    header: `<template #header><div data-testid="header">Products</div></template>`
};

describe('DataView', () => {
    it('renders the list slot by default and the grid slot when layout is grid', async () => {
        const wrapper = mount(DataView<Item>, { props: { value: items }, slots });
        expect(wrapper.get('[data-testid=header]').text()).toBe('Products');
        expect(wrapper.findAll('[data-testid=list] li').map((li) => li.text())).toEqual(['Bamboo Watch', 'Black Watch', 'Blue Band']);
        await wrapper.setProps({ layout: 'grid' });
        expect(wrapper.get('[data-testid=grid]').text()).toBe('3');
    });

    it('sorts by sortField and sortOrder', () => {
        const wrapper = mount(DataView<Item>, { props: { value: items, sortField: 'price', sortOrder: -1 }, slots });
        expect(wrapper.findAll('[data-testid=list] li').map((li) => li.text())).toEqual(['Blue Band', 'Black Watch', 'Bamboo Watch']);
    });

    it('paginates and moves pages through the paginator', async () => {
        const wrapper = mount(DataView<Item>, { props: { value: items, paginator: true, rows: 2 }, slots });
        expect(wrapper.findAll('[data-testid=list] li')).toHaveLength(2);
        expect(wrapper.get('[data-testid=data-table-report]').text()).toBe('Showing 1 to 2 of 3 entries');
        await wrapper.get('[aria-label="Next page"]').trigger('click');
        expect(wrapper.findAll('[data-testid=list] li').map((li) => li.text())).toEqual(['Blue Band']);
    });

    it('renders the empty slot with no items', () => {
        const wrapper = mount(DataView<Item>, { props: { value: [] }, slots: { ...slots, empty: 'Nothing to show' } });
        expect(wrapper.text()).toContain('Nothing to show');
    });
});
```

- [ ] **Step 2: Run to verify it fails, then write `DataView.vue`**

```vue
<script setup lang="ts" generic="T extends Record<string, unknown>">
    import { computed, ref, watch } from 'vue';
    import Paginator from '@/components/Paginator.vue';
    import { cn } from '@/lib/utils';

    const props = withDefaults(
        defineProps<{
            value: T[];
            layout?: 'list' | 'grid';
            sortField?: keyof T & string;
            sortOrder?: 1 | -1;
            paginator?: boolean;
            rows?: number;
            rowsPerPageOptions?: number[];
            class?: string;
        }>(),
        { layout: 'list', sortField: undefined, sortOrder: 1, paginator: false, rows: 10, rowsPerPageOptions: () => [5, 10, 25], class: undefined }
    );

    const page = ref(0);
    const pageSize = ref(props.rows);
    watch(() => props.rows, (rows) => (pageSize.value = rows));
    // A new value or sort resets to the first page, as PrimeVue does.
    watch([() => props.value, () => props.sortField, () => props.sortOrder], () => (page.value = 0));

    const sorted = computed<T[]>(() => {
        const field = props.sortField;
        if (!field) return props.value;
        return [...props.value].sort((a, b) => {
            const left = a[field];
            const right = b[field];
            const result = typeof left === 'number' && typeof right === 'number' ? left - right : String(left ?? '').localeCompare(String(right ?? ''));
            return result * props.sortOrder;
        });
    });

    const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / pageSize.value)));
    const visible = computed<T[]>(() => (props.paginator ? sorted.value.slice(page.value * pageSize.value, (page.value + 1) * pageSize.value) : sorted.value));
</script>

<template>
    <div :class="cn('flex flex-col', props.class)" data-slot="data-view" :data-layout="props.layout">
        <div v-if="$slots.header" class="mb-4"><slot name="header" /></div>
        <div v-if="visible.length === 0" class="py-8 text-center text-muted-foreground"><slot name="empty">No records found.</slot></div>
        <slot v-else-if="props.layout === 'grid'" name="grid" :items="visible" />
        <slot v-else name="list" :items="visible" />
        <Paginator v-if="props.paginator" v-model:page="page" v-model:page-size="pageSize" :page-count="pageCount" :total="sorted.length" :page-size-options="props.rowsPerPageOptions" />
        <div v-if="$slots.footer" class="mt-4"><slot name="footer" /></div>
    </div>
</template>
```

- [ ] **Step 3: Run the test**

Run: `bun run test src/components/DataView.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 4: Verify and commit**

Run `bunx prettier --check src/components/DataView.vue src/components/DataView.test.ts`, then `bun run type-check`, `bun run lint`, `bun run test` (127 tests in 26 files), `bun run build`.

```bash
git add src/components/DataView.vue src/components/DataView.test.ts
```
```bash
git commit -m "feat: add DataView with list and grid layouts on the shared Paginator"
```

---

### Task 7: `FileUpload`

**Files:**
- Create: `src/components/file-upload/validate.ts`, `src/components/file-upload/FileUpload.vue`, `src/components/file-upload/index.ts`
- Test: `src/components/file-upload/validate.test.ts`, `src/components/file-upload/FileUpload.test.ts`

**Interfaces:**
- Consumes: `useDropZone` from `@vueuse/core`; `Button`, `Progress`, `Alert`, `AlertDescription`; icons `IconPlus`, `IconUpload`, `IconTimes`, `IconCloudUpload`, `IconFile`, `IconPaperclip`.
- Produces from `@/components/file-upload`: `FileUpload` with props `mode?: 'basic' | 'advanced'` (default `advanced`), `name?: string`, `multiple?: boolean`, `accept?: string`, `maxFileSize?: number` (bytes), `auto?: boolean`, `disabled?: boolean`, `chooseLabel?`, `uploadLabel?`, `cancelLabel?`, `customUpload?: boolean` (accepted for parity; uploads always go through the `uploader` event); emits `select` (`{ files }`), `uploader` (`{ files }`), `clear`, `remove` (`{ file, files }`), `error` (`{ messages }`); exposes `upload()`, `clear()`; `validateFiles`, `formatSize`.

- [ ] **Step 1: Write the failing validator tests**

Create `src/components/file-upload/validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatSize, validateFiles } from './validate';

function file(name: string, type: string, size: number): File {
    return new File([new Uint8Array(size)], name, { type });
}

describe('validateFiles', () => {
    it('rejects files over maxFileSize with a sized message', () => {
        const big = file('photo.png', 'image/png', 2_000_000);
        const result = validateFiles([big], { maxFileSize: 1_048_576 });
        expect(result.accepted).toEqual([]);
        expect(result.rejected[0]!.message).toBe('photo.png: Invalid file size, file size should be smaller than 1 MB.');
    });

    it('rejects files outside accept, matching wildcards, mime types and extensions', () => {
        const pdf = file('cv.pdf', 'application/pdf', 10);
        const png = file('a.png', 'image/png', 10);
        expect(validateFiles([pdf, png], { accept: 'image/*' }).rejected.map((r) => r.file.name)).toEqual(['cv.pdf']);
        expect(validateFiles([pdf, png], { accept: '.pdf' }).accepted.map((f) => f.name)).toEqual(['cv.pdf']);
        expect(validateFiles([pdf, png], { accept: 'image/png, application/pdf' }).rejected).toEqual([]);
        expect(validateFiles([pdf], { accept: 'image/*' }).rejected[0]!.message).toBe('cv.pdf: Invalid file type, allowed file types: image/*.');
    });

    it('accepts everything without limits', () => {
        const result = validateFiles([file('a', '', 5)], {});
        expect(result.accepted).toHaveLength(1);
        expect(result.rejected).toEqual([]);
    });

    it('formats sizes the way PrimeVue did: base 1024, up to three decimals, trailing zeros dropped', () => {
        expect(formatSize(0)).toBe('0 B');
        expect(formatSize(1000)).toBe('1000 B');
        expect(formatSize(1024)).toBe('1 KB');
        expect(formatSize(1_000_000)).toBe('976.563 KB');
        expect(formatSize(1_500_000)).toBe('1.431 MB');
    });
});
```

- [ ] **Step 2: Run to verify it fails, then write `validate.ts`**

```ts
export interface FileRule {
    accept?: string;
    maxFileSize?: number;
}

export interface RejectedFile {
    file: File;
    message: string;
}

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

// PrimeVue 4's formatSize verbatim (node_modules/primevue/fileupload/index.mjs, k = 1024, dm = 3,
// parseFloat drops trailing zeros), so the rejection message reads as it did before the migration.
export function formatSize(bytes: number): string {
    if (bytes <= 0) return '0 B';
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
    return `${parseFloat((bytes / 1024 ** exponent).toFixed(3))} ${UNITS[exponent]}`;
}

function matchesAccept(file: File, accept: string): boolean {
    const rules = accept
        .split(',')
        .map((rule) => rule.trim().toLowerCase())
        .filter(Boolean);
    if (rules.length === 0) return true;
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    return rules.some((rule) => {
        if (rule.startsWith('.')) return name.endsWith(rule);
        if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
        return type === rule;
    });
}

export function validateFiles(files: File[], rule: FileRule): { accepted: File[]; rejected: RejectedFile[] } {
    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];
    for (const file of files) {
        if (rule.accept && !matchesAccept(file, rule.accept)) {
            rejected.push({ file, message: `${file.name}: Invalid file type, allowed file types: ${rule.accept}.` });
        } else if (rule.maxFileSize !== undefined && file.size > rule.maxFileSize) {
            rejected.push({ file, message: `${file.name}: Invalid file size, file size should be smaller than ${formatSize(rule.maxFileSize)}.` });
        } else {
            accepted.push(file);
        }
    }
    return { accepted, rejected };
}
```

Run `bun run test src/components/file-upload/validate.test.ts`: PASS, 4 tests.

- [ ] **Step 3: Write the failing component test**

Create `src/components/file-upload/FileUpload.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import FileUpload from './FileUpload.vue';

function file(name: string, type: string, size: number): File {
    return new File([new Uint8Array(size)], name, { type });
}

// jsdom has no createObjectURL; previews guard on it, and the stub keeps the code path exercised.
beforeEach(() => {
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() });
});

async function choose(wrapper: ReturnType<typeof mount>, files: File[]): Promise<void> {
    const input = wrapper.get('input[type=file]').element as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    await wrapper.get('input[type=file]').trigger('change');
    await nextTick();
}

type Exposed = { upload: () => void; clear: () => void };

describe('FileUpload', () => {
    it('lists accepted files, reports rejected ones, and uploads through the uploader event', async () => {
        const wrapper = mount(FileUpload, { props: { multiple: true, accept: 'image/*', maxFileSize: 1000 } });
        await choose(wrapper, [file('ok.png', 'image/png', 10), file('big.png', 'image/png', 5000), file('doc.pdf', 'application/pdf', 10)]);
        expect(wrapper.findAll('[data-slot=file-upload-file]').map((row) => row.text())).toEqual([expect.stringContaining('ok.png')]);
        expect(wrapper.findAll('[data-slot=file-upload-message]').map((m) => m.text())).toEqual([
            'big.png: Invalid file size, file size should be smaller than 1000 B.',
            'doc.pdf: Invalid file type, allowed file types: image/*.'
        ]);
        expect((wrapper.emitted('select')![0]![0] as { files: File[] }).files.map((f) => f.name)).toEqual(['ok.png']);
        await wrapper.get('[data-slot=file-upload-upload]').trigger('click');
        expect((wrapper.emitted('uploader')![0]![0] as { files: File[] }).files.map((f) => f.name)).toEqual(['ok.png']);
        expect(wrapper.findAll('[data-slot=file-upload-file]')).toHaveLength(0);
    });

    it('removes a single file and clears all', async () => {
        const wrapper = mount(FileUpload, { props: { multiple: true } });
        await choose(wrapper, [file('a.txt', 'text/plain', 1), file('b.txt', 'text/plain', 1)]);
        await wrapper.findAll('[aria-label="Remove a.txt"]')[0]!.trigger('click');
        expect(wrapper.emitted('remove')![0]![0]).toMatchObject({ file: expect.objectContaining({ name: 'a.txt' }) });
        expect(wrapper.findAll('[data-slot=file-upload-file]')).toHaveLength(1);
        await wrapper.get('[data-slot=file-upload-cancel]').trigger('click');
        expect(wrapper.emitted('clear')).toHaveLength(1);
        expect(wrapper.findAll('[data-slot=file-upload-file]')).toHaveLength(0);
    });

    it('uploads on select when auto is set', async () => {
        const wrapper = mount(FileUpload, { props: { auto: true } });
        await choose(wrapper, [file('a.txt', 'text/plain', 1)]);
        expect(wrapper.emitted('uploader')).toHaveLength(1);
    });

    it('basic mode shows the chosen name and uploads from the exposed method', async () => {
        const wrapper = mount(FileUpload, { props: { mode: 'basic' } });
        expect(wrapper.find('[data-slot=file-upload-upload]').exists()).toBe(false);
        await choose(wrapper, [file('a.txt', 'text/plain', 1)]);
        expect(wrapper.get('[data-slot=file-upload-basic-name]').text()).toBe('a.txt');
        (wrapper.vm as unknown as Exposed).upload();
        expect(wrapper.emitted('uploader')).toHaveLength(1);
    });

    it('accepts files dropped on the content area', async () => {
        const wrapper = mount(FileUpload, { props: { multiple: true } });
        const zone = wrapper.get('[data-slot=file-upload-content]');
        const dropped = file('drop.txt', 'text/plain', 1);
        const transfer = { files: [dropped], types: ['Files'], items: [] } as unknown as DataTransfer;
        await zone.trigger('dragenter', { dataTransfer: transfer });
        await zone.trigger('drop', { dataTransfer: transfer });
        await nextTick();
        expect(wrapper.findAll('[data-slot=file-upload-file]').map((row) => row.text())).toEqual([expect.stringContaining('drop.txt')]);
    });
});
```

- [ ] **Step 4: Run to verify it fails, then write `FileUpload.vue`**

```vue
<script setup lang="ts">
    import { useDropZone } from '@vueuse/core';
    import { computed, onBeforeUnmount, ref } from 'vue';
    import { Alert, AlertDescription } from '@/components/ui/alert';
    import { Button } from '@/components/ui/button';
    import { Progress } from '@/components/ui/progress';
    import { IconCloudUpload, IconFile, IconPaperclip, IconPlus, IconTimes, IconUpload } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { formatSize, validateFiles, type RejectedFile } from './validate';

    // The upload itself is always the consumer's (PrimeVue's customUpload path): this component only
    // gathers, validates and emits, which is what every demo in the template does.
    const props = withDefaults(
        defineProps<{
            mode?: 'basic' | 'advanced';
            name?: string;
            multiple?: boolean;
            accept?: string;
            maxFileSize?: number;
            auto?: boolean;
            disabled?: boolean;
            chooseLabel?: string;
            uploadLabel?: string;
            cancelLabel?: string;
            customUpload?: boolean;
            class?: string;
        }>(),
        { mode: 'advanced', name: undefined, multiple: false, accept: undefined, maxFileSize: undefined, auto: false, disabled: false, chooseLabel: 'Choose', uploadLabel: 'Upload', cancelLabel: 'Cancel', customUpload: true, class: undefined }
    );

    const emit = defineEmits<{
        select: [payload: { files: File[] }];
        uploader: [payload: { files: File[] }];
        clear: [];
        remove: [payload: { file: File; files: File[] }];
        error: [payload: { messages: string[] }];
    }>();

    const input = ref<HTMLInputElement | null>(null);
    const content = ref<HTMLElement | null>(null);
    const files = ref<File[]>([]);
    const rejected = ref<RejectedFile[]>([]);
    const previews = new Map<File, string>();

    const canPreview = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';

    function previewOf(file: File): string | undefined {
        if (!canPreview || !file.type.startsWith('image/')) return undefined;
        let url = previews.get(file);
        if (!url) {
            url = URL.createObjectURL(file);
            previews.set(file, url);
        }
        return url;
    }

    function revoke(file: File): void {
        const url = previews.get(file);
        if (url && canPreview) URL.revokeObjectURL(url);
        previews.delete(file);
    }

    function accept(incoming: File[]): void {
        if (props.disabled) return;
        const result = validateFiles(incoming, { accept: props.accept, maxFileSize: props.maxFileSize });
        rejected.value = result.rejected;
        if (result.rejected.length > 0) emit('error', { messages: result.rejected.map((r) => r.message) });
        if (result.accepted.length === 0) return;
        files.value = props.multiple ? [...files.value, ...result.accepted] : result.accepted.slice(0, 1);
        emit('select', { files: files.value });
        if (props.auto) upload();
    }

    function onChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        accept(Array.from(target.files ?? []));
        // Reset so choosing the same file again fires change.
        target.value = '';
    }

    function choose(): void {
        input.value?.click();
    }

    function upload(): void {
        if (files.value.length === 0) return;
        emit('uploader', { files: files.value });
        files.value.forEach(revoke);
        files.value = [];
    }

    function clear(): void {
        files.value.forEach(revoke);
        files.value = [];
        rejected.value = [];
        emit('clear');
    }

    function remove(index: number): void {
        const file = files.value[index];
        if (!file) return;
        revoke(file);
        files.value = files.value.filter((_, i) => i !== index);
        emit('remove', { file, files: files.value });
    }

    const { isOverDropZone } = useDropZone(content, {
        onDrop: (dropped) => {
            if (dropped) accept(dropped);
        }
    });

    const hasFiles = computed(() => files.value.length > 0);

    onBeforeUnmount(() => {
        files.value.forEach(revoke);
    });

    defineExpose({ upload, clear, files });
</script>

<template>
    <div :class="cn('flex flex-col gap-3', props.class)" data-slot="file-upload" :data-mode="props.mode">
        <input ref="input" type="file" class="sr-only" :name="props.name" :multiple="props.multiple" :accept="props.accept" :disabled="props.disabled" tabindex="-1" @change="onChange" />
        <template v-if="props.mode === 'basic'">
            <div class="flex items-center gap-3">
                <Button type="button" variant="secondary" :disabled="props.disabled" data-slot="file-upload-choose" @click="choose"><IconPaperclip class="size-4" />{{ hasFiles ? files[0]!.name : props.chooseLabel }}</Button>
                <span v-if="hasFiles" class="sr-only" data-slot="file-upload-basic-name">{{ files[0]!.name }}</span>
            </div>
        </template>
        <template v-else>
            <div class="flex flex-wrap items-center gap-2 rounded-t-lg border border-border bg-muted/40 p-3" data-slot="file-upload-toolbar">
                <Button type="button" variant="secondary" :disabled="props.disabled" data-slot="file-upload-choose" @click="choose"><IconPlus class="size-4" />{{ props.chooseLabel }}</Button>
                <Button type="button" :disabled="props.disabled || !hasFiles" data-slot="file-upload-upload" @click="upload"><IconUpload class="size-4" />{{ props.uploadLabel }}</Button>
                <Button type="button" variant="outline" :disabled="props.disabled || !hasFiles" data-slot="file-upload-cancel" @click="clear"><IconTimes class="size-4" />{{ props.cancelLabel }}</Button>
            </div>
            <div ref="content" :class="cn('flex min-h-40 flex-col gap-3 rounded-b-lg border border-t-0 border-border p-4 transition-colors', isOverDropZone && 'bg-accent')" data-slot="file-upload-content">
                <Progress v-if="hasFiles" :model-value="0" class="h-1.5" />
                <Alert v-for="item in rejected" :key="item.message" variant="destructive" data-slot="file-upload-message">
                    <AlertDescription>{{ item.message }}</AlertDescription>
                </Alert>
                <div v-if="hasFiles" class="flex flex-col gap-2">
                    <div v-for="(file, index) in files" :key="`${file.name}-${file.size}-${index}`" class="flex items-center gap-4 rounded-lg border border-border p-3" data-slot="file-upload-file">
                        <img v-if="previewOf(file)" :src="previewOf(file)" :alt="file.name" class="size-12 rounded object-cover" />
                        <IconFile v-else class="size-8 text-muted-foreground" />
                        <div class="flex min-w-0 flex-1 flex-col">
                            <span class="truncate font-medium">{{ file.name }}</span>
                            <span class="text-sm text-muted-foreground">{{ formatSize(file.size) }}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" :aria-label="`Remove ${file.name}`" @click="remove(index)"><IconTimes class="size-4" /></Button>
                    </div>
                </div>
                <div v-else class="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
                    <IconCloudUpload class="size-10" />
                    <span>Drag and drop files to here to upload.</span>
                </div>
            </div>
        </template>
    </div>
</template>
```

In basic mode the visible button carries the name; the `sr-only` span exists so the test can read it without depending on button copy. The `Progress` at 0 matches PrimeVue's idle bar; a consumer that performs a real upload drives progress itself. Create `src/components/file-upload/index.ts`:

```ts
export { default as FileUpload } from './FileUpload.vue';
export { formatSize, validateFiles } from './validate';
```

- [ ] **Step 5: Run the upload suites**

Run: `bun run test src/components/file-upload`
Expected: PASS, 9 tests. If the drop test fails because `useDropZone` checks `event.dataTransfer.types` for `Files` and jsdom's synthetic event drops the property, dispatch the events manually in the test with `new Event('drop')` and `Object.defineProperty(event, 'dataTransfer', { value: transfer })`; the component code stays as written.

- [ ] **Step 6: Verify and commit**

Run `bunx prettier --check src/components/file-upload`, then `bun run type-check`, `bun run lint`, `bun run test` (136 tests in 28 files), `bun run build`.

```bash
git add src/components/file-upload
```
```bash
git commit -m "feat: add FileUpload with validation, drop zone and previews"
```

---

### Task 8: `Galleria` and `ImagePreview`

**Files:**
- Create: `src/components/Galleria.vue`, `src/components/ImagePreview.vue`
- Test: `src/components/Galleria.test.ts`, `src/components/ImagePreview.test.ts`

**Interfaces:**
- Consumes: vendored `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselNext`, `CarouselPrevious`, type `CarouselApi`; `Dialog`, `DialogContent`, `DialogTitle`; `useIntervalFn`, `useFullscreen`, `useWindowSize` from `@vueuse/core`; icons `IconWindowMaximize`, `IconWindowMinimize`, `IconSearchPlus`, `IconSearchMinus`, `IconRotate`, `IconSearch`, `IconAngleLeft`, `IconAngleRight`.
- Produces: `Galleria` with props `value: GalleriaItem[]` (`itemImageSrc`, `thumbnailImageSrc`, `alt?`, `title?`), `numVisible?` (default `5`), `responsiveOptions?: { breakpoint: string; numVisible: number }[]`, `showThumbnails?` (default `true`), `showIndicators?` (default `false`), `circular?`, `autoPlay?`, `transitionInterval?` (default `4000`), `fullScreen?` (shows a fullscreen toggle), `containerStyle?`, `containerClass?`; model `v-model:activeIndex`; slots `item` and `thumbnail` (`{ item, index }`), `caption`. `ImagePreview` with props `src`, `alt?`, `width?`, `height?`, `preview?` (default `true`), `imageClass?`.

- [ ] **Step 1: Write the failing Galleria test**

Create `src/components/Galleria.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Galleria from './Galleria.vue';

const value = [
    { itemImageSrc: '/a.jpg', thumbnailImageSrc: '/a-s.jpg', alt: 'A' },
    { itemImageSrc: '/b.jpg', thumbnailImageSrc: '/b-s.jpg', alt: 'B' },
    { itemImageSrc: '/c.jpg', thumbnailImageSrc: '/c-s.jpg', alt: 'C' }
];

describe('Galleria', () => {
    it('renders every item through the item slot, thumbnails and indicators', () => {
        const wrapper = mount(Galleria, {
            props: { value, showIndicators: true, numVisible: 2 },
            slots: {
                item: `<template #item="{ item }"><img :src="item.itemImageSrc" :alt="item.alt" data-testid="item" /></template>`,
                thumbnail: `<template #thumbnail="{ item }"><img :src="item.thumbnailImageSrc" :alt="item.alt" data-testid="thumb" /></template>`
            }
        });
        expect(wrapper.findAll('[data-testid=item]')).toHaveLength(3);
        expect(wrapper.findAll('[data-testid=thumb]')).toHaveLength(3);
        expect(wrapper.findAll('[data-slot=galleria-indicator]')).toHaveLength(3);
        expect(wrapper.get('[data-slot=galleria-thumbnail]').attributes('style')).toContain('flex-basis: 50%');
    });

    it('activates the clicked thumbnail and indicator and emits the index', async () => {
        const wrapper = mount(Galleria, { props: { value, showIndicators: true } });
        await wrapper.findAll('[data-slot=galleria-thumbnail]')[2]!.trigger('click');
        expect(wrapper.emitted('update:activeIndex')!.at(-1)).toEqual([2]);
        expect(wrapper.findAll('[data-slot=galleria-thumbnail]')[2]!.attributes('data-active')).toBe('true');
        await wrapper.findAll('[data-slot=galleria-indicator]')[0]!.trigger('click');
        expect(wrapper.emitted('update:activeIndex')!.at(-1)).toEqual([0]);
    });

    it('shows the fullscreen toggle only when asked and renders no thumbnails when hidden', () => {
        const plain = mount(Galleria, { props: { value, showThumbnails: false } });
        expect(plain.find('[data-slot=galleria-thumbnail]').exists()).toBe(false);
        expect(plain.find('[aria-label="Toggle fullscreen"]').exists()).toBe(false);
        const full = mount(Galleria, { props: { value, fullScreen: true } });
        expect(full.find('[aria-label="Toggle fullscreen"]').exists()).toBe(true);
    });
});
```

- [ ] **Step 2: Run to verify it fails, then write `Galleria.vue`**

```vue
<script setup lang="ts">
    import { useFullscreen, useIntervalFn, useWindowSize } from '@vueuse/core';
    import { computed, ref, watch, type CSSProperties } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
    import { IconAngleLeft, IconAngleRight, IconWindowMaximize, IconWindowMinimize } from '@/components/icons';
    import { cn } from '@/lib/utils';

    export interface GalleriaItem {
        itemImageSrc: string;
        thumbnailImageSrc: string;
        alt?: string;
        title?: string;
    }

    const props = withDefaults(
        defineProps<{
            value: GalleriaItem[];
            numVisible?: number;
            responsiveOptions?: { breakpoint: string; numVisible: number }[];
            showThumbnails?: boolean;
            showIndicators?: boolean;
            circular?: boolean;
            autoPlay?: boolean;
            transitionInterval?: number;
            fullScreen?: boolean;
            containerStyle?: string | CSSProperties;
            containerClass?: string;
        }>(),
        { numVisible: 5, responsiveOptions: () => [], showThumbnails: true, showIndicators: false, circular: false, autoPlay: false, transitionInterval: 4000, fullScreen: false, containerStyle: undefined, containerClass: undefined }
    );

    const activeIndex = defineModel<number>('activeIndex', { default: 0 });

    const root = ref<HTMLElement | null>(null);
    const strip = ref<HTMLElement | null>(null);
    let api: CarouselApi | undefined;

    function onInitApi(instance: CarouselApi): void {
        api = instance;
        api.on('select', () => {
            activeIndex.value = api?.selectedScrollSnap() ?? 0;
        });
    }

    function goTo(index: number): void {
        // Set directly as well as through embla so the active state does not wait on a layout pass.
        activeIndex.value = index;
        api?.scrollTo(index);
    }

    watch(activeIndex, (index) => {
        if (api && api.selectedScrollSnap() !== index) api.scrollTo(index);
        strip.value?.children[index]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    });

    // PrimeVue's responsiveOptions are max-width breakpoints; the smallest one wider than the viewport wins.
    const { width } = useWindowSize();
    const visible = computed(() => {
        const match = [...props.responsiveOptions].sort((a, b) => parseInt(a.breakpoint, 10) - parseInt(b.breakpoint, 10)).find((option) => width.value <= parseInt(option.breakpoint, 10));
        return Math.max(1, match?.numVisible ?? props.numVisible);
    });

    const { pause, resume } = useIntervalFn(
        () => {
            const next = activeIndex.value + 1;
            goTo(next >= props.value.length ? 0 : next);
        },
        () => props.transitionInterval,
        { immediate: props.autoPlay }
    );
    watch(
        () => props.autoPlay,
        (on) => (on ? resume() : pause())
    );

    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(root);
</script>

<template>
    <div ref="root" :class="cn('flex flex-col gap-3 bg-card', isFullscreen && 'justify-center p-4', props.containerClass)" :style="props.containerStyle" data-slot="galleria">
        <div class="relative">
            <Carousel :opts="{ loop: props.circular }" class="w-full" @init-api="onInitApi">
                <CarouselContent>
                    <CarouselItem v-for="(item, index) in props.value" :key="index" data-slot="galleria-item">
                        <slot name="item" :item="item" :index="index"><img :src="item.itemImageSrc" :alt="item.alt ?? ''" class="w-full" /></slot>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious class="left-2" />
                <CarouselNext class="right-2" />
            </Carousel>
            <Button v-if="props.fullScreen" variant="secondary" size="icon-sm" class="absolute top-2 right-2" aria-label="Toggle fullscreen" @click="toggleFullscreen">
                <IconWindowMinimize v-if="isFullscreen" class="size-4" />
                <IconWindowMaximize v-else class="size-4" />
            </Button>
            <div v-if="$slots.caption" class="absolute inset-x-0 bottom-0 bg-black/50 p-3 text-white"><slot name="caption" :item="props.value[activeIndex]" :index="activeIndex" /></div>
        </div>
        <div v-if="props.showIndicators" class="flex justify-center gap-2" data-slot="galleria-indicators">
            <button v-for="(_, index) in props.value" :key="index" type="button" :class="cn('size-2.5 rounded-full bg-muted transition-colors', index === activeIndex && 'bg-primary')" :aria-label="`Go to item ${index + 1}`" :data-active="index === activeIndex || undefined" data-slot="galleria-indicator" @click="goTo(index)" />
        </div>
        <div v-if="props.showThumbnails" class="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Previous thumbnails" @click="goTo(Math.max(0, activeIndex - 1))"><IconAngleLeft class="size-4" /></Button>
            <div ref="strip" class="flex flex-1 gap-2 overflow-hidden" data-slot="galleria-thumbnails">
                <button
                    v-for="(item, index) in props.value"
                    :key="index"
                    type="button"
                    :style="{ flexBasis: `${100 / visible}%` }"
                    :class="cn('shrink-0 grow-0 overflow-hidden rounded-md border-2 border-transparent opacity-70 transition-opacity hover:opacity-100', index === activeIndex && 'border-primary opacity-100')"
                    :aria-label="`Show item ${index + 1}`"
                    :data-active="index === activeIndex || undefined"
                    data-slot="galleria-thumbnail"
                    @click="goTo(index)"
                >
                    <slot name="thumbnail" :item="item" :index="index"><img :src="item.thumbnailImageSrc" :alt="item.alt ?? ''" class="w-full" /></slot>
                </button>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Next thumbnails" @click="goTo(Math.min(props.value.length - 1, activeIndex + 1))"><IconAngleRight class="size-4" /></Button>
        </div>
    </div>
</template>
```

`useIntervalFn`'s second argument accepts a getter in VueUse 14, so a changed `transitionInterval` takes effect without remounting; if the installed typing rejects the getter, pass `props.transitionInterval` and watch it to `pause()` and `resume()`.

- [ ] **Step 3: Run the Galleria test**

Run: `bun run test src/components/Galleria.test.ts`
Expected: PASS, 3 tests. If embla throws on mount under jsdom (no layout), the root cause is `getBoundingClientRect` returning zeros; wrap the `Carousel` in `<ClientOnly>`-style guard is not available, so instead stub `HTMLElement.prototype.getBoundingClientRect` in `src/test/setup.ts` to return a 100x100 box when it returns all zeros, and note it in the report. Do not skip the test.

- [ ] **Step 4: Write the failing ImagePreview test**

Create `src/components/ImagePreview.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import ImagePreview from './ImagePreview.vue';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('ImagePreview', () => {
    it('renders the image with its size and opens a zoomable overlay on click', async () => {
        const wrapper = mount(ImagePreview, { props: { src: '/x.jpg', alt: 'X', width: '250' }, attachTo: document.body });
        const image = wrapper.get('img');
        expect(image.attributes('width')).toBe('250');
        expect(document.body.querySelector('[role=dialog]')).toBeNull();
        await wrapper.get('[data-slot=image-preview-trigger]').trigger('click');
        await nextTick();
        const overlay = document.body.querySelector<HTMLImageElement>('[data-slot=image-preview-overlay-image]')!;
        expect(overlay.getAttribute('src')).toBe('/x.jpg');
        expect(overlay.style.transform).toBe('rotate(0deg) scale(1)');
        document.body.querySelector<HTMLButtonElement>('[aria-label="Zoom in"]')!.click();
        await nextTick();
        expect(overlay.style.transform).toBe('rotate(0deg) scale(1.1)');
        document.body.querySelector<HTMLButtonElement>('[aria-label="Rotate right"]')!.click();
        await nextTick();
        expect(overlay.style.transform).toBe('rotate(90deg) scale(1.1)');
        wrapper.unmount();
    });

    it('renders a plain image when preview is off', () => {
        const wrapper = mount(ImagePreview, { props: { src: '/x.jpg', preview: false } });
        expect(wrapper.find('[data-slot=image-preview-trigger]').exists()).toBe(false);
    });
});
```

- [ ] **Step 5: Run to verify it fails, then write `ImagePreview.vue`**

```vue
<script setup lang="ts">
    import { computed, ref, watch } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
    import { IconRotate, IconSearch, IconSearchMinus, IconSearchPlus } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(
        defineProps<{
            src: string;
            alt?: string;
            width?: string | number;
            height?: string | number;
            preview?: boolean;
            imageClass?: string;
            class?: string;
        }>(),
        { alt: '', width: undefined, height: undefined, preview: true, imageClass: undefined, class: undefined }
    );

    const open = ref(false);
    // PrimeVue's zoom range and step.
    const scale = ref(1);
    const rotation = ref(0);
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 1.5;
    const STEP = 0.1;

    function zoom(delta: number): void {
        scale.value = Math.round(Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value + delta)) * 10) / 10;
    }

    function rotate(delta: number): void {
        rotation.value += delta;
    }

    watch(open, (isOpen) => {
        if (!isOpen) {
            scale.value = 1;
            rotation.value = 0;
        }
    });

    const transform = computed(() => `rotate(${rotation.value}deg) scale(${scale.value})`);
</script>

<template>
    <span :class="cn('relative inline-block', props.class)" data-slot="image-preview">
        <img :src="props.src" :alt="props.alt" :width="props.width" :height="props.height" :class="props.imageClass" />
        <button v-if="props.preview" type="button" class="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all hover:bg-black/40 hover:opacity-100 focus-visible:opacity-100" :aria-label="`Preview ${props.alt || 'image'}`" data-slot="image-preview-trigger" @click="open = true">
            <IconSearch class="size-6" />
        </button>
        <Dialog v-if="props.preview" v-model:open="open">
            <DialogContent class="flex max-w-4xl flex-col items-center gap-4 border-0 bg-transparent p-0 shadow-none" data-slot="image-preview-overlay">
                <DialogTitle class="sr-only">{{ props.alt || 'Image preview' }}</DialogTitle>
                <div class="flex gap-1 rounded-full bg-black/60 p-1">
                    <Button variant="ghost" size="icon-sm" class="text-white hover:bg-white/20" aria-label="Rotate right" @click="rotate(90)"><IconRotate class="size-4" /></Button>
                    <Button variant="ghost" size="icon-sm" class="text-white hover:bg-white/20" aria-label="Rotate left" @click="rotate(-90)"><IconRotate class="size-4 -scale-x-100" /></Button>
                    <Button variant="ghost" size="icon-sm" class="text-white hover:bg-white/20" aria-label="Zoom out" :disabled="scale <= MIN_SCALE" @click="zoom(-STEP)"><IconSearchMinus class="size-4" /></Button>
                    <Button variant="ghost" size="icon-sm" class="text-white hover:bg-white/20" aria-label="Zoom in" :disabled="scale >= MAX_SCALE" @click="zoom(STEP)"><IconSearchPlus class="size-4" /></Button>
                </div>
                <img :src="props.src" :alt="props.alt" class="max-h-[80vh] max-w-full transition-transform" :style="{ transform }" data-slot="image-preview-overlay-image" />
            </DialogContent>
        </Dialog>
    </span>
</template>
```

- [ ] **Step 6: Run both suites, verify and commit**

Run: `bun run test src/components/Galleria.test.ts src/components/ImagePreview.test.ts` (PASS, 5 tests). Then `bunx prettier --check src/components/Galleria.vue src/components/Galleria.test.ts src/components/ImagePreview.vue src/components/ImagePreview.test.ts`, `bun run type-check`, `bun run lint`, `bun run test` (141 tests in 30 files), `bun run build`.

```bash
git add src/components/Galleria.vue src/components/Galleria.test.ts src/components/ImagePreview.vue src/components/ImagePreview.test.ts
```
```bash
git commit -m "feat: add Galleria on the vendored Carousel and a zoomable ImagePreview"
```

---

### Task 9: `Knob`, `ColorPicker`, `FloatLabel`, and the Plan 2 form deferrals

**Files:**
- Create: `src/components/knob-math.ts`, `src/components/Knob.vue`, `src/components/ColorPicker.vue`, `src/components/FloatLabel.vue`
- Modify: `src/components/PasswordInput.vue`, `src/components/StarRating.vue`
- Test: `src/components/knob-math.test.ts`, `src/components/Knob.test.ts`, `src/components/ColorPicker.test.ts`, `src/components/PasswordInput.test.ts`, `src/components/StarRating.test.ts`

**Interfaces:**
- Produces: `Knob` (`v-model: number`, `min?` 0, `max?` 100, `step?` 1, `size?` 100, `strokeWidth?` 14, `valueColor?`, `rangeColor?`, `textColor?`, `valueTemplate?` `'{value}'`, `readonly?`, `disabled?`, `showValue?` true); `ColorPicker` (`v-model: string`, `inline?`, `disabled?`); `FloatLabel` (`variant?: 'over' | 'in' | 'on'`); `PasswordInput` gains `autocomplete?: string` (default `current-password`); `StarRating` guards `stars`.
- Pure: `knobArc({ value, min, max, radius })` returning `{ rangePath, valuePath }`, `angleToValue(angle, min, max, step)`, `clampStep(value, min, max, step)`.

- [ ] **Step 1: Write the failing knob-math tests**

Create `src/components/knob-math.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { angleToValue, clampStep, knobArc } from './knob-math';

describe('knob math', () => {
    it('clamps and snaps to the step from min', () => {
        expect(clampStep(37, 0, 100, 10)).toBe(40);
        expect(clampStep(-20, -50, 50, 10)).toBe(-20);
        expect(clampStep(120, 0, 100, 1)).toBe(100);
        expect(clampStep(-3, 0, 100, 1)).toBe(0);
    });

    it('maps the pointer angle to a value across the dial, ignoring the dead zone at the bottom', () => {
        expect(angleToValue((4 * Math.PI) / 3, 0, 100, 1)).toBe(0);
        expect(angleToValue(-Math.PI / 3, 0, 100, 1)).toBe(100);
        expect(angleToValue(Math.PI / 2, 0, 100, 1)).toBe(50);
        expect(angleToValue(-Math.PI / 2, 0, 100, 1)).toBeUndefined();
    });

    it('draws the range arc from min to max and the value arc from zero to the value', () => {
        const { rangePath, valuePath } = knobArc({ value: 50, min: 0, max: 100, radius: 40 });
        expect(rangePath).toBe('M 30 84.641 A 40 40 0 1 1 70 84.641');
        expect(valuePath).toBe('M 30 84.641 A 40 40 0 0 1 50 10');
        expect(knobArc({ value: 0, min: -50, max: 50, radius: 40 }).valuePath).toBe('M 50 10 A 40 40 0 0 1 50 10');
    });
});
```

- [ ] **Step 2: Run to verify it fails, then write `knob-math.ts`**

```ts
// Geometry lifted from PrimeVue's Knob: a 100x100 viewBox, the dial open at the bottom between
// 240 degrees (min) and -60 degrees (max), angles in radians measured counter-clockwise from 3 o'clock.
const MID = 50;
export const MIN_RADIANS = (4 * Math.PI) / 3;
export const MAX_RADIANS = -Math.PI / 3;

function mapRange(x: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function round3(n: number): number {
    return Math.round(n * 1000) / 1000;
}

function point(radians: number, radius: number): { x: number; y: number } {
    return { x: round3(MID + Math.cos(radians) * radius), y: round3(MID - Math.sin(radians) * radius) };
}

export function clampStep(value: number, min: number, max: number, step: number): number {
    const clamped = Math.min(max, Math.max(min, value));
    return Math.round((clamped - min) / step) * step + min;
}

// Returns undefined when the pointer sits in the gap below the dial, where PrimeVue also ignores it.
export function angleToValue(angle: number, min: number, max: number, step: number): number | undefined {
    const start = -Math.PI / 2 - Math.PI / 6;
    let mapped: number;
    if (angle > MAX_RADIANS) mapped = mapRange(angle, MIN_RADIANS, MAX_RADIANS, min, max);
    else if (angle < start) mapped = mapRange(angle + 2 * Math.PI, MIN_RADIANS, MAX_RADIANS, min, max);
    else return undefined;
    return clampStep(mapped, min, max, step);
}

export function knobArc(input: { value: number; min: number; max: number; radius: number }): { rangePath: string; valuePath: string } {
    const { value, min, max, radius } = input;
    const minPoint = point(MIN_RADIANS, radius);
    const maxPoint = point(MAX_RADIANS, radius);
    const zeroRadians = min > 0 && max > 0 ? mapRange(min, min, max, MIN_RADIANS, MAX_RADIANS) : mapRange(0, min, max, MIN_RADIANS, MAX_RADIANS);
    const valueRadians = mapRange(value, min, max, MIN_RADIANS, MAX_RADIANS);
    const zero = point(zeroRadians, radius);
    const end = point(valueRadians, radius);
    const largeArc = Math.abs(zeroRadians - valueRadians) < Math.PI ? 0 : 1;
    const sweep = valueRadians > zeroRadians ? 0 : 1;
    return {
        rangePath: `M ${minPoint.x} ${minPoint.y} A ${radius} ${radius} 0 1 1 ${maxPoint.x} ${maxPoint.y}`,
        valuePath: `M ${zero.x} ${zero.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`
    };
}
```

Run `bun run test src/components/knob-math.test.ts`: PASS, 3 tests. If a coordinate assertion differs in the third decimal, the test's literal is corrected to the computed value (the geometry, not the rounding, is the contract), and the report says which.

- [ ] **Step 3: Write the failing Knob test**

Create `src/components/Knob.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Knob from './Knob.vue';

describe('Knob', () => {
    it('renders the value through valueTemplate and exposes slider semantics', () => {
        const wrapper = mount(Knob, { props: { modelValue: 20, min: -50, max: 50, step: 10, valueTemplate: '{value}%' } });
        expect(wrapper.get('[data-slot=knob-value]').text()).toBe('20%');
        const dial = wrapper.get('[role=slider]');
        expect(dial.attributes('aria-valuemin')).toBe('-50');
        expect(dial.attributes('aria-valuemax')).toBe('50');
        expect(dial.attributes('aria-valuenow')).toBe('20');
    });

    it('steps with the keyboard and clamps at the ends', async () => {
        const wrapper = mount(Knob, { props: { modelValue: 45, min: 0, max: 50, step: 10 } });
        const dial = wrapper.get('[role=slider]');
        await dial.trigger('keydown', { key: 'ArrowUp' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([50]);
        await wrapper.setProps({ modelValue: 50 });
        await dial.trigger('keydown', { key: 'ArrowRight' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([50]);
        await dial.trigger('keydown', { key: 'Home' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([0]);
        await dial.trigger('keydown', { key: 'End' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([50]);
    });

    it('ignores input when readonly or disabled', async () => {
        const readonly = mount(Knob, { props: { modelValue: 10, readonly: true } });
        await readonly.get('[role=slider]').trigger('keydown', { key: 'ArrowUp' });
        expect(readonly.emitted('update:modelValue')).toBeUndefined();
        const disabled = mount(Knob, { props: { modelValue: 10, disabled: true } });
        await disabled.get('[role=slider]').trigger('keydown', { key: 'ArrowUp' });
        expect(disabled.emitted('update:modelValue')).toBeUndefined();
        expect(disabled.get('[role=slider]').attributes('aria-disabled')).toBe('true');
    });
});
```

- [ ] **Step 4: Run to verify it fails, then write `Knob.vue`**

```vue
<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { cn } from '@/lib/utils';
    import { angleToValue, clampStep, knobArc } from './knob-math';

    const props = withDefaults(
        defineProps<{
            min?: number;
            max?: number;
            step?: number;
            size?: number;
            strokeWidth?: number;
            valueColor?: string;
            rangeColor?: string;
            textColor?: string;
            valueTemplate?: string;
            readonly?: boolean;
            disabled?: boolean;
            showValue?: boolean;
            class?: string;
        }>(),
        { min: 0, max: 100, step: 1, size: 100, strokeWidth: 14, valueColor: 'var(--primary)', rangeColor: 'var(--muted)', textColor: 'var(--foreground)', valueTemplate: '{value}', readonly: false, disabled: false, showValue: true, class: undefined }
    );

    const model = defineModel<number>({ default: 0 });
    const inert = computed(() => props.readonly || props.disabled);
    const radius = 40;
    const arc = computed(() => knobArc({ value: clampStep(model.value, props.min, props.max, props.step), min: props.min, max: props.max, radius }));
    const label = computed(() => props.valueTemplate.replace('{value}', String(model.value)));

    function set(value: number): void {
        const next = clampStep(value, props.min, props.max, props.step);
        if (next !== model.value) model.value = next;
    }

    const svg = ref<SVGSVGElement | null>(null);
    let dragging = false;

    function fromPointer(event: PointerEvent): void {
        const rect = svg.value?.getBoundingClientRect();
        if (!rect) return;
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = rect.height / 2 - (event.clientY - rect.top);
        const value = angleToValue(Math.atan2(dy, dx), props.min, props.max, props.step);
        if (value !== undefined) set(value);
    }

    function onPointerDown(event: PointerEvent): void {
        if (inert.value) return;
        dragging = true;
        svg.value?.setPointerCapture?.(event.pointerId);
        fromPointer(event);
    }

    function onPointerMove(event: PointerEvent): void {
        if (dragging) fromPointer(event);
    }

    function onPointerUp(): void {
        dragging = false;
    }

    function onKeydown(event: KeyboardEvent): void {
        if (inert.value) return;
        const steps: Record<string, number> = { ArrowUp: props.step, ArrowRight: props.step, ArrowDown: -props.step, ArrowLeft: -props.step, PageUp: props.step * 10, PageDown: -props.step * 10 };
        if (event.key === 'Home') set(props.min);
        else if (event.key === 'End') set(props.max);
        else if (event.key in steps) set(model.value + steps[event.key]!);
        else return;
        event.preventDefault();
    }
</script>

<template>
    <div :class="cn('inline-flex', props.class)" data-slot="knob">
        <svg
            ref="svg"
            viewBox="0 0 100 100"
            :width="props.size"
            :height="props.size"
            role="slider"
            :tabindex="inert ? -1 : 0"
            :aria-valuemin="props.min"
            :aria-valuemax="props.max"
            :aria-valuenow="model"
            :aria-valuetext="label"
            :aria-disabled="props.disabled || undefined"
            :aria-readonly="props.readonly || undefined"
            :class="cn('rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring', inert ? 'cursor-default' : 'cursor-pointer')"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @keydown="onKeydown"
        >
            <path :d="arc.rangePath" :stroke-width="props.strokeWidth" :stroke="props.rangeColor" fill="none" stroke-linecap="round" />
            <path :d="arc.valuePath" :stroke-width="props.strokeWidth" :stroke="props.valueColor" fill="none" stroke-linecap="round" />
            <text v-if="props.showValue" x="50" y="57" text-anchor="middle" :fill="props.textColor" class="text-[1.1rem] font-medium" data-slot="knob-value">{{ label }}</text>
        </svg>
    </div>
</template>
```

Run `bun run test src/components/Knob.test.ts`: PASS, 3 tests.

- [ ] **Step 5: `ColorPicker` with its test**

Create `src/components/ColorPicker.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ColorPicker from './ColorPicker.vue';

describe('ColorPicker', () => {
    it('emits the picked hex value and reflects the model', async () => {
        const wrapper = mount(ColorPicker, { props: { modelValue: '#1976d2' } });
        const input = wrapper.get('input[type=color]');
        expect((input.element as HTMLInputElement).value).toBe('#1976d2');
        await input.setValue('#ff0000');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['#ff0000']);
    });

    it('accepts a value without the hash and normalises it', () => {
        const wrapper = mount(ColorPicker, { props: { modelValue: 'FF00AA' } });
        expect((wrapper.get('input[type=color]').element as HTMLInputElement).value).toBe('#ff00aa');
    });

    it('marks the inline variant', () => {
        expect(mount(ColorPicker, { props: { modelValue: '#000000', inline: true } }).get('[data-slot=color-picker]').attributes('data-inline')).toBe('true');
    });
});
```

Create `src/components/ColorPicker.vue`:

```vue
<script setup lang="ts">
    import { computed } from 'vue';
    import { cn } from '@/lib/utils';

    // The native colour input replaces PrimeVue's canvas picker: the OS dialog is the overlay, and
    // inline renders the same control as a large swatch. Values are hex with a leading hash.
    const props = withDefaults(defineProps<{ inline?: boolean; disabled?: boolean; class?: string }>(), { inline: false, disabled: false, class: undefined });
    const model = defineModel<string>({ default: '#000000' });

    const normalised = computed(() => {
        const raw = model.value.trim().replace(/^#/, '').toLowerCase();
        return /^[0-9a-f]{6}$/.test(raw) ? `#${raw}` : '#000000';
    });

    function onInput(event: Event): void {
        model.value = (event.target as HTMLInputElement).value;
    }
</script>

<template>
    <span :class="cn('inline-flex', props.class)" data-slot="color-picker" :data-inline="props.inline || undefined">
        <input type="color" :value="normalised" :disabled="props.disabled" :class="cn('cursor-pointer rounded-md border border-input bg-transparent p-0.5', props.inline ? 'size-24' : 'size-8', props.disabled && 'cursor-not-allowed opacity-50')" @input="onInput" />
    </span>
</template>
```

Run `bun run test src/components/ColorPicker.test.ts`: PASS, 3 tests.

- [ ] **Step 6: `FloatLabel`**

Create `src/components/FloatLabel.vue` (CSS only, no test):

```vue
<script setup lang="ts">
    import { cn } from '@/lib/utils';

    // The wrapped input needs placeholder=" " (one space) so :placeholder-shown tracks emptiness; the
    // label sits inside the control until focus or a value lifts it, matching PrimeVue's three variants.
    const props = withDefaults(defineProps<{ variant?: 'over' | 'in' | 'on'; class?: string }>(), { variant: 'over', class: undefined });
</script>

<template>
    <div
        :class="
            cn(
                'relative [&>label]:pointer-events-none [&>label]:absolute [&>label]:left-3 [&>label]:top-1/2 [&>label]:-translate-y-1/2 [&>label]:text-muted-foreground [&>label]:transition-all [&>label]:duration-200',
                props.variant === 'over' && '[&:has(input:focus)>label]:-top-2 [&:has(input:focus)>label]:bg-background [&:has(input:focus)>label]:px-1 [&:has(input:focus)>label]:text-xs [&:has(input:not(:placeholder-shown))>label]:-top-2 [&:has(input:not(:placeholder-shown))>label]:bg-background [&:has(input:not(:placeholder-shown))>label]:px-1 [&:has(input:not(:placeholder-shown))>label]:text-xs [&:has(input:not(:placeholder-shown))>label]:translate-y-0 [&:has(input:focus)>label]:translate-y-0',
                props.variant === 'in' && '[&>input]:h-12 [&>input]:pt-5 [&:has(input:focus)>label]:top-2 [&:has(input:focus)>label]:translate-y-0 [&:has(input:focus)>label]:text-xs [&:has(input:not(:placeholder-shown))>label]:top-2 [&:has(input:not(:placeholder-shown))>label]:translate-y-0 [&:has(input:not(:placeholder-shown))>label]:text-xs',
                props.variant === 'on' && '[&:has(input:focus)>label]:-top-2 [&:has(input:focus)>label]:translate-y-0 [&:has(input:focus)>label]:bg-background [&:has(input:focus)>label]:px-1 [&:has(input:focus)>label]:text-xs [&:has(input:not(:placeholder-shown))>label]:-top-2 [&:has(input:not(:placeholder-shown))>label]:translate-y-0 [&:has(input:not(:placeholder-shown))>label]:bg-background [&:has(input:not(:placeholder-shown))>label]:px-1 [&:has(input:not(:placeholder-shown))>label]:text-xs',
                props.class
            )
        "
        data-slot="float-label"
        :data-variant="props.variant"
    >
        <slot />
    </div>
</template>
```

- [ ] **Step 7: Plan 2 deferrals with tests first**

Append to `src/components/PasswordInput.test.ts`:

```ts
    it('defaults autocomplete to current-password and forwards an override', () => {
        expect(mount(PasswordInput, { props: { modelValue: '' } }).get('input').attributes('autocomplete')).toBe('current-password');
        expect(mount(PasswordInput, { props: { modelValue: '', autocomplete: 'new-password' } }).get('input').attributes('autocomplete')).toBe('new-password');
    });
```

Run it, see the second assertion fail, then in `PasswordInput.vue` add `autocomplete?: string;` to the props (default `'current-password'`) and bind `:autocomplete="props.autocomplete"` in place of the literal.

Append to `src/components/StarRating.test.ts`:

```ts
    it('falls back to five stars when stars is not a finite number', () => {
        expect(mount(StarRating, { props: { modelValue: null, stars: Number.NaN } }).findAll('[role=radio]')).toHaveLength(5);
        expect(mount(StarRating, { props: { modelValue: null, stars: 0 } }).findAll('[role=radio]')).toHaveLength(1);
    });

    it('prevents the default arrow-key scroll at the boundaries too', async () => {
        const wrapper = mount(StarRating, { props: { modelValue: 5 } });
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true, bubbles: true });
        wrapper.get('[role=radiogroup]').element.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
```

Run, see both fail, then in `StarRating.vue`: `values` becomes `Array.from({ length: Number.isFinite(props.stars) ? Math.max(1, Math.floor(props.stars)) : 5 }, ...)`, and in `onKeydown` move `event.preventDefault()` above the `if (next === null || next === current) return;` line but after the check that the key is an arrow key (so non-arrow keys still bubble): compute `next` first; if `next === null` return; `event.preventDefault()`; if `next === current` return.

- [ ] **Step 8: Run the affected suites, verify and commit**

Run: `bun run test src/components/knob-math.test.ts src/components/Knob.test.ts src/components/ColorPicker.test.ts src/components/PasswordInput.test.ts src/components/StarRating.test.ts` (PASS, 22 tests: 3 + 3 + 3 + 6 + 7). Then `bunx prettier --check` on the eight touched files, `bun run type-check`, `bun run lint`, `bun run test` (153 tests in 33 files), `bun run build`.

```bash
git add src/components/knob-math.ts src/components/knob-math.test.ts src/components/Knob.vue src/components/Knob.test.ts src/components/ColorPicker.vue src/components/ColorPicker.test.ts src/components/FloatLabel.vue src/components/PasswordInput.vue src/components/PasswordInput.test.ts src/components/StarRating.vue src/components/StarRating.test.ts
```
```bash
git commit -m "feat: add Knob, ColorPicker and FloatLabel and close the Plan 2 form deferrals"
```

---

### Task 10: `Listbox`, `MultiSelect`, `AutoComplete`, `SelectButton`, `ToggleButton`, `DatePicker`

**Files:**
- Create: `src/components/Listbox.vue`, `src/components/MultiSelect.vue`, `src/components/AutoComplete.vue`, `src/components/SelectButton.vue`, `src/components/ToggleButton.vue`, `src/components/DatePicker.vue`, `src/utils/dateFormat.ts`, `src/utils/optionAccess.ts`
- Test: `src/components/Listbox.test.ts`, `src/components/MultiSelect.test.ts`, `src/components/AutoComplete.test.ts`, `src/components/SelectButton.test.ts`, `src/components/ToggleButton.test.ts`, `src/components/DatePicker.test.ts`, `src/utils/dateFormat.test.ts`

**Interfaces:**
- Consumes: Reka `ListboxRoot`, `ListboxContent`, `ListboxFilter`, `ListboxItem`, `ListboxItemIndicator`; vendored `Combobox`, `ComboboxAnchor`, `ComboboxInput`, `ComboboxTrigger`, `ComboboxList`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxItem`, `ComboboxItemIndicator`; `ToggleGroup`, `ToggleGroupItem`, `Toggle`, `Calendar`, `Popover*`, `Button`, `Input`, `Checkbox`; `CalendarDate` from `@internationalized/date` and `toDate` from `reka-ui/date`; icons `IconCheck`, `IconAngleDown`, `IconTimes`, `IconCalendar`, `IconSearch`.
- Produces: shared `src/utils/optionAccess.ts` with `optionLabel(option, key?)`, `optionValue(option, key?)`, `sameOption(a, b, key?)`; `Listbox` (`v-model`, `options`, `optionLabel?`, `optionValue?`, `multiple?`, `filter?`, `filterPlaceholder?`, `disabled?`, slot `option`); `MultiSelect` (`v-model: unknown[]`, `options`, `optionLabel?`, `optionValue?`, `placeholder?`, `filter?`, `selectAll?`, `maxSelectedLabels?`, `display?: 'comma' | 'chip'`, slots `option`, `value`); `AutoComplete` (`v-model`, `suggestions`, `optionLabel?`, `multiple?`, `dropdown?`, `display?`, `placeholder?`, emits `complete({ query })`); `SelectButton` (`v-model`, `options`, `optionLabel?`, `optionValue?`, `multiple?`, `allowEmpty?` true, slot `option`); `ToggleButton` (`v-model: boolean`, `onLabel?`, `offLabel?`, `onIcon?`, `offIcon?`); `DatePicker` (`v-model: Date | null`, `showIcon?`, `showButtonBar?`, `dateFormat?` `'mm/dd/yy'`, `placeholder?`, `inline?`, `disabled?`); `formatDate(date, format)`.

- [ ] **Step 1: Option access helpers and date formatting, test-first**

Create `src/utils/optionAccess.ts` (pure, covered by the component tests):

```ts
// PrimeVue's optionLabel and optionValue contract: a key into the option object, or the option itself.
export function optionLabel(option: unknown, key?: string): string {
    if (key && option !== null && typeof option === 'object') return String((option as Record<string, unknown>)[key] ?? '');
    return option === null || option === undefined ? '' : String(option);
}

export function optionValue(option: unknown, key?: string): unknown {
    if (key && option !== null && typeof option === 'object') return (option as Record<string, unknown>)[key];
    return option;
}

export function sameOption(a: unknown, b: unknown, key?: string): boolean {
    if (key) return optionValue(a, key) === optionValue(b, key);
    if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') return JSON.stringify(a) === JSON.stringify(b);
    return a === b;
}
```

Create `src/utils/dateFormat.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatDate } from './dateFormat';

describe('formatDate', () => {
    const date = new Date(2020, 4, 6);

    it('understands PrimeVue tokens: dd mm yy y d m M MM D DD', () => {
        expect(formatDate(date, 'mm/dd/yy')).toBe('05/06/2020');
        expect(formatDate(date, 'd/m/y')).toBe('6/5/20');
        expect(formatDate(date, 'dd M yy')).toBe('06 May 2020');
        expect(formatDate(date, 'DD, MM d, yy')).toBe('Wednesday, May 6, 2020');
        expect(formatDate(date, 'D')).toBe('Wed');
    });

    it('leaves literal text and returns an empty string for null', () => {
        expect(formatDate(date, "'Week of' dd")).toBe('Week of 06');
        expect(formatDate(null, 'mm/dd/yy')).toBe('');
    });
});
```

Create `src/utils/dateFormat.ts`:

```ts
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// PrimeVue's dateFormat grammar (jQuery UI lineage): yy is the four-digit year, y two digits;
// doubled letters pad or spell out; single quotes wrap literal text.
export function formatDate(date: Date | null | undefined, format: string): string {
    if (!date) return '';
    const pad = (n: number): string => String(n).padStart(2, '0');
    let out = '';
    let i = 0;
    while (i < format.length) {
        const char = format[i]!;
        if (char === "'") {
            const end = format.indexOf("'", i + 1);
            out += end === -1 ? format.slice(i + 1) : format.slice(i + 1, end);
            i = end === -1 ? format.length : end + 1;
            continue;
        }
        const doubled = format[i + 1] === char;
        switch (char) {
            case 'd':
                out += doubled ? pad(date.getDate()) : String(date.getDate());
                break;
            case 'D':
                out += doubled ? DAY_LONG[date.getDay()] : DAY_SHORT[date.getDay()];
                break;
            case 'm':
                out += doubled ? pad(date.getMonth() + 1) : String(date.getMonth() + 1);
                break;
            case 'M':
                out += doubled ? MONTH_LONG[date.getMonth()] : MONTH_SHORT[date.getMonth()];
                break;
            case 'y':
                out += doubled ? String(date.getFullYear()) : String(date.getFullYear()).slice(-2);
                break;
            default:
                out += char;
                i += 1;
                continue;
        }
        i += doubled ? 2 : 1;
    }
    return out;
}
```

Run `bun run test src/utils/dateFormat.test.ts`: PASS, 2 tests.

- [ ] **Step 2: `Listbox`, test-first**

Create `src/components/Listbox.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Listbox from './Listbox.vue';

const options = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' }
];

describe('Listbox', () => {
    it('renders labels from optionLabel and emits the option on click', async () => {
        const wrapper = mount(Listbox, { props: { modelValue: null, options, optionLabel: 'name' } });
        expect(wrapper.findAll('[role=option]').map((o) => o.text())).toEqual(['New York', 'Rome', 'London']);
        await wrapper.findAll('[role=option]')[1]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([options[1]]);
    });

    it('emits optionValue when set and toggles in multiple mode', async () => {
        const wrapper = mount(Listbox, { props: { modelValue: [], options, optionLabel: 'name', optionValue: 'code', multiple: true } });
        await wrapper.findAll('[role=option]')[0]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([['NY']]);
    });

    it('filters options from the filter input', async () => {
        const wrapper = mount(Listbox, { props: { modelValue: null, options, optionLabel: 'name', filter: true } });
        await wrapper.get('[data-slot=listbox-filter]').setValue('lon');
        expect(wrapper.findAll('[role=option]').map((o) => o.text())).toEqual(['London']);
    });
});
```

Create `src/components/Listbox.vue`:

```vue
<script setup lang="ts">
    import { ListboxContent, ListboxFilter, ListboxItem, ListboxItemIndicator, ListboxRoot } from 'reka-ui';
    import { computed, ref } from 'vue';
    import { IconCheck } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { optionLabel as labelOf, optionValue as valueOf, sameOption } from '@/utils/optionAccess';

    const props = withDefaults(
        defineProps<{
            options: unknown[];
            optionLabel?: string;
            optionValue?: string;
            multiple?: boolean;
            filter?: boolean;
            filterPlaceholder?: string;
            disabled?: boolean;
            listStyle?: string;
            class?: string;
        }>(),
        { optionLabel: undefined, optionValue: undefined, multiple: false, filter: false, filterPlaceholder: 'Search', disabled: false, listStyle: undefined, class: undefined }
    );

    const model = defineModel<unknown>({ default: null });
    const query = ref('');
    const visible = computed(() => (query.value ? props.options.filter((option) => labelOf(option, props.optionLabel).toLowerCase().includes(query.value.toLowerCase())) : props.options));

    // Reka compares values by reference unless told how; option objects from a service are compared by fields.
    function by(a: unknown, b: unknown): boolean {
        return sameOption(a, b, props.optionValue ? undefined : props.optionLabel);
    }
</script>

<template>
    <ListboxRoot :model-value="model" :multiple="props.multiple" :disabled="props.disabled" :by="by" :class="cn('flex flex-col gap-1 rounded-lg border border-border bg-card p-1', props.class)" data-slot="listbox" @update:model-value="model = $event">
        <ListboxFilter v-if="props.filter" v-model="query" :placeholder="props.filterPlaceholder" class="mb-1 h-8 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" data-slot="listbox-filter" />
        <ListboxContent :style="props.listStyle" class="flex max-h-64 flex-col gap-0.5 overflow-auto outline-none">
            <ListboxItem v-for="option in visible" :key="labelOf(option, props.optionLabel)" :value="valueOf(option, props.optionValue)" class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none select-none hover:bg-muted data-[highlighted]:bg-muted data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[disabled]:opacity-50">
                <ListboxItemIndicator><IconCheck class="size-4" /></ListboxItemIndicator>
                <slot name="option" :option="option">{{ labelOf(option, props.optionLabel) }}</slot>
            </ListboxItem>
            <div v-if="visible.length === 0" class="px-3 py-2 text-sm text-muted-foreground">No results found</div>
        </ListboxContent>
    </ListboxRoot>
</template>
```

Run `bun run test src/components/Listbox.test.ts`: PASS, 3 tests. If `ListboxFilter` does not accept `v-model` as a plain string in 2.10.4 (its `modelValue` typing decides), bind `:model-value="query"` with `@update:model-value="query = $event"`.

- [ ] **Step 3: `MultiSelect`, test-first**

Create `src/components/MultiSelect.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import MultiSelect from './MultiSelect.vue';

const options = [
    { name: 'Australia', code: 'AU' },
    { name: 'Brazil', code: 'BR' },
    { name: 'China', code: 'CN' }
];

afterEach(() => {
    document.body.innerHTML = '';
});

async function open(wrapper: ReturnType<typeof mount>): Promise<void> {
    await wrapper.get('[data-slot=multi-select-trigger]').trigger('click');
    await nextTick();
}

function items(): HTMLElement[] {
    return Array.from(document.body.querySelectorAll<HTMLElement>('[role=option]'));
}

describe('MultiSelect', () => {
    it('shows the placeholder, then chips for each picked option', async () => {
        const wrapper = mount(MultiSelect, { props: { modelValue: [], options, optionLabel: 'name', placeholder: 'Select Countries' }, attachTo: document.body });
        expect(wrapper.get('[data-slot=multi-select-trigger]').text()).toBe('Select Countries');
        await open(wrapper);
        items()[0]!.click();
        await nextTick();
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([[options[0]]]);
        await wrapper.setProps({ modelValue: [options[0], options[2]] });
        expect(wrapper.findAll('[data-slot=multi-select-chip]').map((c) => c.text())).toEqual(['Australia', 'China']);
        wrapper.unmount();
    });

    it('collapses to a count past maxSelectedLabels and offers select all', async () => {
        const wrapper = mount(MultiSelect, { props: { modelValue: [options[0], options[1], options[2]], options, optionLabel: 'name', maxSelectedLabels: 2, selectAll: true }, attachTo: document.body });
        expect(wrapper.get('[data-slot=multi-select-trigger]').text()).toBe('3 items selected');
        await open(wrapper);
        document.body.querySelector<HTMLElement>('[data-slot=multi-select-select-all]')!.click();
        await nextTick();
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([[]]);
        wrapper.unmount();
    });

    it('renders the option slot', async () => {
        const wrapper = mount(MultiSelect, {
            props: { modelValue: [], options, optionLabel: 'name' },
            slots: { option: `<template #option="{ option }"><span data-testid="opt">{{ option.code }}</span></template>` },
            attachTo: document.body
        });
        await open(wrapper);
        expect(Array.from(document.body.querySelectorAll('[data-testid=opt]')).map((el) => el.textContent)).toEqual(['AU', 'BR', 'CN']);
        wrapper.unmount();
    });
});
```

Create `src/components/MultiSelect.vue`:

```vue
<script setup lang="ts">
    import { computed } from 'vue';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
    import { IconAngleDown } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { optionLabel as labelOf, optionValue as valueOf, sameOption } from '@/utils/optionAccess';

    const props = withDefaults(
        defineProps<{
            options: unknown[];
            optionLabel?: string;
            optionValue?: string;
            placeholder?: string;
            filter?: boolean;
            filterPlaceholder?: string;
            selectAll?: boolean;
            maxSelectedLabels?: number;
            display?: 'comma' | 'chip';
            disabled?: boolean;
            class?: string;
        }>(),
        { optionLabel: undefined, optionValue: undefined, placeholder: '', filter: false, filterPlaceholder: 'Search', selectAll: false, maxSelectedLabels: undefined, display: 'chip', disabled: false, class: undefined }
    );

    const model = defineModel<unknown[]>({ default: () => [] });

    function isSelected(option: unknown): boolean {
        return model.value.some((selected) => sameOption(selected, valueOf(option, props.optionValue), props.optionValue ? undefined : props.optionLabel));
    }

    function labelOfValue(value: unknown): string {
        const option = props.options.find((candidate) => sameOption(valueOf(candidate, props.optionValue), value, props.optionValue ? undefined : props.optionLabel));
        return labelOf(option ?? value, props.optionLabel);
    }

    const allSelected = computed(() => props.options.length > 0 && props.options.every(isSelected));
    const overLimit = computed(() => props.maxSelectedLabels !== undefined && model.value.length > props.maxSelectedLabels);

    function toggleAll(): void {
        model.value = allSelected.value ? [] : props.options.map((option) => valueOf(option, props.optionValue));
    }

    function onUpdate(value: unknown): void {
        model.value = Array.isArray(value) ? value : [];
    }
</script>

<template>
    <Combobox :model-value="model" multiple :disabled="props.disabled" :by="(a: unknown, b: unknown) => sameOption(a, b, props.optionValue ? undefined : props.optionLabel)" @update:model-value="onUpdate">
        <ComboboxAnchor as-child>
            <button type="button" :class="cn('flex min-h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-2.5 py-1 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50', props.class)" :disabled="props.disabled" data-slot="multi-select-trigger">
                <span v-if="model.length === 0" class="text-muted-foreground">{{ props.placeholder }}</span>
                <span v-else-if="overLimit">{{ model.length }} items selected</span>
                <slot v-else name="value" :value="model">
                    <span v-if="props.display === 'comma'" class="truncate">{{ model.map(labelOfValue).join(', ') }}</span>
                    <span v-else class="flex flex-wrap gap-1">
                        <span v-for="value in model" :key="labelOfValue(value)" class="rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground" data-slot="multi-select-chip">{{ labelOfValue(value) }}</span>
                    </span>
                </slot>
                <IconAngleDown class="size-4 shrink-0 opacity-50" />
            </button>
        </ComboboxAnchor>
        <ComboboxList align="start" class="w-(--reka-combobox-trigger-width) p-1" data-slot="multi-select-content">
            <div v-if="props.filter || props.selectAll" class="flex items-center gap-2 border-b border-border p-2">
                <Checkbox v-if="props.selectAll" :model-value="allSelected" aria-label="Select all" data-slot="multi-select-select-all" @update:model-value="toggleAll" />
                <ComboboxInput v-if="props.filter" :placeholder="props.filterPlaceholder" class="flex-1" />
            </div>
            <ComboboxEmpty>No results found</ComboboxEmpty>
            <ComboboxGroup>
                <ComboboxItem v-for="option in props.options" :key="labelOf(option, props.optionLabel)" :value="valueOf(option, props.optionValue)" class="gap-2">
                    <Checkbox :model-value="isSelected(option)" tabindex="-1" aria-hidden="true" class="pointer-events-none" />
                    <slot name="option" :option="option">{{ labelOf(option, props.optionLabel) }}</slot>
                </ComboboxItem>
            </ComboboxGroup>
        </ComboboxList>
    </Combobox>
</template>
```

Reka's `ComboboxRoot` filters items by their text against `ComboboxInput` on its own, so `filter` only decides whether the input is rendered. `ComboboxList` in the vendored folder wraps `ComboboxPortal` and `ComboboxContent` with `position="popper"`; if it does not accept `align`, drop that prop (its content already aligns start). Run `bun run test src/components/MultiSelect.test.ts`: PASS, 3 tests.

- [ ] **Step 4: `AutoComplete`, test-first**

Create `src/components/AutoComplete.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import AutoComplete from './AutoComplete.vue';

const countries = [
    { name: 'Australia', code: 'AU' },
    { name: 'Austria', code: 'AT' }
];

afterEach(() => {
    document.body.innerHTML = '';
});

describe('AutoComplete', () => {
    it('emits complete with the typed query and lists the suggestions the parent supplies', async () => {
        const wrapper = mount(AutoComplete, { props: { modelValue: [], suggestions: [], optionLabel: 'name', multiple: true, placeholder: 'Search' }, attachTo: document.body });
        await wrapper.get('input').setValue('au');
        expect(wrapper.emitted('complete')!.at(-1)).toEqual([{ query: 'au' }]);
        await wrapper.setProps({ suggestions: countries });
        await nextTick();
        const options = Array.from(document.body.querySelectorAll<HTMLElement>('[role=option]'));
        expect(options.map((o) => o.textContent?.trim())).toEqual(['Australia', 'Austria']);
        options[1]!.click();
        await nextTick();
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([[countries[1]]]);
        wrapper.unmount();
    });

    it('renders chips for a multiple value and removes one from its button', async () => {
        const wrapper = mount(AutoComplete, { props: { modelValue: countries, suggestions: [], optionLabel: 'name', multiple: true, display: 'chip' } });
        expect(wrapper.findAll('[data-slot=auto-complete-chip]').map((c) => c.text())).toEqual(['Australia', 'Austria']);
        await wrapper.findAll('[aria-label="Remove Australia"]')[0]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([[countries[1]]]);
    });

    it('shows the dropdown button only when asked', () => {
        expect(mount(AutoComplete, { props: { modelValue: null, suggestions: [] } }).find('[data-slot=auto-complete-dropdown]').exists()).toBe(false);
        expect(mount(AutoComplete, { props: { modelValue: null, suggestions: [], dropdown: true } }).find('[data-slot=auto-complete-dropdown]').exists()).toBe(true);
    });
});
```

Create `src/components/AutoComplete.vue`:

```vue
<script setup lang="ts">
    import { ref, watch } from 'vue';
    import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxItem, ComboboxList, ComboboxTrigger } from '@/components/ui/combobox';
    import { IconAngleDown, IconTimes } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { optionLabel as labelOf, sameOption } from '@/utils/optionAccess';

    // Suggestions are the parent's: typing emits `complete({ query })` and the parent sets `suggestions`,
    // the same contract as PrimeVue's AutoComplete, so ported pages keep their search functions.
    const props = withDefaults(
        defineProps<{
            suggestions: unknown[];
            optionLabel?: string;
            multiple?: boolean;
            dropdown?: boolean;
            display?: 'comma' | 'chip';
            placeholder?: string;
            disabled?: boolean;
            class?: string;
        }>(),
        { optionLabel: undefined, multiple: false, dropdown: false, display: 'comma', placeholder: '', disabled: false, class: undefined }
    );

    const model = defineModel<unknown>({ default: null });
    const emit = defineEmits<{ complete: [payload: { query: string }] }>();

    const query = ref('');
    const open = ref(false);

    function onInput(event: Event): void {
        query.value = (event.target as HTMLInputElement).value;
        open.value = true;
        emit('complete', { query: query.value });
    }

    // New suggestions open the list; an empty list keeps it open to show the empty state only while typing.
    watch(
        () => props.suggestions,
        (list) => {
            if (list.length > 0) open.value = true;
        }
    );

    function chips(): unknown[] {
        return props.multiple && Array.isArray(model.value) ? model.value : [];
    }

    function remove(item: unknown): void {
        if (!Array.isArray(model.value)) return;
        model.value = model.value.filter((selected) => !sameOption(selected, item, props.optionLabel));
    }

    function onUpdate(value: unknown): void {
        model.value = value;
        query.value = props.multiple ? '' : labelOf(value, props.optionLabel);
        if (!props.multiple) open.value = false;
    }
</script>

<template>
    <Combobox :model-value="model" :multiple="props.multiple" :open="open" :disabled="props.disabled" ignore-filter :by="(a: unknown, b: unknown) => sameOption(a, b, props.optionLabel)" @update:model-value="onUpdate" @update:open="open = $event">
        <ComboboxAnchor :class="cn('flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-sm focus-within:ring-2 focus-within:ring-ring', props.class)" data-slot="auto-complete">
            <span v-for="item in chips()" :key="labelOf(item, props.optionLabel)" class="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground" data-slot="auto-complete-chip">
                {{ labelOf(item, props.optionLabel) }}
                <button type="button" class="rounded-sm hover:bg-secondary-foreground/10" :aria-label="`Remove ${labelOf(item, props.optionLabel)}`" @click.stop="remove(item)"><IconTimes class="size-3" /></button>
            </span>
            <input :value="query" :placeholder="props.placeholder" :disabled="props.disabled" class="min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" data-slot="auto-complete-input" @input="onInput" @focus="open = props.suggestions.length > 0" />
            <ComboboxTrigger v-if="props.dropdown" as-child>
                <button type="button" class="flex size-6 items-center justify-center rounded-sm hover:bg-muted" aria-label="Show suggestions" data-slot="auto-complete-dropdown" @click="emit('complete', { query: '' })"><IconAngleDown class="size-4" /></button>
            </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxList class="w-(--reka-combobox-trigger-width) p-1">
            <ComboboxEmpty>No results found</ComboboxEmpty>
            <ComboboxGroup>
                <ComboboxItem v-for="item in props.suggestions" :key="labelOf(item, props.optionLabel)" :value="item">
                    <slot name="option" :option="item">{{ labelOf(item, props.optionLabel) }}</slot>
                </ComboboxItem>
            </ComboboxGroup>
        </ComboboxList>
    </Combobox>
</template>
```

`ignore-filter` is Reka 2's `ignoreFilter` root prop, verified in `ComboboxRootProps` (the parent already filtered). The plain `<input>` inside `ComboboxAnchor` replaces `ComboboxInput` on purpose: PrimeVue's AutoComplete lets the parent own the query, and Reka's input would fight it for the value. Keyboard navigation of the list uses Reka's anchor-level handlers; if arrow keys do not move the highlight from the plain input, replace it with `ComboboxInput` bound through `:model-value="query" @update:model-value="..."` and keep `onInput` on `@input`; the report says which was needed. Run `bun run test src/components/AutoComplete.test.ts`: PASS, 3 tests.

- [ ] **Step 5: `SelectButton` and `ToggleButton`, test-first**

Create `src/components/SelectButton.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import SelectButton from './SelectButton.vue';

const options = [{ name: 'Option 1' }, { name: 'Option 2' }];

describe('SelectButton', () => {
    it('emits the clicked option and renders the option slot', async () => {
        const wrapper = mount(SelectButton, { props: { modelValue: null, options, optionLabel: 'name' }, slots: { option: `<template #option="{ option }"><i data-testid="opt">{{ option.name }}</i></template>` } });
        expect(wrapper.findAll('[data-testid=opt]')).toHaveLength(2);
        await wrapper.findAll('button')[1]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([options[1]]);
    });

    it('keeps the value when allowEmpty is false and the active option is clicked again', async () => {
        const wrapper = mount(SelectButton, { props: { modelValue: 'list', options: ['list', 'grid'], allowEmpty: false } });
        await wrapper.findAll('button')[0]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
});
```

Create `src/components/SelectButton.vue`:

```vue
<script setup lang="ts">
    import { computed } from 'vue';
    import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
    import { cn } from '@/lib/utils';
    import { optionLabel as labelOf, optionValue as valueOf, sameOption } from '@/utils/optionAccess';

    const props = withDefaults(
        defineProps<{
            options: unknown[];
            optionLabel?: string;
            optionValue?: string;
            multiple?: boolean;
            allowEmpty?: boolean;
            disabled?: boolean;
            class?: string;
        }>(),
        { optionLabel: undefined, optionValue: undefined, multiple: false, allowEmpty: true, disabled: false, class: undefined }
    );

    const model = defineModel<unknown>({ default: null });

    // ToggleGroup speaks strings; option index is the string, so any option shape works.
    const selected = computed<string | string[] | undefined>(() => {
        const index = (value: unknown): string | undefined => {
            const position = props.options.findIndex((option) => sameOption(valueOf(option, props.optionValue), value, props.optionValue ? undefined : props.optionLabel));
            return position >= 0 ? String(position) : undefined;
        };
        if (props.multiple) return (Array.isArray(model.value) ? model.value : []).map(index).filter((i): i is string => i !== undefined);
        return model.value === null || model.value === undefined ? undefined : index(model.value);
    });

    function onUpdate(value: string | string[] | undefined): void {
        if (props.multiple) {
            model.value = (Array.isArray(value) ? value : []).map((i) => valueOf(props.options[Number(i)], props.optionValue));
            return;
        }
        if (value === undefined || value === '') {
            if (props.allowEmpty) model.value = null;
            return;
        }
        model.value = valueOf(props.options[Number(value)], props.optionValue);
    }
</script>

<template>
    <ToggleGroup :type="props.multiple ? 'multiple' : 'single'" variant="outline" :model-value="selected" :disabled="props.disabled" :class="cn(props.class)" data-slot="select-button" @update:model-value="onUpdate">
        <ToggleGroupItem v-for="(option, index) in props.options" :key="index" :value="String(index)" :aria-label="labelOf(option, props.optionLabel)">
            <slot name="option" :option="option" :index="index">{{ labelOf(option, props.optionLabel) }}</slot>
        </ToggleGroupItem>
    </ToggleGroup>
</template>
```

Create `src/components/ToggleButton.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ToggleButton from './ToggleButton.vue';

describe('ToggleButton', () => {
    it('shows the off label, toggles on click and shows the on label', async () => {
        const wrapper = mount(ToggleButton, { props: { modelValue: false, onLabel: 'Yes', offLabel: 'No' } });
        expect(wrapper.text()).toBe('No');
        expect(wrapper.get('button').attributes('aria-pressed')).toBe('false');
        await wrapper.get('button').trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([true]);
        await wrapper.setProps({ modelValue: true });
        expect(wrapper.text()).toBe('Yes');
    });
});
```

Create `src/components/ToggleButton.vue`:

```vue
<script setup lang="ts">
    import type { Component } from 'vue';
    import { Toggle } from '@/components/ui/toggle';
    import { cn } from '@/lib/utils';

    const props = withDefaults(
        defineProps<{
            onLabel?: string;
            offLabel?: string;
            onIcon?: Component;
            offIcon?: Component;
            disabled?: boolean;
            class?: string;
        }>(),
        { onLabel: 'Yes', offLabel: 'No', onIcon: undefined, offIcon: undefined, disabled: false, class: undefined }
    );
    const model = defineModel<boolean>({ default: false });
</script>

<template>
    <Toggle v-model="model" variant="outline" :disabled="props.disabled" :class="cn('gap-2', props.class)" data-slot="toggle-button">
        <component :is="model ? props.onIcon : props.offIcon" v-if="model ? props.onIcon : props.offIcon" class="size-4" />
        {{ model ? props.onLabel : props.offLabel }}
    </Toggle>
</template>
```

Run `bun run test src/components/SelectButton.test.ts src/components/ToggleButton.test.ts`: PASS, 3 tests. If the vendored `Toggle` renders `data-state` but not `aria-pressed` (Reka's `Toggle` sets `aria-pressed`), adjust the assertion to `data-state="off"`.

- [ ] **Step 6: `DatePicker`, test-first**

Create `src/components/DatePicker.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import DatePicker from './DatePicker.vue';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('DatePicker', () => {
    it('shows the placeholder, then the formatted date', async () => {
        const wrapper = mount(DatePicker, { props: { modelValue: null, placeholder: 'mm/dd/yyyy' } });
        expect(wrapper.get('[data-slot=date-picker-trigger]').text()).toBe('mm/dd/yyyy');
        await wrapper.setProps({ modelValue: new Date(2020, 4, 6) });
        expect(wrapper.get('[data-slot=date-picker-trigger]').text()).toBe('05/06/2020');
        await wrapper.setProps({ dateFormat: 'dd M yy' });
        expect(wrapper.get('[data-slot=date-picker-trigger]').text()).toBe('06 May 2020');
    });

    it('emits today from the button bar and null from clear', async () => {
        const wrapper = mount(DatePicker, { props: { modelValue: new Date(2020, 4, 6), showButtonBar: true }, attachTo: document.body });
        await wrapper.get('[data-slot=date-picker-trigger]').trigger('click');
        await nextTick();
        document.body.querySelector<HTMLButtonElement>('[data-slot=date-picker-today]')!.click();
        await nextTick();
        const emitted = wrapper.emitted('update:modelValue')!.at(-1)![0] as Date;
        expect(emitted.toDateString()).toBe(new Date().toDateString());
        await wrapper.get('[data-slot=date-picker-trigger]').trigger('click');
        await nextTick();
        document.body.querySelector<HTMLButtonElement>('[data-slot=date-picker-clear]')!.click();
        await nextTick();
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([null]);
        wrapper.unmount();
    });

    it('renders the calendar inline without a trigger', () => {
        const wrapper = mount(DatePicker, { props: { modelValue: null, inline: true } });
        expect(wrapper.find('[data-slot=date-picker-trigger]').exists()).toBe(false);
        expect(wrapper.find('[data-slot=calendar]').exists()).toBe(true);
    });
});
```

Create `src/components/DatePicker.vue`:

```vue
<script setup lang="ts">
    import { CalendarDate, getLocalTimeZone, today, type DateValue } from '@internationalized/date';
    import { toDate } from 'reka-ui/date';
    import { computed, ref } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Calendar } from '@/components/ui/calendar';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { IconCalendar } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { formatDate } from '@/utils/dateFormat';

    const props = withDefaults(
        defineProps<{
            showIcon?: boolean;
            showButtonBar?: boolean;
            dateFormat?: string;
            placeholder?: string;
            inline?: boolean;
            disabled?: boolean;
            class?: string;
        }>(),
        { showIcon: false, showButtonBar: false, dateFormat: 'mm/dd/yy', placeholder: '', inline: false, disabled: false, class: undefined }
    );

    const model = defineModel<Date | null>({ default: null });
    const open = ref(false);

    // The vendored Calendar speaks @internationalized/date; the page keeps native Dates, as with PrimeVue.
    const calendarValue = computed<DateValue | undefined>(() => (model.value ? new CalendarDate(model.value.getFullYear(), model.value.getMonth() + 1, model.value.getDate()) : undefined));

    function onCalendar(value: DateValue | undefined): void {
        model.value = value ? toDate(value, getLocalTimeZone()) : null;
        if (!props.inline) open.value = false;
    }

    function setToday(): void {
        onCalendar(today(getLocalTimeZone()));
    }

    function clear(): void {
        model.value = null;
        open.value = false;
    }

    const label = computed(() => (model.value ? formatDate(model.value, props.dateFormat) : props.placeholder));
</script>

<template>
    <div v-if="props.inline" :class="cn('inline-flex flex-col gap-2 rounded-lg border border-border bg-card p-2', props.class)" data-slot="date-picker" data-inline="true">
        <Calendar :model-value="calendarValue" @update:model-value="onCalendar" />
        <div v-if="props.showButtonBar" class="flex justify-between">
            <Button variant="ghost" size="sm" data-slot="date-picker-today" @click="setToday">Today</Button>
            <Button variant="ghost" size="sm" data-slot="date-picker-clear" @click="clear">Clear</Button>
        </div>
    </div>
    <Popover v-else v-model:open="open">
        <PopoverTrigger as-child>
            <Button variant="outline" :disabled="props.disabled" :class="cn('w-full justify-between font-normal', !model && 'text-muted-foreground', props.class)" data-slot="date-picker-trigger">
                <span>{{ label }}</span>
                <IconCalendar v-if="props.showIcon" class="size-4 opacity-60" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-auto p-2" data-slot="date-picker-content">
            <Calendar :model-value="calendarValue" @update:model-value="onCalendar" />
            <div v-if="props.showButtonBar" class="mt-2 flex justify-between border-t border-border pt-2">
                <Button variant="ghost" size="sm" data-slot="date-picker-today" @click="setToday">Today</Button>
                <Button variant="ghost" size="sm" data-slot="date-picker-clear" @click="clear">Clear</Button>
            </div>
        </PopoverContent>
    </Popover>
</template>
```

If the vendored `Calendar` root carries no `data-slot="calendar"`, the third test selects `[data-slot=date-picker][data-inline] [role=grid]` instead. Run `bun run test src/components/DatePicker.test.ts`: PASS, 3 tests.

- [ ] **Step 7: Verify and commit**

Run `bunx prettier --check` on the fourteen new files, then `bun run type-check`, `bun run lint`, `bun run test` (170 tests in 40 files), `bun run build`.

```bash
git add src/components/Listbox.vue src/components/Listbox.test.ts src/components/MultiSelect.vue src/components/MultiSelect.test.ts src/components/AutoComplete.vue src/components/AutoComplete.test.ts src/components/SelectButton.vue src/components/SelectButton.test.ts src/components/ToggleButton.vue src/components/ToggleButton.test.ts src/components/DatePicker.vue src/components/DatePicker.test.ts src/utils/dateFormat.ts src/utils/dateFormat.test.ts src/utils/optionAccess.ts
```
```bash
git commit -m "feat: add Listbox, MultiSelect, AutoComplete, SelectButton, ToggleButton and DatePicker"
```

---

### Task 11: `Chip`, `OverlayBadge`, `ScrollTop`, `Message` and the Alert severities

**Files:**
- Create: `src/components/Chip.vue`, `src/components/OverlayBadge.vue`, `src/components/ScrollTop.vue`, `src/components/Message.vue`
- Modify: `src/components/ui/alert/index.ts`
- Test: `src/components/ScrollTop.test.ts`, `src/components/Message.test.ts`, `src/test/variants.test.ts`

**Interfaces:**
- Consumes: `Badge`, `Alert`, `AlertDescription`, `Button`; `useScroll` from `@vueuse/core`; icons `IconTimes`, `IconArrowUp`, `IconCheckCircle`, `IconInfoCircle`, `IconExclamationTriangle`, `IconTimesCircle`.
- Produces: `Chip` (`label?`, `icon?: Component`, `image?`, `removable?`, emits `remove`, default slot); `OverlayBadge` (`value?: string | number`, `severity?`, default slot); `ScrollTop` (`target?: 'window' | 'parent'`, `threshold?` 400, `behavior?` `'smooth'`, `icon?: Component`); `Message` (`severity?`, `closable?`, `icon?: Component`, emits `close`, default slot); `alertVariants` gains `success`, `info`, `warning`, `secondary`, `contrast`.

- [ ] **Step 1: Alert severities, test-first**

Append to `src/test/variants.test.ts`:

```ts
    it('gives every added alert variant a distinct treatment', () => {
        const classes = (['success', 'info', 'warning', 'secondary', 'contrast'] as const).map((variant) => alertVariants({ variant }));
        expect(classes[0]).toContain('text-green-700');
        expect(classes[1]).toContain('text-sky-700');
        expect(classes[2]).toContain('text-amber-700');
        expect(classes[3]).toContain('bg-secondary');
        expect(classes[4]).toContain('bg-foreground');
        expect(new Set(classes).size).toBe(5);
    });
```

with `import { alertVariants } from '@/components/ui/alert';`. Run it, see the type error and failure, then add to the `variant` map in `src/components/ui/alert/index.ts`:

```ts
                success: 'border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400 *:[svg]:text-current',
                info: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 *:[svg]:text-current',
                warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 *:[svg]:text-current',
                secondary: 'bg-secondary text-secondary-foreground',
                contrast: 'border-foreground bg-foreground text-background'
```

- [ ] **Step 2: `Chip` and `OverlayBadge`**

`src/components/Chip.vue`:

```vue
<script setup lang="ts">
    import type { Component } from 'vue';
    import { Button } from '@/components/ui/button';
    import { IconTimes } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(defineProps<{ label?: string; icon?: Component; image?: string; removable?: boolean; class?: string }>(), { label: undefined, icon: undefined, image: undefined, removable: false, class: undefined });
    const emit = defineEmits<{ remove: [] }>();
</script>

<template>
    <span :class="cn('inline-flex items-center gap-2 rounded-full bg-secondary py-1 pr-3 pl-3 text-sm text-secondary-foreground has-[img]:pl-1', props.class)" data-slot="chip">
        <img v-if="props.image" :src="props.image" :alt="props.label ?? ''" class="size-6 rounded-full object-cover" />
        <component :is="props.icon" v-else-if="props.icon" class="size-4" />
        <slot>{{ props.label }}</slot>
        <Button v-if="props.removable" variant="ghost" size="icon-xs" class="-mr-2 size-5 rounded-full" :aria-label="`Remove ${props.label ?? 'chip'}`" data-slot="chip-remove" @click="emit('remove')"><IconTimes class="size-3" /></Button>
    </span>
</template>
```

`src/components/OverlayBadge.vue`:

```vue
<script setup lang="ts">
    import { Badge, type BadgeVariants } from '@/components/ui/badge';
    import { cn } from '@/lib/utils';

    // PrimeVue severities map onto the Badge variants Plan 2 added.
    const variants: Record<string, BadgeVariants['variant']> = { secondary: 'secondary', success: 'success', info: 'info', warn: 'warning', warning: 'warning', danger: 'destructive', contrast: 'contrast' };

    const props = withDefaults(defineProps<{ value?: string | number; severity?: string; class?: string }>(), { value: undefined, severity: undefined, class: undefined });
</script>

<template>
    <span :class="cn('relative inline-flex', props.class)" data-slot="overlay-badge">
        <slot />
        <Badge :variant="props.severity ? variants[props.severity] : 'default'" :class="cn('absolute -top-1 -right-1 min-w-5 justify-center px-1', props.value === undefined && 'size-2.5 min-w-0 p-0')" data-slot="overlay-badge-badge">{{ props.value ?? '' }}</Badge>
    </span>
</template>
```

- [ ] **Step 3: `ScrollTop`, test-first**

Create `src/components/ScrollTop.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import ScrollTop from './ScrollTop.vue';

const Host = defineComponent({
    setup: () => () => h('div', { style: 'height: 200px; overflow: auto', 'data-testid': 'scroller' }, [h('div', { style: 'height: 2000px' }), h(ScrollTop, { target: 'parent', threshold: 100 })])
});

describe('ScrollTop', () => {
    it('appears past the threshold and scrolls its parent to the top', async () => {
        const wrapper = mount(Host, { attachTo: document.body });
        const scroller = wrapper.get('[data-testid=scroller]').element as HTMLElement;
        scroller.scrollTo = vi.fn();
        expect(wrapper.find('[data-slot=scroll-top]').exists()).toBe(false);
        scroller.scrollTop = 500;
        scroller.dispatchEvent(new Event('scroll'));
        await nextTick();
        expect(wrapper.find('[data-slot=scroll-top]').exists()).toBe(true);
        await wrapper.get('[data-slot=scroll-top]').trigger('click');
        expect(scroller.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        wrapper.unmount();
    });
});
```

Create `src/components/ScrollTop.vue`:

```vue
<script setup lang="ts">
    import { useScroll } from '@vueuse/core';
    import { computed, onMounted, ref, type Component } from 'vue';
    import { Button } from '@/components/ui/button';
    import { IconArrowUp } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(defineProps<{ target?: 'window' | 'parent'; threshold?: number; behavior?: ScrollBehavior; icon?: Component; class?: string }>(), { target: 'window', threshold: 400, behavior: 'smooth', icon: undefined, class: undefined });

    // The anchor span is only there to find the parent; the button itself is fixed or absolute and outside flow.
    const anchor = ref<HTMLElement | null>(null);
    const element = ref<HTMLElement | Window | null>(null);
    onMounted(() => {
        element.value = props.target === 'parent' ? (anchor.value?.parentElement ?? null) : window;
    });

    const { y } = useScroll(element);
    const visible = computed(() => y.value > props.threshold);

    function scrollToTop(): void {
        element.value?.scrollTo({ top: 0, behavior: props.behavior });
    }
</script>

<template>
    <span ref="anchor" class="hidden" aria-hidden="true" />
    <Button v-if="visible" size="icon-lg" :class="cn('z-40 rounded-full shadow-md', props.target === 'parent' ? 'absolute right-4 bottom-4' : 'fixed right-8 bottom-8', props.class)" aria-label="Scroll to top" data-slot="scroll-top" @click="scrollToTop">
        <component :is="props.icon ?? IconArrowUp" class="size-5" />
    </Button>
</template>
```

A `parent` target needs `position: relative` on that parent for the absolute button to sit inside it; Plan 4's MiscDoc adds that class to the `ScrollArea` it wraps. Run the test: PASS, 1 test.

- [ ] **Step 4: `Message`, test-first**

Create `src/components/Message.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Message from './Message.vue';

describe('Message', () => {
    it('maps severity to the alert variant and renders the text', () => {
        const wrapper = mount(Message, { props: { severity: 'warn' }, slots: { default: 'Warn Message' } });
        expect(wrapper.get('[data-slot=alert]').attributes('data-variant')).toBe('warning');
        expect(wrapper.text()).toContain('Warn Message');
        expect(mount(Message, { props: { severity: 'error' } }).get('[data-slot=alert]').attributes('data-variant')).toBe('destructive');
    });

    it('closes from its button and emits close', async () => {
        const wrapper = mount(Message, { props: { severity: 'info', closable: true }, slots: { default: 'Info' } });
        await wrapper.get('[aria-label="Close"]').trigger('click');
        expect(wrapper.emitted('close')).toHaveLength(1);
        expect(wrapper.find('[data-slot=alert]').exists()).toBe(false);
    });
});
```

Create `src/components/Message.vue`:

```vue
<script setup lang="ts">
    import { computed, ref, type Component } from 'vue';
    import { Alert, AlertDescription, type AlertVariants } from '@/components/ui/alert';
    import { Button } from '@/components/ui/button';
    import { IconCheckCircle, IconExclamationTriangle, IconInfoCircle, IconTimes, IconTimesCircle } from '@/components/icons';
    import { cn } from '@/lib/utils';

    type Severity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';

    const variants: Record<Severity, NonNullable<AlertVariants['variant']>> = { success: 'success', info: 'info', warn: 'warning', error: 'destructive', secondary: 'secondary', contrast: 'contrast' };
    const icons: Partial<Record<Severity, Component>> = { success: IconCheckCircle, info: IconInfoCircle, warn: IconExclamationTriangle, error: IconTimesCircle };

    const props = withDefaults(defineProps<{ severity?: Severity; closable?: boolean; icon?: Component; class?: string }>(), { severity: 'info', closable: false, icon: undefined, class: undefined });
    const emit = defineEmits<{ close: [] }>();

    const visible = ref(true);
    const variant = computed(() => variants[props.severity]);
    const icon = computed(() => props.icon ?? icons[props.severity]);

    function close(): void {
        visible.value = false;
        emit('close');
    }
</script>

<template>
    <Alert v-if="visible" :variant="variant" :class="cn('items-center', props.class)" :data-variant="variant">
        <component :is="icon" v-if="icon" />
        <AlertDescription class="flex-1"><slot /></AlertDescription>
        <Button v-if="props.closable" variant="ghost" size="icon-xs" class="absolute top-1.5 right-1.5" aria-label="Close" @click="close"><IconTimes class="size-3.5" /></Button>
    </Alert>
</template>
```

If the vendored `Alert` already stamps `data-variant`, the explicit binding is redundant but harmless. Run `bun run test src/components/Message.test.ts`: PASS, 2 tests.

- [ ] **Step 5: Verify and commit**

Run `bunx prettier --check` on the seven touched files, then `bun run type-check`, `bun run lint`, `bun run test` (174 tests in 42 files), `bun run build`.

```bash
git add src/components/Chip.vue src/components/OverlayBadge.vue src/components/ScrollTop.vue src/components/ScrollTop.test.ts src/components/Message.vue src/components/Message.test.ts src/components/ui/alert/index.ts src/test/variants.test.ts
```
```bash
git commit -m "feat: add Chip, OverlayBadge, ScrollTop and Message with Alert severities"
```

---

### Task 12: `Panel`, `Fieldset`, `Divider`, `Timeline`

**Files:**
- Create: `src/components/Panel.vue`, `src/components/Fieldset.vue`, `src/components/Divider.vue`, `src/components/Timeline.vue`
- Test: `src/components/Timeline.test.ts`, `src/components/Panel.test.ts`

**Interfaces:**
- Consumes: `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger`, `Button`; icons `IconMinus`, `IconPlus`.
- Produces: `Panel` (`header?`, `toggleable?`, `v-model:collapsed`, slots `header`, `icons`, default, `footer`); `Fieldset` (`legend?`, `toggleable?`, `v-model:collapsed`, slots `legend`, default); `Divider` (`layout?: 'horizontal' | 'vertical'`, `align?: 'left' | 'center' | 'right' | 'top' | 'bottom'`, `type?: 'solid' | 'dashed' | 'dotted'`, default slot); `Timeline` (`value: T[]`, `align?: 'left' | 'right' | 'alternate' | 'top' | 'bottom'`, `layout?: 'vertical' | 'horizontal'`, slots `opposite`, `marker`, `content`, `connector`, each `{ item, index }`).

- [ ] **Step 1: `Panel`, test-first**

Create `src/components/Panel.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Panel from './Panel.vue';

describe('Panel', () => {
    it('renders the header and content and toggles when toggleable', async () => {
        const wrapper = mount(Panel, { props: { header: 'Header', toggleable: true }, slots: { default: 'Body text' } });
        expect(wrapper.get('[data-slot=panel-header]').text()).toContain('Header');
        expect(wrapper.get('[data-slot=panel-content]').isVisible()).toBe(true);
        await wrapper.get('[aria-label="Collapse Header"]').trigger('click');
        expect(wrapper.emitted('update:collapsed')!.at(-1)).toEqual([true]);
        await wrapper.setProps({ collapsed: true });
        expect(wrapper.find('[data-slot=panel-content]').exists()).toBe(false);
    });

    it('shows no toggle when not toggleable', () => {
        expect(mount(Panel, { props: { header: 'Plain' } }).find('button').exists()).toBe(false);
    });
});
```

Create `src/components/Panel.vue`:

```vue
<script setup lang="ts">
    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
    import { Button } from '@/components/ui/button';
    import { IconMinus, IconPlus } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(defineProps<{ header?: string; toggleable?: boolean; class?: string }>(), { header: undefined, toggleable: false, class: undefined });
    const collapsed = defineModel<boolean>('collapsed', { default: false });
</script>

<template>
    <Collapsible :open="!collapsed" :class="cn('rounded-lg border border-border bg-card', props.class)" data-slot="panel" @update:open="collapsed = !$event">
        <div class="flex items-center justify-between gap-2 px-4 py-3" data-slot="panel-header">
            <span class="font-semibold"><slot name="header">{{ props.header }}</slot></span>
            <div class="flex items-center gap-1">
                <slot name="icons" />
                <CollapsibleTrigger v-if="props.toggleable" as-child>
                    <Button variant="ghost" size="icon-sm" class="rounded-full" :aria-label="`${collapsed ? 'Expand' : 'Collapse'} ${props.header ?? 'panel'}`">
                        <IconPlus v-if="collapsed" class="size-4" />
                        <IconMinus v-else class="size-4" />
                    </Button>
                </CollapsibleTrigger>
            </div>
        </div>
        <CollapsibleContent>
            <div class="border-t border-border px-4 py-3" data-slot="panel-content"><slot /></div>
            <div v-if="$slots.footer" class="border-t border-border px-4 py-3" data-slot="panel-footer"><slot name="footer" /></div>
        </CollapsibleContent>
    </Collapsible>
</template>
```

Reka's `CollapsibleContent` unmounts its children when closed unless `forceMount` is set, which is what the second assertion of the first test relies on. Run `bun run test src/components/Panel.test.ts`: PASS, 2 tests.

- [ ] **Step 2: `Fieldset` and `Divider` (markup only)**

`src/components/Fieldset.vue`:

```vue
<script setup lang="ts">
    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
    import { IconMinus, IconPlus } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(defineProps<{ legend?: string; toggleable?: boolean; class?: string }>(), { legend: undefined, toggleable: false, class: undefined });
    const collapsed = defineModel<boolean>('collapsed', { default: false });
</script>

<template>
    <Collapsible :open="!collapsed" as="fieldset" :class="cn('rounded-lg border border-border bg-card px-4 pb-4', props.class)" data-slot="fieldset" @update:open="collapsed = !$event">
        <legend class="px-2 font-semibold">
            <CollapsibleTrigger v-if="props.toggleable" class="inline-flex items-center gap-2 rounded-md px-1 hover:bg-muted" :aria-label="`${collapsed ? 'Expand' : 'Collapse'} ${props.legend ?? 'fieldset'}`">
                <IconPlus v-if="collapsed" class="size-4" />
                <IconMinus v-else class="size-4" />
                <slot name="legend">{{ props.legend }}</slot>
            </CollapsibleTrigger>
            <slot v-else name="legend">{{ props.legend }}</slot>
        </legend>
        <CollapsibleContent><div class="pt-2" data-slot="fieldset-content"><slot /></div></CollapsibleContent>
    </Collapsible>
</template>
```

If `Collapsible` (Reka `CollapsibleRoot`) does not forward `as="fieldset"`, wrap it: an outer `<fieldset>` containing `<legend>` and the `Collapsible` around the content.

`src/components/Divider.vue`:

```vue
<script setup lang="ts">
    import { computed } from 'vue';
    import { cn } from '@/lib/utils';

    const props = withDefaults(defineProps<{ layout?: 'horizontal' | 'vertical'; align?: 'left' | 'center' | 'right' | 'top' | 'bottom'; type?: 'solid' | 'dashed' | 'dotted'; class?: string }>(), { layout: 'horizontal', align: 'center', type: 'solid', class: undefined });

    const vertical = computed(() => props.layout === 'vertical');
    const lineClass = computed(() => cn('border-border', props.type === 'dashed' && 'border-dashed', props.type === 'dotted' && 'border-dotted', vertical.value ? 'w-px border-l' : 'h-px flex-1 border-t'));
    // The two line segments share the free space unless the content is pushed to one end.
    const before = computed(() => (props.align === 'left' || props.align === 'top' ? 'flex-none basis-4' : 'flex-1'));
    const after = computed(() => (props.align === 'right' || props.align === 'bottom' ? 'flex-none basis-4' : 'flex-1'));
</script>

<template>
    <div role="separator" :aria-orientation="props.layout" :class="cn('flex items-center', vertical ? 'mx-4 h-full min-h-full flex-col self-stretch' : 'my-4 w-full', props.class)" data-slot="divider" :data-layout="props.layout" :data-align="props.align">
        <span :class="cn(lineClass, before)" />
        <span v-if="$slots.default" class="px-2 text-sm text-muted-foreground"><slot /></span>
        <span :class="cn(lineClass, after)" />
    </div>
</template>
```

- [ ] **Step 3: `Timeline`, test-first**

Create `src/components/Timeline.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Timeline from './Timeline.vue';

const events = [
    { status: 'Ordered', date: '15/10/2020 10:30' },
    { status: 'Processing', date: '15/10/2020 14:00' },
    { status: 'Shipped', date: '15/10/2020 16:15' }
];

const slots = {
    content: `<template #content="{ item }"><span data-testid="content">{{ item.status }}</span></template>`,
    opposite: `<template #opposite="{ item }"><small data-testid="opposite">{{ item.date }}</small></template>`
};

describe('Timeline', () => {
    it('renders one event per item with opposite, marker and content, and a connector between events', () => {
        const wrapper = mount(Timeline, { props: { value: events }, slots });
        expect(wrapper.findAll('[data-slot=timeline-event]')).toHaveLength(3);
        expect(wrapper.findAll('[data-testid=content]').map((c) => c.text())).toEqual(['Ordered', 'Processing', 'Shipped']);
        expect(wrapper.findAll('[data-testid=opposite]')).toHaveLength(3);
        expect(wrapper.findAll('[data-slot=timeline-connector]')).toHaveLength(2);
        expect(wrapper.findAll('[data-slot=timeline-marker]')).toHaveLength(3);
    });

    it('records the alignment and layout on the root and alternates event direction', () => {
        const alternate = mount(Timeline, { props: { value: events, align: 'alternate' }, slots });
        expect(alternate.get('[data-slot=timeline]').attributes('data-align')).toBe('alternate');
        expect(alternate.findAll('[data-slot=timeline-event]').map((e) => e.attributes('data-side'))).toEqual(['left', 'right', 'left']);
        const horizontal = mount(Timeline, { props: { value: events, layout: 'horizontal', align: 'bottom' }, slots });
        expect(horizontal.get('[data-slot=timeline]').attributes('data-layout')).toBe('horizontal');
        expect(horizontal.findAll('[data-slot=timeline-event]').map((e) => e.attributes('data-side'))).toEqual(['right', 'right', 'right']);
    });

    it('renders a custom marker slot', () => {
        const wrapper = mount(Timeline, { props: { value: events }, slots: { ...slots, marker: `<template #marker="{ item }"><b data-testid="marker">{{ item.status[0] }}</b></template>` } });
        expect(wrapper.findAll('[data-testid=marker]').map((m) => m.text())).toEqual(['O', 'P', 'S']);
    });
});
```

Create `src/components/Timeline.vue`:

```vue
<script setup lang="ts" generic="T">
    import { computed } from 'vue';
    import { cn } from '@/lib/utils';

    // Each event is a three-part row: opposite, separator (marker plus connector), content.
    // "side" says which side of the separator the content sits on; alternate flips it per event.
    const props = withDefaults(defineProps<{ value: T[]; align?: 'left' | 'right' | 'alternate' | 'top' | 'bottom'; layout?: 'vertical' | 'horizontal'; class?: string }>(), { align: 'left', layout: 'vertical', class: undefined });

    const horizontal = computed(() => props.layout === 'horizontal');

    function side(index: number): 'left' | 'right' {
        if (props.align === 'alternate') return index % 2 === 0 ? 'left' : 'right';
        // right and bottom put content before the separator; left and top put it after.
        return props.align === 'right' || props.align === 'bottom' ? 'right' : 'left';
    }
</script>

<template>
    <div :class="cn('flex', horizontal ? 'flex-row' : 'flex-col', props.class)" data-slot="timeline" :data-align="props.align" :data-layout="props.layout">
        <div v-for="(item, index) in props.value" :key="index" :class="cn('flex min-h-16 flex-1', horizontal ? 'flex-col' : 'flex-row', side(index) === 'right' && (horizontal ? 'flex-col-reverse' : 'flex-row-reverse'))" data-slot="timeline-event" :data-side="side(index)">
            <div :class="cn('flex-1', horizontal ? 'pb-2 text-center' : 'px-4 text-right', side(index) === 'right' && !horizontal && 'text-left')" data-slot="timeline-opposite"><slot name="opposite" :item="item" :index="index" /></div>
            <div :class="cn('flex items-center', horizontal ? 'w-full flex-row' : 'flex-col')" data-slot="timeline-separator">
                <slot name="marker" :item="item" :index="index"><span class="size-4 shrink-0 rounded-full border-2 border-primary bg-card" data-slot="timeline-marker" /></slot>
                <slot v-if="index < props.value.length - 1" name="connector" :item="item" :index="index"><span :class="cn('bg-border', horizontal ? 'h-0.5 w-full' : 'min-h-8 w-0.5 flex-1')" data-slot="timeline-connector" /></slot>
            </div>
            <div :class="cn('flex-1', horizontal ? 'pt-2 text-center' : 'px-4 pb-6', side(index) === 'right' && !horizontal && 'text-right')" data-slot="timeline-content"><slot name="content" :item="item" :index="index" /></div>
        </div>
    </div>
</template>
```

The third test passes a `marker` slot, so the default marker `data-slot="timeline-marker"` is absent there; the first test counts markers without a custom slot. Run `bun run test src/components/Timeline.test.ts`: PASS, 3 tests.

- [ ] **Step 4: Verify and commit**

Run `bunx prettier --check` on the six new files, then `bun run type-check`, `bun run lint`, `bun run test` (179 tests in 44 files), `bun run build`.

```bash
git add src/components/Panel.vue src/components/Panel.test.ts src/components/Fieldset.vue src/components/Divider.vue src/components/Timeline.vue src/components/Timeline.test.ts
```
```bash
git commit -m "feat: add Panel, Fieldset, Divider and Timeline"
```

---

### Task 13: Menu model and wrappers, `SplitButton`

**Files:**
- Create: `src/components/menu/model.ts`, `src/components/menu/MenuItemContent.vue`, `src/components/menu/MenuList.vue`, `src/components/menu/TieredMenu.vue`, `src/components/menu/PanelMenu.vue`, `src/components/menu/AppMenubar.vue`, `src/components/menu/AppBreadcrumb.vue`, `src/components/menu/AppContextMenu.vue`, `src/components/menu/AppMegaMenu.vue`, `src/components/menu/AppSteps.vue`, `src/components/menu/index.ts`, `src/components/SplitButton.vue`
- Test: `src/components/menu/MenuList.test.ts`, `src/components/menu/TieredMenu.test.ts`, `src/components/menu/PanelMenu.test.ts`, `src/components/menu/AppBreadcrumb.test.ts`, `src/components/menu/AppSteps.test.ts`, `src/components/SplitButton.test.ts`

**Interfaces:**
- Consumes: `DropdownMenu*`, `Menubar*`, `ContextMenu*`, `Breadcrumb*`, `NavigationMenu*`, `Stepper*`, `Collapsible*`, `ButtonGroup`, `Button`; `IconAngleDown`, `IconAngleRight`, `IconHome`.
- Produces from `@/components/menu`: `MenuModelItem`, `MegaMenuItem`; `MenuList` (`model`, `popup?`, slot `trigger`), `TieredMenu` (`model`), `PanelMenu` (`model`), `AppMenubar` (`model`, slot `end`), `AppBreadcrumb` (`home?`, `model`), `AppContextMenu` (`model`, default slot is the trigger area), `AppMegaMenu` (`model: MegaMenuItem[]`, `orientation?`), `AppSteps` (`model`, `v-model:activeStep` 0-based, `readonly?` true); `SplitButton` from `@/components/SplitButton.vue` (`label`, `model`, `severity?`, `icon?`, emits `click`).

- [ ] **Step 1: The model and the shared item content**

`src/components/menu/model.ts`:

```ts
import type { Component } from 'vue';

// One item shape for every menu, the same fields PrimeVue's MenuItem carried, with the icon as a component.
export interface MenuModelItem {
    label?: string;
    icon?: Component;
    command?: (event: { originalEvent: Event; item: MenuModelItem }) => void;
    to?: string;
    url?: string;
    target?: string;
    items?: MenuModelItem[];
    separator?: boolean;
    disabled?: boolean;
    visible?: boolean;
    class?: string;
}

// MegaMenu columns: each root item holds columns, each column holds groups, each group holds items.
export interface MegaMenuItem extends Omit<MenuModelItem, 'items'> {
    items?: MenuModelItem[][];
}

export function isVisible(item: MenuModelItem): boolean {
    return item.visible !== false;
}

export function runCommand(item: MenuModelItem, event: Event): void {
    if (item.disabled) return;
    item.command?.({ originalEvent: event, item });
}
```

`src/components/menu/MenuItemContent.vue` (icon, label, link resolution, used by every wrapper):

```vue
<script setup lang="ts">
    import { RouterLink } from 'vue-router';
    import { cn } from '@/lib/utils';
    import { runCommand, type MenuModelItem } from './model';

    const props = defineProps<{ item: MenuModelItem; class?: string }>();
</script>

<template>
    <RouterLink v-if="props.item.to" :to="props.item.to" :class="cn('flex w-full items-center gap-2', props.class)" @click="runCommand(props.item, $event)">
        <component :is="props.item.icon" v-if="props.item.icon" class="size-4 shrink-0" />
        <span>{{ props.item.label }}</span>
    </RouterLink>
    <a v-else-if="props.item.url" :href="props.item.url" :target="props.item.target" :rel="props.item.target === '_blank' ? 'noopener noreferrer' : undefined" :class="cn('flex w-full items-center gap-2', props.class)" @click="runCommand(props.item, $event)">
        <component :is="props.item.icon" v-if="props.item.icon" class="size-4 shrink-0" />
        <span>{{ props.item.label }}</span>
    </a>
    <span v-else :class="cn('flex w-full items-center gap-2', props.class)">
        <component :is="props.item.icon" v-if="props.item.icon" class="size-4 shrink-0" />
        <span>{{ props.item.label }}</span>
    </span>
</template>
```

- [ ] **Step 2: `MenuList`, test-first**

Create `src/components/menu/MenuList.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import MenuList from './MenuList.vue';
import type { MenuModelItem } from './model';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('MenuList', () => {
    it('renders groups, items and separators inline and runs commands', async () => {
        const command = vi.fn();
        const model: MenuModelItem[] = [
            { label: 'Customers', items: [{ label: 'New', command }, { label: 'Edit' }] },
            { separator: true },
            { label: 'Quit' }
        ];
        const wrapper = mount(MenuList, { props: { model } });
        expect(wrapper.findAll('[data-slot=menu-group-label]').map((g) => g.text())).toEqual(['Customers']);
        expect(wrapper.findAll('[role=menuitem]').map((i) => i.text())).toEqual(['New', 'Edit', 'Quit']);
        expect(wrapper.findAll('[role=separator]')).toHaveLength(1);
        await wrapper.findAll('[role=menuitem]')[0]!.trigger('click');
        expect(command).toHaveBeenCalledWith(expect.objectContaining({ item: model[0]!.items![0] }));
    });

    it('in popup mode renders the trigger slot and opens the items in a dropdown', async () => {
        const wrapper = mount(MenuList, { props: { model: [{ label: 'Save' }, { label: 'Update' }], popup: true }, slots: { trigger: '<button data-testid="open">Options</button>' }, attachTo: document.body });
        expect(document.body.querySelector('[role=menuitem]')).toBeNull();
        await wrapper.get('[data-testid=open]').trigger('click');
        await nextTick();
        expect(Array.from(document.body.querySelectorAll('[role=menuitem]')).map((i) => i.textContent?.trim())).toEqual(['Save', 'Update']);
        wrapper.unmount();
    });

    it('skips items with visible false and disables disabled ones', () => {
        const wrapper = mount(MenuList, { props: { model: [{ label: 'Shown' }, { label: 'Hidden', visible: false }, { label: 'Off', disabled: true }] } });
        expect(wrapper.findAll('[role=menuitem]').map((i) => i.text())).toEqual(['Shown', 'Off']);
        expect(wrapper.findAll('[role=menuitem]')[1]!.attributes('aria-disabled')).toBe('true');
    });
});
```

Create `src/components/menu/MenuList.vue`:

```vue
<script setup lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { cn } from '@/lib/utils';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from './model';

    // Inline: a plain list. Popup: a DropdownMenu around the `trigger` slot, which replaces PrimeVue's
    // `menu.toggle(event)` call on a ref; the trigger button moves inside this component's slot.
    const props = withDefaults(defineProps<{ model: MenuModelItem[]; popup?: boolean; class?: string }>(), { popup: false, class: undefined });
</script>

<template>
    <DropdownMenu v-if="props.popup">
        <DropdownMenuTrigger as-child><slot name="trigger" /></DropdownMenuTrigger>
        <DropdownMenuContent align="start" :class="cn('min-w-40', props.class)" data-slot="menu-list-popup">
            <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
                <DropdownMenuSeparator v-if="item.separator" />
                <template v-else-if="item.items">
                    <DropdownMenuLabel data-slot="menu-group-label">{{ item.label }}</DropdownMenuLabel>
                    <DropdownMenuItem v-for="(child, childIndex) in item.items.filter(isVisible)" :key="childIndex" :disabled="child.disabled" @select="runCommand(child, $event)"><MenuItemContent :item="child" /></DropdownMenuItem>
                </template>
                <DropdownMenuItem v-else :disabled="item.disabled" @select="runCommand(item, $event)"><MenuItemContent :item="item" /></DropdownMenuItem>
            </template>
        </DropdownMenuContent>
    </DropdownMenu>
    <ul v-else role="menu" :class="cn('flex min-w-40 flex-col gap-0.5 rounded-lg border border-border bg-card p-1', props.class)" data-slot="menu-list">
        <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
            <li v-if="item.separator" role="separator" class="my-1 border-t border-border" />
            <template v-else-if="item.items">
                <li class="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase" data-slot="menu-group-label">{{ item.label }}</li>
                <li v-for="(child, childIndex) in item.items.filter(isVisible)" :key="childIndex" role="menuitem" :aria-disabled="child.disabled || undefined" :tabindex="child.disabled ? -1 : 0" :class="cn('cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none', child.disabled && 'pointer-events-none opacity-50')" @click="runCommand(child, $event)" @keydown.enter="runCommand(child, $event)"><MenuItemContent :item="child" /></li>
            </template>
            <li v-else role="menuitem" :aria-disabled="item.disabled || undefined" :tabindex="item.disabled ? -1 : 0" :class="cn('cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none', item.disabled && 'pointer-events-none opacity-50')" @click="runCommand(item, $event)" @keydown.enter="runCommand(item, $event)"><MenuItemContent :item="item" /></li>
        </template>
    </ul>
</template>
```

Run `bun run test src/components/menu/MenuList.test.ts`: PASS, 3 tests.

- [ ] **Step 3: `TieredMenu` and `PanelMenu`, test-first**

Create `src/components/menu/TieredMenu.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TieredMenu from './TieredMenu.vue';

describe('TieredMenu', () => {
    it('renders every level with submenu markers and separators', () => {
        const wrapper = mount(TieredMenu, {
            props: { model: [{ label: 'Customers', items: [{ label: 'New', items: [{ label: 'Customer' }] }, { label: 'Edit' }] }, { separator: true }, { label: 'Quit' }] }
        });
        expect(wrapper.findAll('[role=menuitem]').map((i) => i.text())).toEqual(['Customers', 'New', 'Customer', 'Edit', 'Quit']);
        expect(wrapper.findAll('[data-slot=tiered-menu-submenu]')).toHaveLength(2);
        expect(wrapper.findAll('[aria-haspopup=menu]')).toHaveLength(2);
        expect(wrapper.findAll('[role=separator]')).toHaveLength(1);
    });
});
```

Create `src/components/menu/TieredMenu.vue` (recursive; submenus open on hover and focus through CSS, and on click for touch):

```vue
<script setup lang="ts">
    import { ref } from 'vue';
    import { IconAngleRight } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from './model';

    defineOptions({ name: 'TieredMenu' });
    const props = withDefaults(defineProps<{ model: MenuModelItem[]; nested?: boolean; class?: string }>(), { nested: false, class: undefined });

    // Click toggles a submenu for touch; hover and focus-within open it through the group classes.
    const openIndex = ref<number | null>(null);
    function toggle(index: number): void {
        openIndex.value = openIndex.value === index ? null : index;
    }
</script>

<template>
    <ul role="menu" :class="cn('flex min-w-44 flex-col gap-0.5 rounded-lg border border-border bg-card p-1', props.nested ? 'absolute top-0 left-full z-20 ml-1 hidden shadow-md group-hover/tiered:flex group-focus-within/tiered:flex data-[open=true]:flex' : 'relative', props.class)" data-slot="tiered-menu">
        <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
            <li v-if="item.separator" role="separator" class="my-1 border-t border-border" />
            <li v-else class="group/tiered relative" :data-open="openIndex === index || undefined">
                <button
                    type="button"
                    role="menuitem"
                    :aria-haspopup="item.items ? 'menu' : undefined"
                    :aria-expanded="item.items ? openIndex === index : undefined"
                    :aria-disabled="item.disabled || undefined"
                    :disabled="item.disabled"
                    :class="cn('flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none disabled:opacity-50')"
                    @click="item.items ? toggle(index) : runCommand(item, $event)"
                >
                    <MenuItemContent :item="item" />
                    <IconAngleRight v-if="item.items" class="size-4 shrink-0" />
                </button>
                <TieredMenu v-if="item.items" :model="item.items" nested data-slot="tiered-menu-submenu" :data-open="openIndex === index || undefined" />
            </li>
        </template>
    </ul>
</template>
```

The nested list receives `data-slot="tiered-menu-submenu"` and `data-open` through attribute fall-through from the recursive call, which is why the root `ul` does not bind `data-open` itself. Run the TieredMenu test: PASS, 1 test.

Create `src/components/menu/PanelMenu.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PanelMenu from './PanelMenu.vue';

const model = [{ label: 'Customers', items: [{ label: 'New', items: [{ label: 'Customer' }] }, { label: 'Edit' }] }, { label: 'Orders', items: [{ label: 'View' }] }];

describe('PanelMenu', () => {
    it('renders root headers collapsed and expands on click, nested levels included', async () => {
        const wrapper = mount(PanelMenu, { props: { model } });
        expect(wrapper.findAll('[data-slot=panel-menu-header]').map((h) => h.text())).toEqual(['Customers', 'Orders']);
        expect(wrapper.find('[data-slot=panel-menu-item]').exists()).toBe(false);
        await wrapper.findAll('[data-slot=panel-menu-header]')[0]!.trigger('click');
        expect(wrapper.findAll('[data-slot=panel-menu-item]').map((i) => i.text())).toEqual(['New', 'Edit']);
        await wrapper.findAll('[data-slot=panel-menu-item]')[0]!.trigger('click');
        expect(wrapper.findAll('[data-slot=panel-menu-item]').map((i) => i.text())).toEqual(['New', 'Customer', 'Edit']);
    });

    it('collapses again on a second click', async () => {
        const wrapper = mount(PanelMenu, { props: { model } });
        const header = wrapper.findAll('[data-slot=panel-menu-header]')[1]!;
        await header.trigger('click');
        expect(wrapper.findAll('[data-slot=panel-menu-item]')).toHaveLength(1);
        await header.trigger('click');
        expect(wrapper.findAll('[data-slot=panel-menu-item]')).toHaveLength(0);
    });
});
```

Create `src/components/menu/PanelMenu.vue`:

```vue
<script setup lang="ts">
    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
    import { IconAngleDown, IconAngleRight } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from './model';

    defineOptions({ name: 'PanelMenu' });
    const props = withDefaults(defineProps<{ model: MenuModelItem[]; nested?: boolean; class?: string }>(), { nested: false, class: undefined });
</script>

<template>
    <div :class="cn('flex flex-col', props.nested ? 'gap-0.5 pl-4' : 'gap-2', props.class)" data-slot="panel-menu">
        <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
            <Collapsible v-if="item.items" v-slot="{ open }" :class="cn(!props.nested && 'rounded-lg border border-border bg-card')">
                <CollapsibleTrigger :class="cn('flex w-full items-center justify-between gap-2 text-left text-sm hover:bg-muted focus-visible:outline-none', props.nested ? 'rounded-md px-3 py-2' : 'rounded-lg px-4 py-3 font-semibold')" :data-slot="props.nested ? 'panel-menu-item' : 'panel-menu-header'">
                    <MenuItemContent :item="item" />
                    <IconAngleDown v-if="open" class="size-4 shrink-0" />
                    <IconAngleRight v-else class="size-4 shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent :class="cn(!props.nested && 'border-t border-border p-1')">
                    <PanelMenu :model="item.items" nested />
                </CollapsibleContent>
            </Collapsible>
            <button v-else type="button" :disabled="item.disabled" :class="cn('flex w-full items-center rounded-md px-3 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none disabled:opacity-50', !props.nested && 'rounded-lg border border-border bg-card px-4 py-3 font-semibold')" :data-slot="props.nested ? 'panel-menu-item' : 'panel-menu-header'" @click="runCommand(item, $event)">
                <MenuItemContent :item="item" />
            </button>
        </template>
    </div>
</template>
```

Run `bun run test src/components/menu/PanelMenu.test.ts`: PASS, 2 tests.

- [ ] **Step 4: `AppMenubar`, `AppContextMenu`, `AppMegaMenu`**

`src/components/menu/AppMenubar.vue`:

```vue
<script setup lang="ts">
    import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '@/components/ui/menubar';
    import { IconAngleDown } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from './model';

    const props = defineProps<{ model: MenuModelItem[]; class?: string }>();
</script>

<template>
    <Menubar :class="cn('h-auto flex-wrap justify-between gap-1 p-1', props.class)" data-slot="app-menubar">
        <div class="flex flex-wrap items-center gap-1">
            <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
                <MenubarMenu v-if="item.items">
                    <MenubarTrigger class="gap-2"><MenuItemContent :item="item" /><IconAngleDown class="size-3.5 opacity-60" /></MenubarTrigger>
                    <MenubarContent>
                        <template v-for="(child, childIndex) in item.items.filter(isVisible)" :key="childIndex">
                            <MenubarSeparator v-if="child.separator" />
                            <MenubarSub v-else-if="child.items">
                                <MenubarSubTrigger><MenuItemContent :item="child" /></MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem v-for="(leaf, leafIndex) in child.items.filter(isVisible)" :key="leafIndex" :disabled="leaf.disabled" @select="runCommand(leaf, $event)"><MenuItemContent :item="leaf" /></MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarItem v-else :disabled="child.disabled" @select="runCommand(child, $event)"><MenuItemContent :item="child" /></MenubarItem>
                        </template>
                    </MenubarContent>
                </MenubarMenu>
                <button v-else type="button" class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-muted focus-visible:outline-none" :disabled="item.disabled" @click="runCommand(item, $event)"><MenuItemContent :item="item" /></button>
            </template>
        </div>
        <div v-if="$slots.end" class="ml-auto"><slot name="end" /></div>
    </Menubar>
</template>
```

Three menu levels cover every model in the template (MenuDoc's nested items go two deep under a root); a deeper model would need a recursive sub component, which is not written until a page needs it.

`src/components/menu/AppContextMenu.vue`:

```vue
<script setup lang="ts">
    import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from './model';

    // The default slot is the right-click area, which replaces PrimeVue's `contextMenu.show(event)` call.
    const props = defineProps<{ model: MenuModelItem[] }>();
</script>

<template>
    <ContextMenu>
        <ContextMenuTrigger as-child><slot /></ContextMenuTrigger>
        <ContextMenuContent class="min-w-40" data-slot="app-context-menu">
            <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
                <ContextMenuSeparator v-if="item.separator" />
                <ContextMenuSub v-else-if="item.items">
                    <ContextMenuSubTrigger><MenuItemContent :item="item" /></ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <ContextMenuItem v-for="(child, childIndex) in item.items.filter(isVisible)" :key="childIndex" :disabled="child.disabled" @select="runCommand(child, $event)"><MenuItemContent :item="child" /></ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuItem v-else :disabled="item.disabled" @select="runCommand(item, $event)"><MenuItemContent :item="item" /></ContextMenuItem>
            </template>
        </ContextMenuContent>
    </ContextMenu>
</template>
```

`src/components/menu/AppMegaMenu.vue`:

```vue
<script setup lang="ts">
    import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
    import { cn } from '@/lib/utils';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MegaMenuItem } from './model';

    const props = withDefaults(defineProps<{ model: MegaMenuItem[]; orientation?: 'horizontal' | 'vertical'; class?: string }>(), { orientation: 'horizontal', class: undefined });
</script>

<template>
    <NavigationMenu :orientation="props.orientation" :viewport="props.orientation === 'horizontal'" :class="cn('max-w-full justify-start rounded-lg border border-border bg-card p-1', props.orientation === 'vertical' && 'w-56 items-stretch', props.class)" data-slot="app-mega-menu" :data-orientation="props.orientation">
        <NavigationMenuList :class="cn('gap-1', props.orientation === 'vertical' && 'flex-col items-stretch')">
            <NavigationMenuItem v-for="(root, rootIndex) in props.model" :key="rootIndex" class="relative">
                <NavigationMenuTrigger :class="cn('gap-2', props.orientation === 'vertical' && 'w-full justify-between')"><MenuItemContent :item="{ label: root.label, icon: root.icon }" /></NavigationMenuTrigger>
                <NavigationMenuContent :class="cn('p-4', props.orientation === 'vertical' && 'absolute top-0 left-full ml-1 w-max rounded-lg border border-border bg-popover shadow-md')">
                    <div class="grid gap-6" :style="{ gridTemplateColumns: `repeat(${root.items?.length ?? 1}, minmax(10rem, 1fr))` }">
                        <div v-for="(column, columnIndex) in root.items" :key="columnIndex" class="flex flex-col gap-4">
                            <div v-for="(group, groupIndex) in column.filter(isVisible)" :key="groupIndex" class="flex flex-col gap-1">
                                <div class="px-2 text-xs font-semibold text-muted-foreground uppercase" data-slot="app-mega-menu-group">{{ group.label }}</div>
                                <NavigationMenuLink v-for="(leaf, leafIndex) in (group.items ?? []).filter(isVisible)" :key="leafIndex" as="button" class="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted" @click="runCommand(leaf, $event)"><MenuItemContent :item="leaf" /></NavigationMenuLink>
                            </div>
                        </div>
                    </div>
                </NavigationMenuContent>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
</template>
```

- [ ] **Step 5: `AppBreadcrumb` and `AppSteps`, test-first**

Create `src/components/menu/AppBreadcrumb.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { IconHome } from '@/components/icons';
import AppBreadcrumb from './AppBreadcrumb.vue';

const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }] });

describe('AppBreadcrumb', () => {
    it('renders the home link, intermediate items and the current page last', () => {
        const wrapper = mount(AppBreadcrumb, { props: { home: { icon: IconHome, to: '/' }, model: [{ label: 'Computer' }, { label: 'Notebook' }, { label: 'Item' }] }, global: { plugins: [router] } });
        expect(wrapper.get('[data-slot=breadcrumb-home] a').attributes('href')).toBe('/');
        expect(wrapper.findAll('[data-slot=breadcrumb-item]').map((i) => i.text())).toEqual(['', 'Computer', 'Notebook', 'Item']);
        expect(wrapper.get('[aria-current=page]').text()).toBe('Item');
        expect(wrapper.findAll('[data-slot=breadcrumb-separator]')).toHaveLength(3);
    });
});
```

Create `src/components/menu/AppBreadcrumb.vue`:

```vue
<script setup lang="ts">
    import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, type MenuModelItem } from './model';

    const props = withDefaults(defineProps<{ home?: MenuModelItem; model: MenuModelItem[]; class?: string }>(), { home: undefined, class: undefined });
</script>

<template>
    <Breadcrumb :class="props.class" data-slot="app-breadcrumb">
        <BreadcrumbList>
            <template v-if="props.home">
                <BreadcrumbItem data-slot="breadcrumb-home">
                    <BreadcrumbLink as-child><MenuItemContent :item="props.home" /></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
            </template>
            <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
                <BreadcrumbItem>
                    <BreadcrumbPage v-if="index === props.model.length - 1">{{ item.label }}</BreadcrumbPage>
                    <BreadcrumbLink v-else as-child><MenuItemContent :item="item" /></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator v-if="index < props.model.length - 1" />
            </template>
        </BreadcrumbList>
    </Breadcrumb>
</template>
```

The vendored `BreadcrumbItem` and `BreadcrumbSeparator` already stamp `data-slot="breadcrumb-item"` and `data-slot="breadcrumb-separator"` (the nova style does); if they do not, add the attributes in this template. The home item's text is empty because it carries only an icon, which the first `''` in the test expects.

Create `src/components/menu/AppSteps.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppSteps from './AppSteps.vue';

const model = [{ label: 'Header I' }, { label: 'Header II' }, { label: 'Header III' }];

describe('AppSteps', () => {
    it('renders each step with its number, marks the active one and moves on click when not readonly', async () => {
        const wrapper = mount(AppSteps, { props: { model, activeStep: 0, readonly: false } });
        expect(wrapper.findAll('[data-slot=stepper-title]').map((t) => t.text())).toEqual(['Header I', 'Header II', 'Header III']);
        expect(wrapper.findAll('[data-slot=stepper-item]')[0]!.attributes('data-state')).toBe('active');
        await wrapper.findAll('[data-slot=stepper-trigger]')[1]!.trigger('click');
        expect(wrapper.emitted('update:activeStep')!.at(-1)).toEqual([1]);
    });

    it('ignores clicks when readonly', async () => {
        const wrapper = mount(AppSteps, { props: { model, activeStep: 0 } });
        await wrapper.findAll('[data-slot=stepper-trigger]')[2]!.trigger('click');
        expect(wrapper.emitted('update:activeStep')).toBeUndefined();
    });
});
```

Create `src/components/menu/AppSteps.vue`:

```vue
<script setup lang="ts">
    import { Stepper, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper';
    import { cn } from '@/lib/utils';
    import type { MenuModelItem } from './model';

    // PrimeVue Steps are read-only unless told otherwise; the Stepper's 1-based step maps onto a 0-based activeStep.
    const props = withDefaults(defineProps<{ model: MenuModelItem[]; readonly?: boolean; class?: string }>(), { readonly: true, class: undefined });
    const activeStep = defineModel<number>('activeStep', { default: 0 });

    function onStep(step: number | undefined): void {
        if (props.readonly || step === undefined) return;
        activeStep.value = step - 1;
    }
</script>

<template>
    <Stepper :model-value="activeStep + 1" :linear="false" :class="cn('flex w-full items-start gap-2', props.class)" data-slot="app-steps" @update:model-value="onStep">
        <StepperItem v-for="(item, index) in props.model" :key="index" :step="index + 1" class="relative flex w-full flex-col items-center justify-center">
            <StepperSeparator v-if="index < props.model.length - 1" class="absolute top-4 right-[calc(-50%+1rem)] left-[calc(50%+1.5rem)] block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary" />
            <StepperTrigger as-child>
                <button type="button" :class="cn('flex flex-col items-center gap-2', props.readonly && 'cursor-default')" :aria-disabled="props.readonly || undefined">
                    <StepperIndicator class="size-8 rounded-full border border-border bg-card text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{{ index + 1 }}</StepperIndicator>
                    <StepperTitle class="text-sm font-medium">{{ item.label }}</StepperTitle>
                </button>
            </StepperTrigger>
        </StepperItem>
    </Stepper>
</template>
```

The vendored `StepperItem`, `StepperTrigger` and `StepperTitle` carry `data-slot` attributes and Reka stamps `data-state` (`active`, `completed`, `inactive`) on the item; if the vendored files lack `data-slot`, add them there (the only edit to a vendored file this plan makes besides the alert variants). Run both tests: PASS, 3 tests.

- [ ] **Step 6: `SplitButton`, test-first**

Create `src/components/SplitButton.test.ts`:

```ts
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import SplitButton from './SplitButton.vue';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('SplitButton', () => {
    it('emits click from the main button and runs a model command from the dropdown', async () => {
        const command = vi.fn();
        const wrapper = mount(SplitButton, { props: { label: 'Save', model: [{ label: 'Update', command }, { separator: true }, { label: 'Home' }] }, attachTo: document.body });
        await wrapper.get('[data-slot=split-button-main]').trigger('click');
        expect(wrapper.emitted('click')).toHaveLength(1);
        await wrapper.get('[aria-label="More options"]').trigger('click');
        await nextTick();
        const items = Array.from(document.body.querySelectorAll<HTMLElement>('[role=menuitem]'));
        expect(items.map((i) => i.textContent?.trim())).toEqual(['Update', 'Home']);
        items[0]!.click();
        await nextTick();
        expect(command).toHaveBeenCalledTimes(1);
        wrapper.unmount();
    });

    it('maps severity to the button variant', () => {
        const wrapper = mount(SplitButton, { props: { label: 'Save', model: [], severity: 'danger' } });
        expect(wrapper.get('[data-slot=split-button]').attributes('data-variant')).toBe('destructive');
    });
});
```

Create `src/components/SplitButton.vue`:

```vue
<script setup lang="ts">
    import { computed, type Component } from 'vue';
    import { Button, type ButtonVariants } from '@/components/ui/button';
    import { ButtonGroup } from '@/components/ui/button-group';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { IconAngleDown } from '@/components/icons';
    import MenuItemContent from '@/components/menu/MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from '@/components/menu/model';
    import { cn } from '@/lib/utils';

    const severities: Record<string, NonNullable<ButtonVariants['variant']>> = { secondary: 'secondary', success: 'success', info: 'info', warn: 'warning', help: 'help', danger: 'destructive', contrast: 'contrast' };

    const props = withDefaults(defineProps<{ label: string; model: MenuModelItem[]; severity?: string; icon?: Component; size?: ButtonVariants['size']; disabled?: boolean; class?: string }>(), { severity: undefined, icon: undefined, size: 'default', disabled: false, class: undefined });
    const emit = defineEmits<{ click: [event: MouseEvent] }>();

    const variant = computed<NonNullable<ButtonVariants['variant']>>(() => (props.severity ? (severities[props.severity] ?? 'default') : 'default'));
</script>

<template>
    <ButtonGroup :class="cn(props.class)" data-slot="split-button" :data-variant="variant">
        <Button :variant="variant" :size="props.size" :disabled="props.disabled" data-slot="split-button-main" @click="emit('click', $event)">
            <component :is="props.icon" v-if="props.icon" class="size-4" />
            {{ props.label }}
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <Button :variant="variant" :size="props.size === 'default' ? 'icon' : props.size" :disabled="props.disabled" aria-label="More options"><IconAngleDown class="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="min-w-40">
                <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
                    <DropdownMenuSeparator v-if="item.separator" />
                    <DropdownMenuItem v-else :disabled="item.disabled" @select="runCommand(item, $event)"><MenuItemContent :item="item" /></DropdownMenuItem>
                </template>
            </DropdownMenuContent>
        </DropdownMenu>
    </ButtonGroup>
</template>
```

Create `src/components/menu/index.ts`:

```ts
export { default as AppBreadcrumb } from './AppBreadcrumb.vue';
export { default as AppContextMenu } from './AppContextMenu.vue';
export { default as AppMegaMenu } from './AppMegaMenu.vue';
export { default as AppMenubar } from './AppMenubar.vue';
export { default as AppSteps } from './AppSteps.vue';
export { default as MenuList } from './MenuList.vue';
export { default as PanelMenu } from './PanelMenu.vue';
export { default as TieredMenu } from './TieredMenu.vue';
export type { MegaMenuItem, MenuModelItem } from './model';
```

Run `bun run test src/components/SplitButton.test.ts src/components/menu`: PASS, 11 tests.

- [ ] **Step 7: Verify and commit**

Run `bunx prettier --check src/components/menu src/components/SplitButton.vue src/components/SplitButton.test.ts`, then `bun run type-check`, `bun run lint`, `bun run test` (190 tests in 50 files), `bun run build`.

```bash
git add src/components/menu src/components/SplitButton.vue src/components/SplitButton.test.ts
```
```bash
git commit -m "feat: add the model-driven menu wrappers and SplitButton"
```

---

### Task 14: `ConfirmPopover` through `useConfirm()`

**Files:**
- Create: `src/components/ConfirmPopover.vue`
- Modify: `src/components/ConfirmDialogHost.vue`, `src/composables/useConfirm.ts`
- Test: `src/components/ConfirmDialogHost.test.ts`

**Interfaces:**
- Consumes: `Popover`, `PopoverAnchor`, `PopoverContent` (add `PopoverAnchor` to the vendored `popover/index.ts` export if absent: it re-exports Reka's `PopoverAnchor` in the nova registry), `confirmState`, `acceptConfirm`, `rejectConfirm`.
- Produces: `ConfirmOptions` gains `rejectVariant?: 'outline' | 'ghost' | 'secondary'`; a `require({ target, ... })` call renders the popover anchored to `target`; without `target` the alert dialog renders as before.

- [ ] **Step 1: Write the failing test**

Append to `src/components/ConfirmDialogHost.test.ts`:

```ts
    it('anchors a popover to the target element instead of opening the dialog', async () => {
        const anchor = document.createElement('button');
        anchor.textContent = 'Confirm';
        document.body.appendChild(anchor);
        const accept = vi.fn();
        const wrapper = mount(ConfirmDialogHost, { attachTo: document.body });
        requireConfirm({ target: anchor, message: 'Are you sure you want to proceed?', acceptLabel: 'Save', rejectLabel: 'Cancel', rejectVariant: 'ghost', accept });
        await settle();
        expect(document.body.querySelector('[role=alertdialog]')).toBeNull();
        const popover = document.body.querySelector<HTMLElement>('[data-slot=confirm-popover]')!;
        expect(popover.textContent).toContain('Are you sure you want to proceed?');
        expect(document.body.querySelector('[data-testid=confirm-reject]')?.textContent).toContain('Cancel');
        document.body.querySelector<HTMLButtonElement>('[data-testid=confirm-accept]')!.click();
        await settle();
        expect(accept).toHaveBeenCalledTimes(1);
        expect(confirmState.visible).toBe(false);
        wrapper.unmount();
    });
```

- [ ] **Step 2: Run to verify it fails, then implement**

In `src/composables/useConfirm.ts` add `rejectVariant?: 'outline' | 'ghost' | 'secondary';` to `ConfirmOptions` and update the `target` doc comment to "Element to anchor a popover to; without it the alert dialog is used."

Create `src/components/ConfirmPopover.vue`:

```vue
<script setup lang="ts">
    import { PopoverAnchor } from 'reka-ui';
    import { Button } from '@/components/ui/button';
    import { Popover, PopoverContent } from '@/components/ui/popover';
    import { acceptConfirm, confirmState, rejectConfirm } from '@/composables/useConfirm';

    // Outside clicks and Escape reject, matching PrimeVue's ConfirmPopup; the buttons settle the state themselves.
    function onOpenChange(open: boolean): void {
        if (!open && confirmState.visible) rejectConfirm();
    }
</script>

<template>
    <Popover :open="confirmState.visible" @update:open="onOpenChange">
        <PopoverAnchor :reference="confirmState.options?.target" />
        <PopoverContent align="center" side="bottom" class="flex w-72 flex-col gap-4" data-slot="confirm-popover">
            <div class="flex items-center gap-3">
                <component :is="confirmState.options.icon" v-if="confirmState.options?.icon" class="size-6 shrink-0" />
                <span>{{ confirmState.options?.message }}</span>
            </div>
            <div class="flex justify-end gap-2">
                <Button :variant="confirmState.options?.rejectVariant ?? 'outline'" size="sm" data-testid="confirm-reject" @click="rejectConfirm">{{ confirmState.options?.rejectLabel ?? 'No' }}</Button>
                <Button :variant="confirmState.options?.acceptVariant ?? 'default'" size="sm" data-testid="confirm-accept" @click="acceptConfirm">{{ confirmState.options?.acceptLabel ?? 'Yes' }}</Button>
            </div>
        </PopoverContent>
    </Popover>
</template>
```

`PopoverAnchor` is imported from `reka-ui` directly because the vendored popover folder does not re-export it; its `reference` prop (`PopperAnchorProps.reference?: ReferenceElement`, verified in the installed typings) takes the element to position against.

In `ConfirmDialogHost.vue`, render the popover for targeted requests and the dialog otherwise: wrap the existing `AlertDialog` in `<template v-if="!confirmState.options?.target">` and add `<ConfirmPopover v-else />` (import it). Both share the same `confirmState`, so the rest of the host is unchanged; the `rejectVariant` also applies to the dialog's reject button (`:variant="confirmState.options?.rejectVariant ?? 'outline'"`).

- [ ] **Step 3: Run the confirm suites, verify and commit**

Run `bun run test src/components/ConfirmDialogHost.test.ts src/composables/useConfirm.test.ts` (PASS, all existing plus 1). Then `bunx prettier --check src/components/ConfirmPopover.vue src/components/ConfirmDialogHost.vue src/components/ConfirmDialogHost.test.ts src/composables/useConfirm.ts`, `bun run type-check`, `bun run lint`, `bun run test` (191 tests in 50 files), `bun run build`.

```bash
git add src/components/ConfirmPopover.vue src/components/ConfirmDialogHost.vue src/components/ConfirmDialogHost.test.ts src/composables/useConfirm.ts
```
```bash
git commit -m "feat: route targeted confirmations through a ConfirmPopover"
```

---

### Task 15: Phase gate for Plan 3

**Files:**
- None modified.

- [ ] **Step 1: Every component is reachable and self-consistent**

Run:

```bash
grep -rln "@lucide/vue" src --include=*.vue --include=*.ts | grep -v 'src/components/ui/' | grep -v 'src/components/icons.ts'
```

Expected: no output (every local component takes icons from the map; `DataTable.vue` switched to it in Task 3).

```bash
grep -rn "primevue\|--p-\|surface-[0-9]" src/components --include=*.vue --include=*.ts | grep -v 'src/components/ui/' | grep -v 'BlockViewer.vue' | grep -v 'primefaces.org/cdn'
```

Expected: no output except the two `// Same call shape as primevue/...` comments in the composables (those are documentation, not references; `BlockViewer.vue` is Plan 4's). Anything else is a leaked token.

```bash
grep -rn $'\xe2\x80\x94' src docs/superpowers/plans/2026-09-14-shadcn-migration-plan-3-gap-components.md
```

Expected: no output (the byte escape is the em dash, spelled so this file does not contain one).

- [ ] **Step 2: Full verification**

`bun run type-check` exit 0; `bun run lint` 0 errors (5 warnings); `bun run test` reports 50 test files and 191 tests (the counts are the sum of the per-task expectations; a different total means a task's count was off, so report the real number and which task moved it); `bun run build` succeeds.

- [ ] **Step 3: Unused-file inventory**

Run `bunx knip 2>&1 | grep -c 'src/components/'` and list the new component files knip reports as unused. Every component this plan adds is expected there until Plan 4's pages import it; the report names them so Plan 4's gate can check the list empties.

- [ ] **Step 4: Browser pass**

If a browser is available: `bun run dev`, then on any route confirm the dev console shows no Reka or Vue warnings on load (the components are not on a page yet, so this is the only check possible). If no browser is available, say so.

- [ ] **Step 5: Report**

No commit. Reply with the grep results, the verification output, the knip inventory and the browser observation. Plan 4 is written from this state.

---

## Self-review against the spec

- Spec 5.7 rows landed here: Tree and TreeSelect (Task 4), OrderList and PickList (Task 5), DataView (Task 6), FileUpload (Task 7), Galleria and ImagePreview (Task 8), Knob, ColorPicker, FloatLabel (Task 9), Listbox, MultiSelect, plus AutoComplete, SelectButton, ToggleButton and DatePicker which section 5.11 names for InputDoc (Task 10), Chip, OverlayBadge, ScrollTop, Message (Task 11), Panel, Fieldset, Divider, Timeline (Task 12), MenuList with popup mode, TieredMenu, PanelMenu and the thin wrappers for Menubar, ContextMenu, Breadcrumb, MegaMenu, Steps, plus SplitButton (Task 13), ConfirmPopover (Task 14). Rows already landed in Plans 1 and 2: DataTable, AppChart, QuillEditor, StarRating, PasswordInput, Toolbar, useConfirm, useToast, Drawer via Sheet, Splitter via Resizable, Tag and InlineMessage via Badge and Alert. Row deliberately not landed: InputMask and `mask.ts`, with the reason in the Verified facts. AvatarGroup comes vendored.
- Spec 5.7 DataTable behaviours: sorting, global filter, selection, pagination, sub-row expansion and CSV were Plan 1; per-column filters (Task 2), frozen first column via sticky pinning (Task 3), row expansion with arbitrary content and grouping (Task 3) are new. Frozen columns use TanStack pinning rather than a hand-written sticky class so the offsets are computed.
- Spec 8 tests named for this scope: Tree (expand, select modes, checkbox partial state, filter), OrderList and PickList (every move, selection), DataTable (filter, expansion, grouping added to the Plan 1 set), FileUpload (size and type rejection, remove, events), Knob (clamping, step, keyboard), Timeline (alignment and slots), DataView (layout, sort, pagination), ScrollTop (threshold), MultiSelect and Listbox (selection, filter), ConfirmPopover (accept and reject). All present.
- Placeholder scan: no TBD, TODO, "similar to Task", or "add validation" phrasing; every code step carries its code. The conditional sentences ("if the installed typing differs, use the name found and record it") are verification instructions with a stated fallback, not deferred design.
- Type consistency: `MenuModelItem` is the one item type across Task 13 and `SplitButton`; `TreeSelectionKeys` is shared by `Tree` and `TreeSelect`; `DataTableColumnMeta` is defined in `filters.ts` and consumed by `features.ts`, `DataTable.vue` and `DataTableFilterMenu.vue`; `Paginator` props (`page`, `pageSize`, `pageCount`, `total`, `pageSizeOptions`, `reportTemplate`) match both callers; `optionLabel`, `optionValue`, `sameOption` are shared by Listbox, MultiSelect, AutoComplete and SelectButton.
- Test count arithmetic: 82 + 4 (Task 1) + 12 (Task 2) + 3 (Task 3) + 11 (Task 4) + 11 (Task 5) + 4 (Task 6) + 9 (Task 7) + 5 (Task 8) + 12 (Task 9: 3 + 3 + 3 + 1 + 2) + 17 (Task 10: 2 + 3 + 3 + 3 + 2 + 1 + 3) + 4 (Task 11) + 5 (Task 12) + 11 (Task 13: 3 + 1 + 2 + 1 + 2 + 2) + 1 (Task 14) = 191 tests; files 17 + 33 = 50.

