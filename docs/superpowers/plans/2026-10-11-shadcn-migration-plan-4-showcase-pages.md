# Showcase pages, Blocks and the PrimeVue sweep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the fifteen showcase pages, the Blocks page and BlockViewer off PrimeVue, then remove PrimeVue from the project.

**Architecture:** Every page is a rename job against components that already exist: Plans 1 to 3 landed the vendored shadcn-vue set, the local wrappers and the gap components, so no page needs a new primitive except `MaskedInput`, which Task 2 adds for InputDoc's mask example. Pages are ported one per commit, each page's PrimeVue components swapped for the mapping in Shared conversion rules below and its PrimeVue-layer utility classes rewritten. Once the last page is clean, Task 17 removes the plugin, the auto-import resolver, the type shim, the PrimeIcons stylesheet and seven packages, and Task 18 proves the tree is free of PrimeVue.

**Tech Stack:** Vue 3.5.42, Vite 8.3, TypeScript 6 strict (`noUnusedLocals`, `noUnusedParameters`), Tailwind 4.3.3, Vitest 4.1.11 with jsdom 29 and `@vue/test-utils` 2.5, Bun, shadcn-vue 2.8.2 vendored components on Reka UI 2.10.4, `@lucide/vue` 1.45, `@tanstack/vue-table` 9.2.4, chart.js 4.5, quill 2.0.3, `vee-validate` 4.15.1 with `@vee-validate/zod` and zod 3.25.76, `@internationalized/date`.

**Spec:** `docs/superpowers/specs/2026-09-12-shadcn-vue-migration-design.md` (this plan is phase 6 of spec section 9; read spec sections 4, 5.11, 5.12, 5.13 and 8 with it)

**Predecessors:** `docs/superpowers/plans/2026-09-12-shadcn-migration-plan-1-bootstrap-theme-wrappers.md`, `…-plan-2-app-pages.md`, `…-plan-3-gap-components.md`. All three are complete and pushed; branch `worktree-shadcn-vue-migration` is at `6779d20`.

## Global Constraints

- Bun only: `bun run dev`, `bun run build`, `bun run type-check`, `bun run lint`, `bun run test`, `bunx <tool>`. Never npm, npx or yarn. Never bare `bun test` or `bun build`: those are Bun builtins that shadow the package scripts and fail in ways that look like a broken project.
- Every task ends green on all four: `bun run type-check` (exit 0), `bun run lint` (0 errors; 5 pre-existing warnings, listed under Verified facts), `bun run test`, `bun run build`.
- Prettier: 4-space indent, single quotes, semicolons, no trailing commas, `printWidth` 250. Run `bunx prettier --check <files>` before committing and say so if `--write` changed anything.
- Vendored files under `src/components/ui` are not edited. The two sanctioned edits already made (the `alert` variant map, the `popover` re-export) stay as they are. If a page seems to need a vendored change, report it instead.
- Icons come only from `@/components/icons`. Never import from `@lucide/vue` outside `src/components/icons.ts` and the vendored folder.
- No new dependencies. The five already installed and unused in the tree (`vee-validate`, `@vee-validate/zod`, `zod`, `embla-carousel-vue`, `@internationalized/date`) are consumed by this plan.
- TypeScript strict. Every page gains `<script setup lang="ts">`: all fifteen showcase pages are plain JavaScript today. Type every ref, every function parameter and every service result; `noUnusedLocals` means an unused import or ref fails the build.
- No em dashes anywhere: not in code, comments, commit messages or reports. Use a comma, a colon, parentheses or two sentences.
- No AI attribution lines in commit messages: no `Co-Authored-By` naming an AI, no "generated with" footer.
- Comments say why, not what. A comment that restates the code is noise.
- Git: single plain commands, one per shell invocation. The harness refuses compound lines containing `git` and refuses heredocs. Never amend, reset, rebase or stash. Use the Write and Edit tools for file content.
- Tests select by `data-slot`, `data-testid` or ARIA, never by a Tailwind class.
- Pages are not unit tested. Spec section 8 scopes tests to utilities and to local components with logic, and names the demo pages as out of scope. A page task's evidence is the four verification commands plus the diff; the browser pass is Task 18's. Logic worth testing is extracted to `src/utils` instead (Tasks 1, 2 and 15 do exactly that).
- The demo image host `https://primefaces.org/cdn/primevue/images/...` stays. It is where the demo data's product, avatar, flag and galleria images live, there is no replacement host, and the services are unchanged by spec section 5.11. Task 18's exit grep therefore excludes that host, as Plan 3's gate grep already did.
- `src/views/pages/Documentation.vue` is not touched by this plan. Spec phase 8 rewrites it alongside CLAUDE.md and the README, which is Plan 5. Task 18's exit grep excludes it and names it as Plan 5's.
- The `card` class every page uses is defined in `src/assets/layout/_utils.scss:8` and stays. Plan 5 retires SCSS.

## Shared conversion rules

**These rules bind every page task. They are pasted into each implementer's dispatch; a task section does not repeat them.**

### Severity to variant

PrimeVue's `severity` prop becomes a shadcn `variant`. The map is the same for `Button`, `Badge` and `Message`:

| PrimeVue severity    | variant                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| absent, or `primary` | `default`                                                                   |
| `secondary`          | `secondary`                                                                 |
| `success`            | `success`                                                                   |
| `info`               | `info`                                                                      |
| `warn` or `warning`  | `warning`                                                                   |
| `help`               | `help` (Button only; Badge and Alert have no `help`, use `secondary` there) |
| `danger`             | `destructive`                                                               |
| `contrast`           | `contrast`                                                                  |

A severity value that falls outside the map resolves to `default`. `TableDoc`'s `getSeverity` returns `undefined` for `'proposal'` and `null` for `'renewal'`; both must land on `default` rather than crashing, so type those helpers `(status: string) => BadgeVariants['variant']` and give them a `default:` branch returning `'default'`.

### Button modifiers

`Button` has no `label`, `icon`, `iconPos`, `text`, `outlined`, `raised`, `rounded`, `plain`, `badge` or `loading` prop. Variants are `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`, `success`, `warning`, `info`, `help`, `contrast`; sizes are `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`.

| PrimeVue                | shadcn                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `label="Submit"`        | the default slot: `<Button>Submit</Button>`                                                           |
| `icon="pi pi-check"`    | the mapped icon component as the first child, label text after it                                     |
| `iconPos="right"`       | the icon component after the label text                                                               |
| icon with no label      | `size="icon"` (or `icon-sm`, `icon-xs`, `icon-lg` to match the neighbouring control)                  |
| `text`                  | `variant="ghost"`, plus the severity text colour from the table below                                 |
| `outlined`              | `variant="outline"`, plus the severity border and text colours from the table below                   |
| `raised`                | add `shadow-md` to `class`                                                                            |
| `rounded`               | add `rounded-full` to `class`                                                                         |
| `plain text`            | `variant="ghost"` with `text-foreground`                                                              |
| `class="p-button-link"` | `variant="link"`, and drop the class                                                                  |
| `badge="8"`             | a `Badge` as the last child: `<Badge variant="secondary">8</Badge>`                                   |
| `:loading="flag"`       | `:disabled="flag"` plus `<Spinner v-if="flag" />` from `@/components/ui/spinner` in place of the icon |
| `:fluid="false"`        | nothing; drop it                                                                                      |
| `as="a" href=…`         | unchanged, `Button` forwards `as` through Reka's `Primitive`                                          |

Severity colours for `ghost` and `outline`, because those two variants are neutral:

| severity    | ghost adds                  | outline adds                              |
| ----------- | --------------------------- | ----------------------------------------- |
| `secondary` | `text-secondary-foreground` | `border-border text-secondary-foreground` |
| `success`   | `text-green-600`            | `border-green-600 text-green-600`         |
| `info`      | `text-sky-500`              | `border-sky-500 text-sky-500`             |
| `warn`      | `text-amber-500`            | `border-amber-500 text-amber-500`         |
| `help`      | `text-purple-500`           | `border-purple-500 text-purple-500`       |
| `danger`    | `text-destructive`          | `border-destructive text-destructive`     |
| `contrast`  | `text-foreground`           | `border-foreground text-foreground`       |

### Utility class rewrites

Apply across every file this plan touches, including the raw-HTML strings in `blocksCode`:

| PrimeVue layer                                                                                                                   | replacement                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `bg-surface-0`, `bg-surface-0 dark:bg-surface-900`, `bg-surface-50`                                                              | `bg-card`                                                                                                             |
| `bg-surface-100`, `bg-surface-200`                                                                                               | `bg-muted`                                                                                                            |
| `dark:bg-surface-600`, `dark:bg-surface-700`, `dark:bg-surface-800`                                                              | drop (the `bg-*` token already carries dark mode)                                                                     |
| `bg-surface-900`, `bg-surface-950`, `dark:bg-surface-900`, `dark:bg-surface-950`                                                 | `bg-card` where it pairs with a light-mode surface; `bg-foreground` where the design wants a dark block in both modes |
| `text-surface-900`, `text-surface-800`, `text-surface-900 dark:text-surface-0`, `dark:text-surface-0`                            | `text-foreground`                                                                                                     |
| `text-surface-500`, `text-surface-600`, `text-surface-700`, `dark:text-surface-300`, `dark:text-surface-400`, `text-muted-color` | `text-muted-foreground`                                                                                               |
| `text-surface-0`, `text-surface-100`, `dark:text-surface-100`                                                                    | `text-background` on a dark block, `text-primary-foreground` on a primary block                                       |
| `border-surface`, `border-surface-200`, `dark:border-surface-700`                                                                | `border-border`                                                                                                       |
| `bg-highlight`                                                                                                                   | `bg-accent`                                                                                                           |
| `rounded-border`                                                                                                                 | `rounded-lg`                                                                                                          |
| `text-primary`                                                                                                                   | unchanged                                                                                                             |
| `text-primary-500`, `dark:text-primary-400`                                                                                      | `text-primary`                                                                                                        |
| `hover:text-primary-emphasis`                                                                                                    | `hover:text-primary/80`                                                                                               |
| `text-primary-contrast`                                                                                                          | `text-primary-foreground`                                                                                             |
| `fill-surface-0`                                                                                                                 | `fill-background`                                                                                                     |
| `fill-surface-700`, `dark:fill-surface-200`                                                                                      | `fill-foreground`                                                                                                     |
| a fixed numeric shade that is part of a design (a dark hero, a glass card)                                                       | Tailwind's built-in `zinc` scale                                                                                      |

No custom `surface` scale is added to `@theme`. A `!` suffix (`w-full!`) is Tailwind 4 important syntax and is kept where it was needed.

### Icons

`pi pi-x-y` becomes `IconXY` from `@/components/icons`, which already exports all 62 glyphs these pages use except one: there is no `IconStarFill`. Render a filled star as `<IconStar class="fill-current" />`. Do not add an alias to the icon map for it.

Brand glyphs were resolved in Plan 1 and the substitute is already in the map with a comment: `pi-apple` to lucide `Apple`, `pi-facebook` to `ThumbsUp`, `pi-google` to `Search`, `pi-microsoft` to `LayoutGrid`, `pi-discord` to `MessageCircle`, `pi-github` to `ExternalLink`. Use them as they are; lucide ships no brand icons and this plan does not inline third-party logos.

`pi-fw` is a fixed-width modifier with no meaning here; drop it. A bare `<i class="pi pi-bell" style="font-size: 2rem" />` becomes `<IconBell class="size-8" />`.

### Component replacements

| PrimeVue                                                                                                                                                                                                                                                                                    | replacement                                                                                                        | notes                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Fluid`                                                                                                                                                                                                                                                                                     | nothing; put `w-full` on the inputs that were stretched                                                            | `Fluid` only set `fluid` on descendants                                                                                                                                                                                            |
| `InputText`                                                                                                                                                                                                                                                                                 | `Input` from `@/components/ui/input`                                                                               | `invalid` becomes `aria-invalid="true"`                                                                                                                                                                                            |
| `Textarea`                                                                                                                                                                                                                                                                                  | `Textarea` from `@/components/ui/textarea`                                                                         | `:autoResize` has no equivalent; drop it and keep `rows`                                                                                                                                                                           |
| `IconField` + `InputIcon`                                                                                                                                                                                                                                                                   | `InputGroup` + `InputGroupAddon` + `InputGroupInput`                                                               | `InputGroupAddon` takes `align="inline-start"` (default) or `align="inline-end"`; the input inside an `InputGroup` is `InputGroupInput`, not `Input`                                                                               |
| `InputGroup` + `InputGroupAddon`                                                                                                                                                                                                                                                            | `InputGroup` + `InputGroupAddon` (vendored)                                                                        | addons hold icons, text or a `Button`; text addons use `InputGroupText`                                                                                                                                                            |
| `InputNumber`                                                                                                                                                                                                                                                                               | `NumberField` + `NumberFieldContent` + `NumberFieldDecrement` + `NumberFieldInput` + `NumberFieldIncrement`        | `mode="currency"` becomes `:format-options="{ style: 'currency', currency: 'USD' }"`; `showButtons` is the decrement and increment children                                                                                        |
| `Select`                                                                                                                                                                                                                                                                                    | `Select` + `SelectTrigger` + `SelectValue` + `SelectContent` + `SelectItem`                                        | the vendored `Select` is string-valued: bind `:model-value="String(x)"` and map back, as `Crud.vue` already does                                                                                                                   |
| `RadioButton`                                                                                                                                                                                                                                                                               | `RadioGroup` + `RadioGroupItem`                                                                                    | one `RadioGroup` wraps the whole set and owns the `v-model`                                                                                                                                                                        |
| `Checkbox` with `:binary`                                                                                                                                                                                                                                                                   | `Checkbox` with `v-model`                                                                                          | an array-valued PrimeVue checkbox group becomes one `Checkbox` per value with an explicit `@update:model-value` that adds or removes from the array                                                                                |
| `ToggleSwitch`                                                                                                                                                                                                                                                                              | `Switch`                                                                                                           |                                                                                                                                                                                                                                    |
| `ToggleButton`                                                                                                                                                                                                                                                                              | `ToggleButton` from `@/components/ToggleButton.vue`                                                                | props `onLabel`, `offLabel`, `onIcon`, `offIcon` kept                                                                                                                                                                              |
| `SelectButton`                                                                                                                                                                                                                                                                              | `SelectButton` from `@/components/SelectButton.vue`                                                                | `:allowEmpty="false"` is the `allowEmpty` prop                                                                                                                                                                                     |
| `Rating`                                                                                                                                                                                                                                                                                    | `StarRating` from `@/components/StarRating.vue`                                                                    | `readonly` kept                                                                                                                                                                                                                    |
| `Tag`                                                                                                                                                                                                                                                                                       | `Badge`                                                                                                            | `value` becomes the default slot; `:rounded` is already the Badge shape, so give the non-rounded group `rounded-md` to keep the two groups visually distinct; `icon` becomes an icon child                                         |
| `Message`                                                                                                                                                                                                                                                                                   | `Message` from `@/components/Message.vue`                                                                          | severity per the table; `closable` is a prop                                                                                                                                                                                       |
| `Toast`                                                                                                                                                                                                                                                                                     | nothing; the `Toaster` in `App.vue` is global                                                                      | drop every `<Toast />` tag                                                                                                                                                                                                         |
| `useToast` from `primevue/usetoast`                                                                                                                                                                                                                                                         | `useToast` from `@/composables/useToast`                                                                           | identical call shape: `toast.add({ severity, summary, detail, life })`                                                                                                                                                             |
| `useConfirm` from `primevue/useconfirm`                                                                                                                                                                                                                                                     | `useConfirm` from `@/composables/useConfirm`                                                                       | `require({ target, message, icon, acceptLabel, rejectLabel, acceptVariant, rejectVariant, accept, reject })`; `icon` is a component, not a class string; `target` must be captured eagerly as `event.currentTarget as HTMLElement` |
| `ConfirmPopup` tag                                                                                                                                                                                                                                                                          | nothing; `ConfirmDialogHost` in `App.vue` renders both shapes                                                      | drop the tag                                                                                                                                                                                                                       |
| `Dialog`                                                                                                                                                                                                                                                                                    | `Dialog` + `DialogContent` + `DialogHeader` + `DialogTitle` + `DialogDescription` + `DialogFooter`                 | `v-model:visible` becomes `v-model:open`; `:modal` is the default; width goes on `DialogContent`'s class; always give a `DialogTitle` and a `DialogDescription`, adding `class="sr-only"` when the design shows neither            |
| `Drawer`                                                                                                                                                                                                                                                                                    | `Sheet` + `SheetContent` + `SheetHeader` + `SheetTitle`                                                            | `position` becomes `side` (`top`, `right`, `bottom`, `left`); `position="full"` has no side, use `side="right"` with `class="w-screen max-w-none"`                                                                                 |
| `Popover` with `ref` and `toggle(event)`                                                                                                                                                                                                                                                    | `Popover` + `PopoverTrigger` + `PopoverContent`                                                                    | declarative: the trigger wraps the button with `as-child`, or bind `v-model:open`                                                                                                                                                  |
| `v-tooltip="'text'"`                                                                                                                                                                                                                                                                        | `Tooltip` + `TooltipTrigger as-child` + `TooltipContent`                                                           | needs a `TooltipProvider` ancestor, which Task 1 adds to `App.vue`                                                                                                                                                                 |
| `ScrollPanel`                                                                                                                                                                                                                                                                               | `ScrollArea`                                                                                                       | size goes on the class                                                                                                                                                                                                             |
| `ProgressBar`                                                                                                                                                                                                                                                                               | `Progress`                                                                                                         | `:showValue` has no equivalent; when the original showed the value, render it in a sibling span                                                                                                                                    |
| `Splitter` + `SplitterPanel`                                                                                                                                                                                                                                                                | `ResizablePanelGroup` + `ResizablePanel` + `ResizableHandle`                                                       | `layout="vertical"` becomes `direction="vertical"`; `:size` becomes `:default-size`; `:minSize` becomes `:min-size`; a handle goes between every pair of panels                                                                    |
| `Accordion` + `AccordionPanel` + `AccordionHeader` + `AccordionContent`                                                                                                                                                                                                                     | `Accordion` + `AccordionItem` + `AccordionTrigger` + `AccordionContent`                                            | `Accordion` needs `type="single"` and `collapsible`; `value` stays the active item id                                                                                                                                              |
| `Tabs` + `TabList` + `Tab` + `TabPanels` + `TabPanel`                                                                                                                                                                                                                                       | `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent`                                                                | `value` is `default-value` or `v-model`                                                                                                                                                                                            |
| `Stepper` + `StepList` + `Step`                                                                                                                                                                                                                                                             | `AppSteps` from `@/components/menu`                                                                                | `model` is the item array, `v-model:activeStep` is 0-based                                                                                                                                                                         |
| `Card` with `#title` and `#content`                                                                                                                                                                                                                                                         | `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` + `CardFooter`                             |                                                                                                                                                                                                                                    |
| `Panel`, `Fieldset`, `Divider`, `Timeline`, `DataView`, `OrderList`, `PickList`, `Galleria`, `FileUpload`, `Knob`, `ColorPicker`, `FloatLabel`, `Listbox`, `MultiSelect`, `AutoComplete`, `DatePicker`, `TreeSelect`, `Tree`, `Chip`, `OverlayBadge`, `ScrollTop`, `SplitButton`, `Toolbar` | the local component of the same name from `@/components/...`                                                       | prop and slot shapes were kept deliberately, so these are import-only changes; check the local component's props before assuming a PrimeVue-only prop survives                                                                     |
| `Image`                                                                                                                                                                                                                                                                                     | `ImagePreview` from `@/components/ImagePreview.vue`                                                                | `preview` defaults to true                                                                                                                                                                                                         |
| `Carousel`                                                                                                                                                                                                                                                                                  | `Carousel` + `CarouselContent` + `CarouselItem` + `CarouselPrevious` + `CarouselNext`                              | `numVisible` is per-item basis classes (`basis-full sm:basis-1/2 lg:basis-1/3`), not a prop; `:responsiveOptions` goes away with it; the `#item` slot becomes the `CarouselItem` body                                              |
| `Menu` with `:popup` and `toggle(event)`                                                                                                                                                                                                                                                    | `MenuList` with `popup` and the `trigger` slot                                                                     | the trigger button moves inside the slot                                                                                                                                                                                           |
| `Menu` inline                                                                                                                                                                                                                                                                               | `MenuList`                                                                                                         |                                                                                                                                                                                                                                    |
| `Menubar`, `ContextMenu`, `MegaMenu`, `PanelMenu`, `TieredMenu`, `Breadcrumb`                                                                                                                                                                                                               | `AppMenubar`, `AppContextMenu`, `AppMegaMenu`, `PanelMenu`, `TieredMenu`, `AppBreadcrumb` from `@/components/menu` | menu models keep PrimeVue's item shape except `icon`, which is a component from `@/components/icons` rather than a class string                                                                                                    |
| `DataTable` + `Column`                                                                                                                                                                                                                                                                      | the `DataTable` wrapper from `@/components/data-table`                                                             | columns are built with `createColumns<T>()`, not template tags; see Task 13 for the full pattern                                                                                                                                   |
| `TreeTable`                                                                                                                                                                                                                                                                                 | the `DataTable` wrapper with `subRowsKey`                                                                          | see Task 14                                                                                                                                                                                                                        |
| `Password`                                                                                                                                                                                                                                                                                  | `PasswordInput` from `@/components/PasswordInput.vue`                                                              | `:toggleMask` and `:feedback` kept; `input-class` goes on `class`                                                                                                                                                                  |
| `Editor` from `primevue/editor`                                                                                                                                                                                                                                                             | `QuillEditor` from `@/components/QuillEditor.vue`                                                                  | output is untrusted: it must pass through `sanitizeHtml()` before any `v-html`, which the existing FormLayout code already does                                                                                                    |

### Verified facts

Checked in the worktree on 2026-10-11; trust these rather than re-deriving them.

- All fifteen showcase pages are `<script setup>` with no `lang="ts"`. `src/views/utilities/Blocks.vue` is already `lang="ts"`.
- The five pre-existing lint warnings are `scripts/update-deps.ts:11` and `:15`, `src/components/ui/calendar/CalendarHeading.vue:11`, `src/service/types.ts:73`, `src/types/tailwindcss-primeui.d.ts:2`. Task 17 deletes the last file, so from Task 17 on the expected count is 4.
- Test baseline at the start of this plan: 212 tests in 52 files.
- `src/components/icons.ts` exports 110 icons. Every `pi-*` glyph used by the pages resolves except `pi-star-fill`.
- `Button` supports `as`; it has no `loading`. `src/components/ui/spinner/Spinner.vue` is the spinner.
- `Avatar` sizes are `sm`, `default`, `lg`. PrimeVue's `size="large"` is `size="lg"`; `size="xlarge"` is `size="lg"` plus `class="size-12"`.
- `Skeleton` takes only `class`. PrimeVue's `width`, `height`, `shape` and `size` become classes.
- `Badge` is pill-shaped by default (`rounded-4xl`).
- `badgeVariants` and `buttonVariants` both include `success`, `warning`, `info` and `contrast`; only `buttonVariants` has `help`.
- `src/components/ui/form/index.ts` re-exports `Form`, `FormField` and `FormFieldArray` from `vee-validate` alongside `FormItem`, `FormLabel`, `FormControl`, `FormDescription` and `FormMessage`.
- `TooltipProvider` is mounted only inside `SidebarProvider`, which no route renders yet, so a bare `Tooltip` has no provider until Task 1 adds one to `App.vue`.
- `https://www.shadcn-vue.com/blocks` is live and titled "Building Blocks for the Web - shadcn/vue" (fetched 2026-10-11).
- `src/layout/AppMenu.vue:82` holds the `All Blocks` entry pointing at `https://blocks.primevue.org/`.
- `src/components/BlockViewer.vue` reads exactly two PrimeVue tokens, `--p-surface-900` (line 149) and `--p-surface-50` (line 157), from a scoped SCSS block.
- `src/views/utilities/Blocks.vue` holds eleven `BlockViewer` instances and a `blocksCode` object whose eleven raw-HTML strings duplicate the rendered markup for the Code tab.
- `TableDoc.vue`'s Filtering card calls `clearFilter()`, which is not defined anywhere in the file. The port must define it.
- `MiscDoc.vue` has two upstream typos: `<Badge :value="12" severity="Warn">` (capital W, so the severity never matches) and `<Tag con="pi pi-exclamation-triangle" …>` (`con` instead of `icon`). Both are fixed in the port; the intent is unambiguous.
- `PanelsDoc.vue` uses `className` on three divs, a React-ism that does nothing in Vue. The port uses `class`.
- `MessagesDoc.vue` renders a `transition-group` over a `message` ref that is always empty, so that block renders nothing today.
- `ListDoc.vue`'s `OrderList` carries `pt:pcList:root="w-full"` and both lists carry `breakpoint="1400px"`; all three are PrimeVue pass-through props with no local equivalent and are dropped.
- Services are unchanged: `ProductService.getProductsSmall`, `getProductsWithOrdersSmall`, `CustomerService.getCustomersLarge`, `getCustomersMedium`, `NodeService.getTreeNodes`, `getTreeTableNodes`, `PhotoService.getImages`, `CountryService.getCountries`.
- `src/service/ProductService.ts:18,47` and `src/service/CustomerService.ts:24` contain `// ... existing code ...` placeholders left by an earlier edit, so `getProductsSmall` returns three products. That is pre-existing and out of scope; do not fix it inside a page task.

---

## File structure

**Created:**

- `src/utils/currency.ts` plus `currency.test.ts`: one `formatCurrency` for the three pages that each have their own copy today.
- `src/utils/chartColors.ts` plus `chartColors.test.ts`: palette shade lookup for chart datasets, shared by `RevenueStreamWidget` and `ChartDoc`.
- `src/utils/mask.ts` plus `mask.test.ts`: the mask grammar from spec section 5.7.
- `src/components/MaskedInput.vue`: the masked input built on `mask.ts`.
- `src/views/utilities/blocksCode.ts` plus `blocksCode.test.ts`: the eleven Code-tab strings, extracted out of `Blocks.vue` so they can be tested and so neither file is oversized.

**Modified:** the fifteen showcase pages under `src/views/uikit/`, `src/views/utilities/Blocks.vue`, `src/components/BlockViewer.vue`, `src/App.vue`, `src/main.ts`, `vite.config.ts`, `src/assets/tailwind.css`, `src/assets/styles.scss`, `src/layout/AppMenu.vue`, `src/layout/AppMenuItem.vue`, `src/layout/composables/layout.ts`, `src/components/dashboard/RecentSalesWidget.vue`, `src/components/dashboard/RevenueStreamWidget.vue`, `src/views/pages/Crud.vue`, `src/components/landing/TopbarWidget.vue`, `src/layout/AppTopbar.vue`, `src/assets/layout/_topbar.scss`, `package.json`, and the nine component files Task 16 touches.

**Deleted:** `src/layout/composables/primevueBridge.ts`, `src/types/tailwindcss-primeui.d.ts`.

---

### Task 1: The shared page kit

**Files:**

- Create: `src/utils/currency.ts`, `src/utils/currency.test.ts`
- Create: `src/utils/chartColors.ts`, `src/utils/chartColors.test.ts`
- Modify: `src/App.vue` (add the tooltip provider)
- Modify: `src/components/dashboard/RecentSalesWidget.vue:13-15,25` (use the shared helper)
- Modify: `src/views/pages/Crud.vue:48-50,67` (use the shared helper)
- Modify: `src/components/dashboard/RevenueStreamWidget.vue:11-16,29-32,44-46,60` (use the shared helper, drop the dead guard)

**Interfaces:**

- Produces: `formatCurrency(value: number | null | undefined, currency?: string): string` from `@/utils/currency`, returning `''` for null and undefined and otherwise `value.toLocaleString('en-US', { style: 'currency', currency })` with `currency` defaulting to `'USD'`.
- Produces: `chartShade(primary: string, surface: string | null, mode: ThemeMode, key: Shade): string` and `paletteShade(name: string, key: Shade): string` from `@/utils/chartColors`. `chartShade` is the primary-with-noir-fallback rule `RevenueStreamWidget` holds today; `paletteShade` reads any named primary palette so a chart can ask for a fixed hue such as `indigo` at shade `500`.
- Consumes: `resolvePrimary`, `resolveSurface`, `type ThemeMode` from `@/utils/theme`; `primaryPalettes`, `type Palette`, `type Shade` from `@/layout/palettes`.
- Later tasks: Task 4 (`ChartDoc`) consumes both chart helpers; Task 13 (`TableDoc`) consumes `formatCurrency`; Task 11 (`OverlayDoc`) relies on the tooltip provider.

- [ ] **Step 1: Write the failing currency test**

Create `src/utils/currency.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
    it('formats a number as US dollars', () => {
        expect(formatCurrency(65)).toBe('$65.00');
        expect(formatCurrency(1234.5)).toBe('$1,234.50');
    });

    it('returns an empty string for null and undefined rather than crashing', () => {
        expect(formatCurrency(undefined)).toBe('');
        expect(formatCurrency(null)).toBe('');
    });

    it('formats zero and negatives', () => {
        expect(formatCurrency(0)).toBe('$0.00');
        expect(formatCurrency(-5)).toBe('-$5.00');
    });

    it('honours another currency', () => {
        expect(formatCurrency(10, 'EUR')).toBe('€10.00');
    });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `bun run test src/utils/currency.test.ts`
Expected: FAIL, cannot resolve `./currency`.

- [ ] **Step 3: Write `src/utils/currency.ts`**

```ts
// One currency formatter for every page: three copies with two different null behaviours existed before.
export function formatCurrency(value: number | null | undefined, currency = 'USD'): string {
    if (value === null || value === undefined) return '';
    return value.toLocaleString('en-US', { style: 'currency', currency });
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `bun run test src/utils/currency.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write the failing chart-colour test**

Create `src/utils/chartColors.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { chartShade, paletteShade } from './chartColors';

describe('paletteShade', () => {
    it('reads a named primary palette', () => {
        expect(paletteShade('indigo', '500')).toBe('#6366f1');
        expect(paletteShade('purple', '400')).toBe('#c084fc');
    });

    it('falls back to the foreground token for an unknown palette', () => {
        expect(paletteShade('nope', '500')).toBe('var(--foreground)');
    });
});

describe('chartShade', () => {
    it('uses the picked primary palette', () => {
        expect(chartShade('emerald', 'slate', 'light', '500')).toBe('#10b981');
    });

    it('falls back to the surface scale for noir, which has no palette of its own', () => {
        expect(chartShade('noir', 'slate', 'light', '500')).toBe('#64748b');
        expect(chartShade('noir', null, 'dark', '500')).toBe('#71717a');
    });
});
```

- [ ] **Step 6: Run it and watch it fail**

Run: `bun run test src/utils/chartColors.test.ts`
Expected: FAIL, cannot resolve `./chartColors`.

- [ ] **Step 7: Write `src/utils/chartColors.ts`**

```ts
import { primaryPalettes, type Shade } from '@/layout/palettes';
import { resolvePrimary, resolveSurface, type ThemeMode } from '@/utils/theme';

// chart.js needs a concrete colour string, not a CSS variable that resolves per element, so chart
// datasets read the palette records directly rather than computed styles.
export function paletteShade(name: string, key: Shade): string {
    return primaryPalettes.find((option) => option.name === name)?.palette[key] ?? 'var(--foreground)';
}

// The picked primary drives dataset colours; noir carries no palette, so it borrows the surface scale.
export function chartShade(primary: string, surface: string | null, mode: ThemeMode, key: Shade): string {
    return resolvePrimary(primary).palette[key] ?? resolveSurface(surface, mode).palette[key] ?? 'var(--foreground)';
}
```

- [ ] **Step 8: Run it and watch it pass**

Run: `bun run test src/utils/chartColors.test.ts`
Expected: PASS, 4 tests. If a hex in the test does not match `src/layout/palettes.ts`, the palette file is the truth: correct the test to the value in the file and say so in the report.

- [ ] **Step 9: Add the tooltip provider to `src/App.vue`**

`Tooltip` is a bare `TooltipRoot`, which throws without a provider. Wrap the router view:

```vue
<script setup lang="ts">
    import { TooltipProvider } from 'reka-ui';
    import 'vue-sonner/style.css';
    import ConfirmDialogHost from '@/components/ConfirmDialogHost.vue';
    import { Toaster } from '@/components/ui/sonner';
</script>

<template>
    <!-- One provider for the whole app: a bare Tooltip has no ancestor provider and throws. -->
    <TooltipProvider :delay-duration="200">
        <router-view />
    </TooltipProvider>
    <Toaster position="top-right" close-button :offset="{ top: '5rem', right: '1.5rem' }" />
    <ConfirmDialogHost />
</template>
```

- [ ] **Step 10: Point the three existing copies at the helpers**

In `src/components/dashboard/RecentSalesWidget.vue`, delete the local `formatCurrency` (lines 13 to 15) and add `import { formatCurrency } from '@/utils/currency';`. The call site at line 25 is unchanged.

In `src/views/pages/Crud.vue`, delete the local `formatCurrency` (lines 48 to 50) and add the same import. The call site at line 67 is unchanged.

In `src/components/dashboard/RevenueStreamWidget.vue`: delete the local `primaryShade` and the `resolvePrimary`, `resolveSurface`, `ThemeMode` and `Shade` imports, import `chartShade` from `@/utils/chartColors`, and define one local wrapper so `buildData` reads the same way:

```ts
function primaryShade(key: Shade): string {
    return chartShade(layoutConfig.primary, layoutConfig.surface, isDarkTheme.value ? 'dark' : 'light', key);
}
```

Keep the `Shade` type import for that signature. Then remove the dead `ready` guard that the Plan 2 gate raised: `buildData()` always returns three datasets, so `v-if="ready"` never hid anything. Delete the `ready` computed and the `computed` import if nothing else uses it, and render `<AppChart type="bar" :data="chartData" :options="chartOptions" class="h-80" />` unconditionally.

- [ ] **Step 11: Verify**

Run each and paste the output:

- `bun run type-check` (expect exit 0)
- `bun run lint` (expect 0 errors, 5 warnings)
- `bun run test` (expect 220 tests in 54 files: the 212 baseline plus 8 new)
- `bun run build` (expect success)
- `bunx prettier --check src/utils/currency.ts src/utils/currency.test.ts src/utils/chartColors.ts src/utils/chartColors.test.ts src/App.vue src/components/dashboard/RecentSalesWidget.vue src/components/dashboard/RevenueStreamWidget.vue src/views/pages/Crud.vue`

- [ ] **Step 12: Commit**

```
git add src/utils/currency.ts src/utils/currency.test.ts src/utils/chartColors.ts src/utils/chartColors.test.ts src/App.vue src/components/dashboard/RecentSalesWidget.vue src/components/dashboard/RevenueStreamWidget.vue src/views/pages/Crud.vue
```

then

```
git commit -m "feat: add shared currency and chart-colour helpers and a tooltip provider"
```

---

### Task 2: `MaskedInput` and the mask grammar

**Files:**

- Create: `src/utils/mask.ts`, `src/utils/mask.test.ts`
- Create: `src/components/MaskedInput.vue`

**Interfaces:**

- Produces from `@/utils/mask`: `applyMask(raw: string, mask: string, slotChar?: string): { display: string; unmasked: string }` and `isMaskComplete(display: string, mask: string, slotChar?: string): boolean`.
- Produces `MaskedInput` from `@/components/MaskedInput.vue` with props `mask: string`, `slotChar?: string` (default `'_'`), `unmask?: boolean` (default `false`), `placeholder?: string`, `disabled?: boolean`, `id?: string`, `class?: HTMLAttributes['class']`, and `v-model` of type `string`. When `unmask` is true the model holds only the typed characters; otherwise it holds the formatted string.
- Consumes: `Input` from `@/components/ui/input`, `cn` from `@/lib/utils`.
- Task 7 (`InputDoc`) is the consumer; nothing else in the tree uses it.

Spec section 5.7 lists `InputMask` as a component to land and spec section 8 names `mask.test.ts`; spec section 5.11 puts the usage in InputDoc. Plan 3 left it out because no page used it yet. This task closes that.

The grammar, from PrimeVue's InputMask: `9` accepts a digit, `a` accepts a letter, `*` accepts a letter or a digit, `?` starts the optional tail, and every other character in the mask is a literal that is inserted automatically. Unfilled positions render as `slotChar`.

- [ ] **Step 1: Write the failing test**

Create `src/utils/mask.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { applyMask, isMaskComplete } from './mask';

describe('applyMask', () => {
    it('fills digit placeholders and inserts literals', () => {
        expect(applyMask('9123456789', '(999) 999-9999').display).toBe('(912) 345-6789');
        expect(applyMask('9123456789', '(999) 999-9999').unmasked).toBe('9123456789');
    });

    it('shows the slot character for positions that are not typed yet', () => {
        expect(applyMask('912', '(999) 999-9999').display).toBe('(912) ___-____');
        expect(applyMask('', '(999) 999-9999').display).toBe('(___) ___-____');
    });

    it('honours a custom slot character', () => {
        expect(applyMask('12', '99/99', '*').display).toBe('12/**');
    });

    it('rejects characters the placeholder does not accept', () => {
        expect(applyMask('ab12', '9999').display).toBe('12__');
        expect(applyMask('12ab', 'aaaa').display).toBe('ab__');
        expect(applyMask('a1-b2', '****').display).toBe('a1b2');
    });

    it('drops input past the end of the mask', () => {
        expect(applyMask('123456', '99/99').display).toBe('12/34');
        expect(applyMask('123456', '99/99').unmasked).toBe('1234');
    });

    it('treats the tail after ? as optional', () => {
        expect(applyMask('99', '99?-99').display).toBe('99');
        expect(applyMask('9999', '99?-99').display).toBe('99-99');
    });

    it('ignores literals already present in the raw value so re-entry is idempotent', () => {
        expect(applyMask('(912) 345-6789', '(999) 999-9999').display).toBe('(912) 345-6789');
    });
});

describe('isMaskComplete', () => {
    it('is true only when no slot character is left in the required part', () => {
        expect(isMaskComplete('(912) 345-6789', '(999) 999-9999')).toBe(true);
        expect(isMaskComplete('(912) 345-678_', '(999) 999-9999')).toBe(false);
        expect(isMaskComplete('99', '99?-99')).toBe(true);
    });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `bun run test src/utils/mask.test.ts`
Expected: FAIL, cannot resolve `./mask`.

- [ ] **Step 3: Write `src/utils/mask.ts`**

```ts
// PrimeVue's InputMask grammar: 9 is a digit, a is a letter, * is either, ? opens the optional tail,
// everything else is a literal the component inserts for the user.
const PLACEHOLDERS: Record<string, RegExp> = { 9: /[0-9]/, a: /[A-Za-z]/, '*': /[A-Za-z0-9]/ };

function isPlaceholder(char: string): boolean {
    return char in PLACEHOLDERS;
}

export interface MaskResult {
    display: string;
    unmasked: string;
}

export function applyMask(raw: string, mask: string, slotChar = '_'): MaskResult {
    const pattern = mask.replace('?', '');
    const optionalFrom = mask.includes('?') ? mask.indexOf('?') : pattern.length;
    // Literals and slot characters in the incoming value are re-derived from the mask, so strip them
    // first: that makes applyMask idempotent when it is fed its own output.
    const typed = [...raw].filter((char, index) => {
        if (char === slotChar) return false;
        const at = pattern[index];
        return !(at !== undefined && !isPlaceholder(at) && at === char) || isPlaceholder(pattern[index] ?? '');
    });
    let source = 0;
    let display = '';
    const unmasked: string[] = [];
    for (let i = 0; i < pattern.length; i++) {
        const slot = pattern[i]!;
        if (!isPlaceholder(slot)) {
            display += slot;
            continue;
        }
        let accepted = '';
        while (source < typed.length) {
            const candidate = typed[source]!;
            source += 1;
            if (PLACEHOLDERS[slot]!.test(candidate)) {
                accepted = candidate;
                break;
            }
        }
        if (accepted === '') {
            display += slotChar;
        } else {
            display += accepted;
            unmasked.push(accepted);
        }
    }
    const filled = display.indexOf(slotChar);
    // Nothing typed into the optional tail means the tail is not shown at all.
    if (filled >= optionalFrom) display = display.slice(0, filled);
    return { display: display.replace(new RegExp(`\\${slotChar}+$`), (run) => (optionalFrom < pattern.length ? '' : run)), unmasked: unmasked.join('') };
}

export function isMaskComplete(display: string, mask: string, slotChar = '_'): boolean {
    const required = mask.includes('?') ? mask.slice(0, mask.indexOf('?')) : mask;
    return !display.slice(0, required.length).includes(slotChar);
}
```

The implementation above is the intent, not gospel: if a test fails, fix the implementation until all eight cases pass, and record what you changed. Do not weaken a test. The two behaviours that matter are that `display` is always mask-shaped and that `unmasked` holds only accepted characters.

- [ ] **Step 4: Run it and watch it pass**

Run: `bun run test src/utils/mask.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Write `src/components/MaskedInput.vue`**

```vue
<script setup lang="ts">
    import { computed, type HTMLAttributes } from 'vue';
    import { Input } from '@/components/ui/input';
    import { cn } from '@/lib/utils';
    import { applyMask, isMaskComplete } from '@/utils/mask';

    const props = withDefaults(
        defineProps<{
            mask: string;
            slotChar?: string;
            unmask?: boolean;
            placeholder?: string;
            disabled?: boolean;
            id?: string;
            class?: HTMLAttributes['class'];
        }>(),
        { slotChar: '_', unmask: false, placeholder: undefined, disabled: false, id: undefined, class: undefined }
    );

    const model = defineModel<string>({ default: '' });

    // The field always shows the mask-shaped string; `unmask` only decides what the model carries.
    const display = computed(() => applyMask(model.value, props.mask, props.slotChar).display);
    const complete = computed(() => isMaskComplete(display.value, props.mask, props.slotChar));

    function onInput(event: Event): void {
        const result = applyMask((event.target as HTMLInputElement).value, props.mask, props.slotChar);
        model.value = props.unmask ? result.unmasked : result.display;
    }
</script>

<template>
    <Input
        :id="props.id"
        :model-value="display"
        :placeholder="props.placeholder ?? props.mask"
        :disabled="props.disabled"
        :aria-invalid="display !== '' && !complete ? true : undefined"
        :class="cn(props.class)"
        data-slot="masked-input"
        @input="onInput"
    />
</template>
```

- [ ] **Step 6: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test` (expect 228 tests in 55 files), `bun run build`, `bunx prettier --check src/utils/mask.ts src/utils/mask.test.ts src/components/MaskedInput.vue`.

`MaskedInput` is unused until Task 7 and knip will list it; that is expected and Task 18 records it.

- [ ] **Step 7: Commit**

```
git add src/utils/mask.ts src/utils/mask.test.ts src/components/MaskedInput.vue
```

then

```
git commit -m "feat: add MaskedInput and the mask grammar for InputDoc"
```

---

### Task 3: `ButtonDoc` and `MessagesDoc`

**Files:**

- Modify: `src/views/uikit/ButtonDoc.vue` (198 lines, rewritten)
- Modify: `src/views/uikit/MessagesDoc.vue` (68 lines, rewritten)

**Interfaces:**

- Consumes: `Button` from `@/components/ui/button`, `ButtonGroup` from `@/components/ui/button-group`, `Badge` from `@/components/ui/badge`, `Spinner` from `@/components/ui/spinner`, `SplitButton` from `@/components/SplitButton.vue`, `Input` from `@/components/ui/input`, `Message` from `@/components/Message.vue`, `useToast` from `@/composables/useToast`, `type MenuModelItem` from `@/components/menu`, and icons from `@/components/icons`.
- Produces: nothing other tasks consume.

Two commits, one per page.

#### ButtonDoc

Script: add `lang="ts"`, type `items` as `MenuModelItem[]` with component icons (`IconRefresh`, `IconTimes`, a `{ separator: true }` entry, `IconHome`), type `loading` as `ref<boolean[]>([false, false, false, false])` (the template indexes `loading[3]`, so the array needs four entries, not the three it has today), and type `load(index: number): void`.

Sections, in order, left column then right:

| heading          | conversion                                                                                                                                                                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default          | `<Button>Submit</Button>`, `<Button disabled>Disabled</Button>`, `<Button variant="link">Link</Button>`                                                                                                                                                                                                                                                                   |
| Severities       | eight buttons, `variant` from the severity table, label in the slot                                                                                                                                                                                                                                                                                                       |
| Text             | eight `variant="ghost"` buttons with the ghost text colour per severity; the last is `plain text`, so `variant="ghost" class="text-foreground"` with the label `Plain`                                                                                                                                                                                                    |
| Outlined         | eight `variant="outline"` buttons with the outline border and text colours per severity                                                                                                                                                                                                                                                                                   |
| Group            | `<ButtonGroup>` with three buttons, each an icon plus a label: `IconCheck` Save, `IconTrash` Delete, `IconTimes` Cancel                                                                                                                                                                                                                                                   |
| SplitButton      | eight `<SplitButton label="Save" :model="items" :severity="…" />`, the first with no severity. `SplitButton` keeps PrimeVue's severity names, so pass `severity="warn"` and friends unchanged                                                                                                                                                                             |
| Templating       | two buttons holding images from `/demo/images/logo-white.svg` and `/demo/images/logo.svg` with `class="w-6"` instead of the inline style. The second keeps `variant="outline"` with the success outline colours. Change the visible label text `PrimeVue` to `shadcn-vue`: it is branding text in a template that no longer uses PrimeVue, and the images themselves stay |
| Icons            | `<Button size="icon"><IconStar class="fill-current" /></Button>`, then `IconBookmark` with the label after it, then the same with the icon after the label. Drop the `mr-2 mb-2` classes: the wrapper already has `gap-2`                                                                                                                                                 |
| Raised           | eight buttons, `variant` per severity plus `class="shadow-md"`                                                                                                                                                                                                                                                                                                            |
| Rounded          | eight buttons, `variant` per severity plus `class="rounded-full"`                                                                                                                                                                                                                                                                                                         |
| Rounded Icons    | seven icon-only buttons, `size="icon"` plus `class="rounded-full"`: `IconCheck`, `IconBookmark`, `IconSearch`, `IconUser`, `IconBell`, `IconHeart`, `IconTimes`                                                                                                                                                                                                           |
| Rounded Text     | the same seven as `variant="ghost"` with `class="rounded-full shadow-md"` and the ghost severity text colour                                                                                                                                                                                                                                                              |
| Rounded Outlined | the same seven as `variant="outline"` with `class="rounded-full"` and the outline severity colours                                                                                                                                                                                                                                                                        |
| Loading          | four buttons, each `:disabled="loading[i]"` with `@click="load(i)"`. While loading, render `<Spinner />` where the icon was; otherwise render `IconSearch`. The third is icon-only (`size="icon"`), the fourth has no icon at all                                                                                                                                         |

Keep every wrapper div and its classes exactly as they are: the page's two-column `md:w-1/2` layout and `card flex flex-col gap-4` blocks are unchanged.

#### MessagesDoc

Script: add `lang="ts"`. `const toast = useToast();` now imports from `@/composables/useToast`. Type `username` and `email` as `ref<string>('')` rather than `ref(null)`, because `Input`'s model is a string. Replace the always-empty `message` ref and its `transition-group` with a real closable demo, which is what spec section 5.11 asks for (`Alert` with severity variants and `closable`): type `const dismissible = ref<{ severity: 'success' | 'info' | 'warn' | 'error'; content: string }[]>([...])` with four entries and let `Message`'s `close` event remove one:

```ts
function dismiss(index: number): void {
    dismissible.value.splice(index, 1);
}
```

Sections:

| heading              | conversion                                                                                                                                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toast                | four buttons calling `showSuccess`, `showInfo`, `showWarn`, `showError`; variants `success`, `info`, `warning`, `destructive`. The four functions keep their `toast.add({ severity, summary, detail, life: 3000 })` bodies verbatim |
| Inline               | two rows, each an `Input` with `aria-invalid="true"` and a `Message severity="error"`. The second `Message` carried `icon="pi pi-times-circle"` and no text, so pass `:icon="IconTimesCircle"` and leave the default slot empty     |
| Message              | six `Message` components with severities `success`, `info`, `warn`, `error`, `secondary`, `contrast`. `Message`'s own severity prop takes those names, so they pass through unchanged                                               |
| (new, under Message) | the dismissible list: `<Message v-for="(msg, index) in dismissible" :key="msg.content" :severity="msg.severity" closable @close="dismiss(index)">{{ msg.content }}</Message>`                                                       |

Drop the `<Toast />` tag if one appears; there is none in this file, but `FileDoc` has one.

- [ ] **Step 1: Rewrite `ButtonDoc.vue`**

Work section by section through the table above. Read the current file first; keep the headings, the wrapper markup and the order.

- [ ] **Step 2: Check the page compiles and renders in isolation**

Run: `bun run type-check`
Expected: exit 0. Then `bun run build` and expect success. A page error shows up here as a template compile error or an unresolved import.

- [ ] **Step 3: Commit ButtonDoc**

```
git add src/views/uikit/ButtonDoc.vue
```

then

```
git commit -m "feat: port ButtonDoc to shadcn Button variants"
```

- [ ] **Step 4: Rewrite `MessagesDoc.vue`**

- [ ] **Step 5: Verify both pages**

Run and paste: `bun run type-check`, `bun run lint` (0 errors, 5 warnings), `bun run test` (expect the Task 2 total unchanged at 228 in 55 files), `bun run build`, `bunx prettier --check src/views/uikit/ButtonDoc.vue src/views/uikit/MessagesDoc.vue`.

- [ ] **Step 6: Commit MessagesDoc**

```
git add src/views/uikit/MessagesDoc.vue
```

then

```
git commit -m "feat: port MessagesDoc to Alert severities and the toast shim"
```

---

### Task 4: `ChartDoc`

**Files:**

- Modify: `src/views/uikit/ChartDoc.vue` (269 lines, script largely rewritten)

**Interfaces:**

- Consumes: `AppChart` from `@/components/AppChart.vue`, `chartShade` and `paletteShade` from `@/utils/chartColors` (Task 1), `useLayout` from `@/layout/composables/layout`, `type ChartData` and `type ChartOptions` from `chart.js`.
- Produces: nothing other tasks consume.

The page renders six charts (line, bar, pie, doughnut, polarArea, radar) in a twelve-column grid. Two things change: `Chart` becomes `AppChart`, and every colour read changes.

Today the script reads `--text-color`, `--text-color-secondary`, `--surface-border` (all three are PrimeVue layout variables that no longer exist) and `--p-primary-500`, `--p-primary-200`, `--p-indigo-500`, `--p-purple-500`, `--p-teal-500`, `--p-orange-500`, `--p-indigo-400`, `--p-purple-400`.

Replacements:

| old read                                                                                                 | new source                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--text-color`                                                                                           | `getComputedStyle(document.documentElement).getPropertyValue('--foreground')`                                                                                 |
| `--text-color-secondary`                                                                                 | the same call for `--muted-foreground`                                                                                                                        |
| `--surface-border`                                                                                       | the same call for `--border`                                                                                                                                  |
| `--p-primary-500`, `--p-primary-200`                                                                     | `primary('500')`, `primary('200')` where `primary` is the local wrapper over `chartShade`                                                                     |
| `--p-indigo-500`, `--p-indigo-400`, `--p-purple-500`, `--p-purple-400`, `--p-teal-500`, `--p-orange-500` | `paletteShade('indigo', '500')` and so on: fixed demo hues that must not follow the picked primary, exactly as the PrimeVue version used fixed palette tokens |

Script shape:

```ts
<script setup lang="ts">
    import type { ChartData, ChartOptions } from 'chart.js';
    import { onMounted, ref, watch } from 'vue';
    import AppChart from '@/components/AppChart.vue';
    import { useLayout } from '@/layout/composables/layout';
    import { chartShade, paletteShade } from '@/utils/chartColors';
    import type { Shade } from '@/layout/palettes';

    const { layoutConfig, isDarkTheme } = useLayout();

    function primary(key: Shade): string {
        return chartShade(layoutConfig.primary, layoutConfig.surface, isDarkTheme.value ? 'dark' : 'light', key);
    }
```

Then one `ref<ChartData>` and one `ref<ChartOptions>` per chart, initialised from builder functions rather than `null`, because `AppChart` requires `data` and the old `v-if`-free template bound `null` on first render. Declare them as:

```ts
const lineData = ref<ChartData>(buildLineData());
const lineOptions = ref<ChartOptions>(buildLineOptions());
```

and so on for `bar`, `pie` (shared by the pie and doughnut cards, as today), `polar` and `radar`. Keep every label array, every data array and every `tension`, `fill`, `usePointStyle`, `stacked` and grid option byte for byte: only the colour expressions change. Keep `fontColor` on the legend labels as it is even though chart.js reads `color`, because changing it is out of scope for a port; if lint objects, leave it and say so.

Replace the single `setColorOptions()` with one `refresh()` that reassigns all ten refs, and keep the existing watcher shape, adding `() => layoutConfig.preset` to the sources so a preset change repaints:

```ts
function refresh(): void {
    lineData.value = buildLineData();
    lineOptions.value = buildLineOptions();
    // and the other four pairs
}

watch([() => layoutConfig.primary, () => layoutConfig.surface, () => layoutConfig.preset, isDarkTheme], refresh);
onMounted(refresh);
```

Template: drop the `<Fluid>` wrapper and put its classes on a plain div (`<div class="grid grid-cols-12 gap-8">`), and replace each `<Chart type="…" :data="…" :options="…">` with `<AppChart type="…" :data="…" :options="…" class="h-80" />`. `AppChart` renders a canvas inside a div with no intrinsic height, so each chart needs a height class; `h-80` matches `RevenueStreamWidget`. Keep the six card wrappers and their `col-span-12 xl:col-span-6` classes and the `flex flex-col items-center` on the four round charts.

- [ ] **Step 1: Rewrite the script block**

- [ ] **Step 2: Rewrite the template**

- [ ] **Step 3: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, `bunx prettier --check src/views/uikit/ChartDoc.vue`.

chart.js needs a canvas context, which jsdom does not provide, so this page cannot be smoke-tested in Vitest. That is why the chart colour logic lives in `src/utils/chartColors.ts` with its own tests.

- [ ] **Step 4: Commit**

```
git add src/views/uikit/ChartDoc.vue
```

then

```
git commit -m "feat: port ChartDoc to AppChart and the theme tokens"
```

---

### Task 5: `FileDoc` and `MiscDoc`

**Files:**

- Modify: `src/views/uikit/FileDoc.vue` (36 lines, rewritten)
- Modify: `src/views/uikit/MiscDoc.vue` (197 lines, rewritten)

**Interfaces:**

- Consumes: `FileUpload` from `@/components/file-upload`, `useToast` from `@/composables/useToast`, `Button`, `Badge`, `Avatar`, `AvatarGroup`, `AvatarImage`, `AvatarFallback`, `Progress`, `ScrollArea`, `Skeleton` from `@/components/ui/...`, `Chip` from `@/components/Chip.vue`, `OverlayBadge` from `@/components/OverlayBadge.vue`, `ScrollTop` from `@/components/ScrollTop.vue`, icons from `@/components/icons`.
- Produces: nothing other tasks consume.

Two commits, one per page.

#### FileDoc

Script: add `lang="ts"`, import `useToast` from `@/composables/useToast`, and type the template ref as `ref<InstanceType<typeof FileUpload> | null>(null)`. `FileUpload` exposes `upload`, `clear` and `files`, so `fileupload.value?.upload()` type-checks.

Template: drop the `<Toast />` tag (the global `Toaster` covers it). Both cards keep their headings and grid classes. The advanced upload becomes:

```vue
<FileUpload name="demo[]" multiple accept="image/*" :max-file-size="1000000" @uploader="onUpload" />
```

`customUpload` has no equivalent: the local `FileUpload` never uploads by itself, which is why the prop is gone. The basic upload keeps `mode="basic"` and the ref, and the `Upload` button becomes `<Button variant="secondary" @click="upload">Upload</Button>`.

#### MiscDoc

Script: add `lang="ts"`, type `value` as `ref<number>(0)` and `interval` as `ReturnType<typeof setInterval> | null`.

| heading                 | conversion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ProgressBar             | two `Progress` components. The first showed its value, so render it next to the bar: `<div class="flex items-center gap-2"><Progress :model-value="value" class="flex-1" /><span class="text-sm text-muted-foreground">{{ value }}%</span></div>`. The second is `<Progress :model-value="50" />` with no readout                                                                                                                                                                                                                                                                                    |
| Badge                   | five badges, `variant` per severity. The fourth has the upstream typo `severity="Warn"`, which never matched; use `variant="warning"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Badge / Overlay         | three `OverlayBadge`, the icons becoming `<IconBell class="size-8" />`, `<IconCalendar class="size-8" />`, `<IconEnvelope class="size-8" />`. The third has no `value`, which renders the dot form                                                                                                                                                                                                                                                                                                                                                                                                   |
| Badge / Button          | `<Button>Emails <Badge variant="secondary">8</Badge></Button>` and `<Button variant="warning"><IconUsers />Messages<Badge variant="destructive">8</Badge></Button>`                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Badge / Sizes           | three badges. `Badge` has no size variants, so scale with classes: default, then `class="h-6 px-2.5 text-sm"` with `variant="warning"`, then `class="h-7 px-3 text-base"` with `variant="success"`                                                                                                                                                                                                                                                                                                                                                                                                   |
| Avatar / Group          | `<AvatarGroup>` with five `<Avatar size="lg"><AvatarImage :src="…" alt="…" /><AvatarFallback>…</AvatarFallback></Avatar>` and a sixth holding the `+2` label as an `AvatarFallback` with `class="bg-purple-600 text-white"` in place of the inline `background-color: #9c27b0`                                                                                                                                                                                                                                                                                                                       |
| Avatar / Label - Circle | three label avatars: `size="lg" class="size-12"` for the xlarge one, then `size="lg"` with `class="bg-sky-500 text-white"`, then default size with `class="bg-purple-600 text-white"`. Avatars are already circles, so `shape="circle"` is dropped                                                                                                                                                                                                                                                                                                                                                   |
| Avatar / Icon - Badge   | `<OverlayBadge value="4" severity="danger" class="inline-flex">` wrapping an `Avatar` with `class="size-12"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ScrollTop               | `<ScrollArea class="h-50 w-62.5 rounded-lg border border-border p-3">` holding the lorem paragraph and, as the last child inside the scroll viewport, `<ScrollTop target="parent" :threshold="100" :icon="IconArrowUp" />`. `ScrollTop` with `target="parent"` attaches `useScroll` to its own `parentElement`, so it must sit inside the element that actually scrolls. If the Reka scroll viewport is not that element, fall back to a plain `<div class="h-50 w-62.5 overflow-auto rounded-lg border border-border p-3">` for this card, report the exact failure and keep `ScrollArea` out of it |
| Tag / Default           | five `Badge` with `class="rounded-md"` so this group stays visually distinct from the pill group below it, variants per severity                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Tag / Pills             | the same five with no class override, since `Badge` is pill-shaped already                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Tag / Icons             | five `Badge` with an icon child: `IconUser`, `IconCheck`, `IconInfoCircle`, `IconExclamationTriangle` (fixing the upstream `con=` typo), `IconTimes`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Chip / Basic            | four `Chip`, the last `removable`. `Chip` emits `remove`; wire it to nothing visible, as the original did                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Chip / Icon             | four `Chip` with `:icon="IconApple"`, `:icon="IconFacebook"`, `:icon="IconGoogle"`, `:icon="IconMicrosoft"`, the last `removable`. Those four map to non-brand lucide glyphs, which Plan 1 recorded with a comment in the icon map; keep the labels                                                                                                                                                                                                                                                                                                                                                  |
| Chip / Image            | three `Chip` with `:image="…"` pointing at the same avatar URLs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Skeleton                | the shapes become classes: `<Skeleton class="size-16 rounded-full" />`, `<Skeleton class="mb-2 h-4 w-40" />`, `<Skeleton class="mb-2 h-4 w-20" />`, `<Skeleton class="h-2" />`, `<Skeleton class="h-37.5 w-full" />`, and two `<Skeleton class="h-8 w-16" />`. The wrapper's `rounded-border border border-surface p-6` becomes `rounded-lg border border-border p-6`                                                                                                                                                                                                                                |

- [ ] **Step 1: Rewrite `FileDoc.vue`**

- [ ] **Step 2: Commit FileDoc**

```
git add src/views/uikit/FileDoc.vue
```

then

```
git commit -m "feat: port FileDoc to the local FileUpload and toast shim"
```

- [ ] **Step 3: Rewrite `MiscDoc.vue`**

- [ ] **Step 4: Verify both pages**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, `bunx prettier --check src/views/uikit/FileDoc.vue src/views/uikit/MiscDoc.vue`.

- [ ] **Step 5: Commit MiscDoc**

```
git add src/views/uikit/MiscDoc.vue
```

then

```
git commit -m "feat: port MiscDoc to Badge, Avatar, Progress, ScrollArea and Skeleton"
```

---

### Task 6: `FormLayout` and the validated form

**Files:**

- Modify: `src/views/uikit/FormLayout.vue` (138 lines, rewritten and extended)

**Interfaces:**

- Consumes: `Input`, `Textarea`, `Select` family, `Button`, `Label` from `@/components/ui/...`; `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` from `@/components/ui/form`; `toTypedSchema` from `@vee-validate/zod`; `z` from `zod`; `QuillEditor` from `@/components/QuillEditor.vue`; `sanitizeHtml` from `@/utils/sanitize`.
- Produces: nothing other tasks consume.

Five existing sections keep their headings and grid markup: Vertical, Vertical Grid, Horizontal, Inline, Help Text, Advanced, plus the editor card. Spec section 5.11 adds one new section, Validation, on the registry `Form`.

Conversions:

- Drop the two `<Fluid>` wrappers; put their classes on plain divs and add `w-full` to the inputs that were stretched by `Fluid` (every `Input`, `Textarea` and `SelectTrigger` in this page).
- Every `InputText` becomes `Input` with `v-model` where one existed. The bare inputs in Vertical, Vertical Grid, Horizontal, Inline, Help Text and Advanced have no model today; give each a typed `ref<string>('')` so the page is honest, or leave them unbound and keep the `id`/`label` pairing. Prefer binding: `noUnusedLocals` will not complain because the template reads them.
- Every `<label for="…">` becomes `<Label for="…">` from `@/components/ui/label`.
- `Textarea` keeps `id`, `rows` and gains `w-full`; drop `:autoResize`.
- The state `Select` becomes the five-part vendored form. The options are objects, so bind the code and map back:

```vue
<Select v-model="dropdownItem">
    <SelectTrigger id="state" class="w-full"><SelectValue placeholder="Select One" /></SelectTrigger>
    <SelectContent>
        <SelectItem v-for="option in dropdownItems" :key="option.code" :value="option.code">{{ option.name }}</SelectItem>
    </SelectContent>
</Select>
```

with `const dropdownItem = ref<string | undefined>(undefined);` and `dropdownItems` typed `{ name: string; code: string }[]`.

- `Editor` becomes `QuillEditor`. Read `src/components/QuillEditor.vue` for its prop names before wiring it; `editorStyle="height: 320px"` becomes whatever height prop or class that component exposes. The `sanitizedEditorHtml` computed and the `v-html` render stay exactly as they are, including the comment above them: that is the project's documented rule. The `border-t border-surface` wrapper becomes `border-t border-border`.

The new Validation section, as its own card after the editor:

```vue
<script setup lang="ts">
    // vee-validate plus zod is the registry's own form stack; the schema is the single source of truth
    // for both the browser-side rules and the message text.
    const schema = toTypedSchema(
        z.object({
            email: z.string().email('Enter a valid email address'),
            password: z.string().min(8, 'Use at least 8 characters'),
            accept: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms' }) })
        })
    );

    function onSubmit(values: Record<string, unknown>): void {
        showToast({ severity: 'success', summary: 'Submitted', detail: String(values.email), life: 3000 });
    }
</script>
```

```vue
<div class="card flex flex-col gap-4">
    <div class="font-semibold text-xl">Validation</div>
    <Form v-slot="{ handleSubmit }" :validation-schema="schema" class="flex flex-col gap-4">
        <form class="flex flex-col gap-4" @submit="handleSubmit($event, onSubmit)">
            <FormField v-slot="{ componentField }" name="email">
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="you@example.com" class="w-full" v-bind="componentField" /></FormControl>
                    <FormDescription>We never share it.</FormDescription>
                    <FormMessage />
                </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="password">
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><PasswordInput v-bind="componentField" autocomplete="new-password" :feedback="false" /></FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
            <FormField v-slot="{ value, handleChange }" name="accept" type="checkbox">
                <FormItem class="flex flex-row items-center gap-2">
                    <FormControl><Checkbox :model-value="value" @update:model-value="handleChange" /></FormControl>
                    <FormLabel class="mb-0">I accept the terms</FormLabel>
                    <FormMessage />
                </FormItem>
            </FormField>
            <Button type="submit" class="self-start">Submit</Button>
        </form>
    </Form>
</div>
```

The exact `Form` and `FormField` slot shapes come from vee-validate 4.15, not from this plan: read `src/components/ui/form/index.ts`, `FormControl.vue` and `useFormField.ts` first, and if `handleSubmit` is not exposed the way the snippet assumes, use the shape those files imply and record the difference. The requirements that must hold are: three fields, zod messages rendered through `FormMessage`, nothing submitted while invalid, and a toast on a successful submit.

`PasswordInput` gained an `autocomplete` prop in Plan 3 precisely for this new-password case; use it.

- [ ] **Step 1: Rewrite the six existing sections**

- [ ] **Step 2: Add the Validation section**

- [ ] **Step 3: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, `bunx prettier --check src/views/uikit/FormLayout.vue`.

Confirm in the output that `vee-validate`, `@vee-validate/zod` and `zod` now resolve from a page, since this is their first use in the tree.

- [ ] **Step 4: Commit**

```
git add src/views/uikit/FormLayout.vue
```

then

```
git commit -m "feat: port FormLayout and add a validated form on vee-validate and zod"
```

---

### Task 7: `InputDoc`

**Files:**

- Modify: `src/views/uikit/InputDoc.vue` (248 lines, rewritten)

**Interfaces:**

- Consumes: `Input`, `Textarea`, `Label`, `Checkbox`, `Switch`, `Slider`, `RadioGroup`, `RadioGroupItem`, `NumberField` family, `InputGroup` family, `Select` family from `@/components/ui/...`; `AutoComplete`, `ColorPicker`, `DatePicker`, `FloatLabel`, `Knob`, `Listbox`, `MultiSelect`, `SelectButton`, `StarRating`, `ToggleButton`, `MaskedInput` from `@/components/...`; `TreeSelect` from `@/components/tree`; `CountryService` and `NodeService`; icons.
- Consumes from Task 2: `MaskedInput`.
- Produces: nothing other tasks consume.

This is the densest page: twenty-five PrimeVue components in 248 lines. Keep all three cards per column, every heading and the two-column `md:w-1/2` layout. Drop both `<Fluid>` wrappers and add `w-full` to the controls they stretched.

Script: add `lang="ts"`. Type the service results (`CountryService.getCountries()` resolves to `{ name: string; code: string }[]`; `NodeService.getTreeNodes()` resolves to the tree node shape `TreeNodeLike[]` from `@/components/tree`). Type every ref:

- `floatValue`, `inputValue`: `ref<string>('')`
- `selectedAutoValue`: `ref<unknown>(undefined)` (the local `AutoComplete` model is `unknown`), `autoValue` and `autoFilteredValue`: `ref<Country[]>([])`
- `calendarValue`: `ref<Date | null>(null)`
- `inputNumberValue`: `ref<number>(0)`
- `sliderValue`: `ref<number[]>([50])` (the vendored `Slider` model is an array, even for a single thumb) and a new `rangeValue`: `ref<number[]>([20, 80])` for the range example spec section 5.11 asks for
- `ratingValue`: `ref<number | null>(null)`
- `colorValue`: `ref<string>('#1976D2')`
- `radioValue`: `ref<string>('')`
- `checkboxValue`: `ref<string[]>([])`
- `switchValue`, `toggleValue`, `inputGroupValue`: `ref<boolean>(false)`
- `listboxValue`, `dropdownValue`: `ref<unknown>(undefined)`; `multiselectValue`: `ref<unknown[]>([])`
- `selectedNode`: `ref<TreeSelectionKeys | null>(null)` (from `@/components/tree`)
- `maskValue`: `ref<string>('')` for the new mask example
- `listboxValues`, `dropdownValues`, `multiselectValues`, `selectButtonValues`: typed literal arrays, unchanged values

`searchCountry(event: { query: string }): void` keeps its 250ms `setTimeout` body; the local `AutoComplete` emits `complete` with `{ query }`, so the signature matches.

Add one helper for the checkbox group, since the vendored `Checkbox` is boolean rather than array-valued:

```ts
function toggleCity(city: string, checked: boolean | 'indeterminate'): void {
    checkboxValue.value = checked === true ? [...checkboxValue.value, city] : checkboxValue.value.filter((name) => name !== city);
}
```

Section conversions:

| heading                  | conversion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| InputText                | three `Input`: default, `disabled`, and `aria-invalid="true"` for the invalid one                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Icons                    | two `InputGroup`: the first with `<InputGroupAddon><IconUser /></InputGroupAddon>` before an `InputGroupInput placeholder="Username"`, the second with `<InputGroupAddon align="inline-end"><IconSearch /></InputGroupAddon>` after an `InputGroupInput placeholder="Search"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Float Label              | `<FloatLabel><Input id="username" v-model="floatValue" class="w-full" /><label for="username">Username</label></FloatLabel>`. `FloatLabel` sets the one-space placeholder itself, so do not add one                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Textarea                 | `<Textarea v-model="inputValue" placeholder="Your Message" rows="3" class="w-full" />`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AutoComplete             | unchanged props: `v-model`, `:suggestions`, `option-label="name"`, `placeholder="Search"`, `dropdown`, `multiple`, `display="chip"`, `@complete="searchCountry($event)"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| DatePicker               | `<DatePicker v-model="calendarValue" show-icon show-button-bar class="w-full" />`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| InputNumber              | the five-part `NumberField`: `<NumberField v-model="inputNumberValue" class="w-full"><NumberFieldContent><NumberFieldDecrement /><NumberFieldInput /><NumberFieldIncrement /></NumberFieldContent></NumberField>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| (new) Mask               | a card section headed `Mask` with `<MaskedInput v-model="maskValue" mask="(999) 999-9999" class="w-full" />`, placed after InputNumber. Spec section 5.11 names this; Task 2 built the component                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Slider                   | `<Input v-model.number="sliderValue[0]" class="w-full" />` above `<Slider v-model="sliderValue" />`, then a second labelled `Range` with `<Slider v-model="rangeValue" :min="0" :max="100" />` and a `text-muted-foreground text-sm` readout of both ends                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Rating                   | `<StarRating v-model="ratingValue" />`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ColorPicker              | `<ColorPicker v-model="colorValue" />`; drop the `style="width: 2rem"`, the component sizes itself                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Knob                     | `<Knob v-model="knobValue" :step="10" :min="-50" :max="50" value-template="{value}%" />` with `knobValue` typed `ref<number>(50)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| RadioButton              | one `RadioGroup v-model="radioValue" class="flex flex-col md:flex-row gap-4"` holding three `<div class="flex items-center gap-2"><RadioGroupItem id="option1" value="Chicago" /><Label for="option1">Chicago</Label></div>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Checkbox                 | three `<div class="flex items-center gap-2"><Checkbox id="checkOption1" :model-value="checkboxValue.includes('Chicago')" @update:model-value="toggleCity('Chicago', $event)" /><Label for="checkOption1">Chicago</Label></div>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ToggleSwitch             | `<Switch v-model="switchValue" />`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Listbox                  | `<Listbox v-model="listboxValue" :options="listboxValues" option-label="name" filter />`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Select                   | the five-part vendored `Select`, keyed on `code` with the name as the item text and `placeholder="Select"` on `SelectValue`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| MultiSelect              | keep both slots. The `value` slot renders one span per selected option with the flag class and the name; the `option` slot renders the flag plus the name. The flag classes (`flag flag-au`) come from `src/assets/demo/flags/flags.css` and stay. Inside the `value` slot, `bg-primary text-primary-contrast rounded-border` becomes `bg-primary text-primary-foreground rounded-lg`                                                                                                                                                                                                                                                                                                                                                                               |
| TreeSelect               | `<TreeSelect v-model="selectedNode" :options="treeSelectNodes" placeholder="Select Item" />`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ToggleButton             | `<ToggleButton v-model="toggleValue" on-label="Yes" off-label="No" class="w-40" />`, replacing the inline `width: 10em`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| SelectButton             | `<SelectButton v-model="selectButtonValue" :options="selectButtonValues" option-label="name" />`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| InputGroup (bottom card) | four groups. (1) addon `IconUser` plus `InputGroupInput placeholder="Username"`. (2) two leading addons (`IconClock`, `<IconStar class="fill-current" />`), an `InputGroupInput type="number" placeholder="Price"`, then two trailing `InputGroupText` addons `$` and `.00`. A full `NumberField` cannot sit inside an `InputGroup`, which expects `InputGroupInput`; a number-typed group input is the faithful rendering and the standalone InputNumber section above shows the real component. (3) a `Button` addon labelled `Search` before an `InputGroupInput placeholder="Keyword"`, using `InputGroupButton` if it suits the markup better. (4) an addon holding `<Checkbox v-model="inputGroupValue" />` before an `InputGroupInput placeholder="Confirm"` |

- [ ] **Step 1: Read the current file and the local component props you are about to bind**

Read `src/components/AutoComplete.vue`, `MultiSelect.vue`, `Listbox.vue`, `DatePicker.vue`, `Knob.vue`, `ColorPicker.vue`, `FloatLabel.vue`, `SelectButton.vue`, `ToggleButton.vue`, `StarRating.vue` and `src/components/tree/TreeSelect.vue` prop blocks before writing the template. Their props were kept PrimeVue-shaped, but `ColorPicker` has no `style` prop and `Knob` uses `valueTemplate`, not `template`.

- [ ] **Step 2: Rewrite the script block**

- [ ] **Step 3: Rewrite the template section by section**

- [ ] **Step 4: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, `bunx prettier --check src/views/uikit/InputDoc.vue`.

- [ ] **Step 5: Commit**

```
git add src/views/uikit/InputDoc.vue
```

then

```
git commit -m "feat: port InputDoc to the shadcn input set and add the mask and range examples"
```

---

### Task 8: `ListDoc`

**Files:**

- Modify: `src/views/uikit/ListDoc.vue` (163 lines, rewritten)

**Interfaces:**

- Consumes: `DataView` from `@/components/DataView.vue`, `OrderList` and `PickList` from `@/components/list`, `SelectButton` from `@/components/SelectButton.vue`, `Badge`, `Button`, `ProductService`, icons.
- Produces: nothing other tasks consume.

Script: add `lang="ts"`. Type `products`, `picklistProducts` and `orderlistProducts` against the service's product shape (import the type from `@/service/types` if one is exported there; otherwise define a local `interface ListProduct` with the fields the template reads: `id`, `name`, `image`, `category`, `price`, `rating`, `inventoryStatus`). `PickList`'s model is a two-element tuple, so type it `ref<[ListProduct[], ListProduct[]]>([[], []])`. `layout` is `ref<'list' | 'grid'>('list')` and `options` is `ref<('list' | 'grid')[]>(['list', 'grid'])`.

`getSeverity` returns a Badge variant, so retype it:

```ts
function statusVariant(status: string): BadgeVariants['variant'] {
    if (status === 'INSTOCK') return 'success';
    if (status === 'LOWSTOCK') return 'warning';
    if (status === 'OUTOFSTOCK') return 'destructive';
    return 'default';
}
```

`PrimeVue`'s version returned `'warning'` for LOWSTOCK and `null` otherwise; `BadgeVariants['variant']` has no null, so `default` is the fallback.

Conversions:

- `DataView` keeps `:value="products"` and `:layout="layout"`. The `#header`, `#list` and `#grid` slots keep their names and their `slotProps.items` shape.
- The layout switch keeps `SelectButton` with `:allow-empty="false"` and the `option` slot, the icons becoming `<IconBars v-if="option === 'list'" />` and `<IconTable v-else />`. Check the icon map for the exact export names behind `pi-bars` and `pi-table` before writing them.
- Every `Tag` becomes `<Badge :variant="statusVariant(item.inventoryStatus)" class="absolute left-1 top-1">{{ item.inventoryStatus }}</Badge>`, replacing both the inline `style="left: 4px; top: 4px"` and the `dark:bg-surface-900!` override.
- The rating pill: `bg-surface-100` becomes `bg-muted`, the inner `bg-surface-0` becomes `bg-card`, `text-surface-900` becomes `text-foreground`, the `border-radius: 30px` inline styles become `rounded-full`, and the two-line `box-shadow` inline style becomes `shadow-sm`. The star is `<IconStar class="size-4 fill-current text-yellow-500" />`.
- Card borders: `border-surface-200 dark:border-surface-700` becomes `border-border`; `bg-surface-0 dark:bg-surface-900` becomes `bg-card`; `bg-surface-50` becomes `bg-muted`; `text-surface-500 dark:text-surface-400` becomes `text-muted-foreground`; `border-t border-surface` becomes `border-t border-border`.
- The two action buttons become `<Button size="icon" variant="outline"><IconHeart /></Button>` and `<Button :disabled="item.inventoryStatus === 'OUTOFSTOCK'" class="flex-auto whitespace-nowrap md:flex-initial"><IconShoppingCart />Buy Now</Button>`.
- `text-xxl` in the grid template is not a Tailwind class and never rendered; use `text-xl` to match the list branch.
- `PickList` keeps `v-model` and `data-key="id"` and its `option` slot; drop `breakpoint`. `OrderList` keeps `v-model` and `data-key="id"` and its `option` slot; drop `breakpoint` and `pt:pcList:root`.

- [ ] **Step 1: Rewrite the script block**

- [ ] **Step 2: Rewrite the template**

- [ ] **Step 3: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, `bunx prettier --check src/views/uikit/ListDoc.vue`.

- [ ] **Step 4: Commit**

```
git add src/views/uikit/ListDoc.vue
```

then

```
git commit -m "feat: port ListDoc to DataView, OrderList and PickList"
```

---

### Task 9: `MediaDoc`

**Files:**

- Modify: `src/views/uikit/MediaDoc.vue` (109 lines, rewritten)

**Interfaces:**

- Consumes: `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext` from `@/components/ui/carousel`; `Galleria` and `type GalleriaItem` from `@/components/Galleria.vue`; `ImagePreview` from `@/components/ImagePreview.vue`; `Badge`, `Button`; `ProductService`, `PhotoService`; icons.
- Produces: nothing other tasks consume.

Script: add `lang="ts"`. Type `products` against the product shape and `images` as `ref<GalleriaItem[]>([])`. Keep `galleriaResponsiveOptions` typed `{ breakpoint: string; numVisible: number }[]`, which is exactly what the local `Galleria` takes. Delete `carouselResponsiveOptions`: the vendored `Carousel` has no responsive-options prop and the same effect comes from basis classes on the item. Retype `getSeverity` to return a Badge variant as in Task 8.

Conversions:

| card     | conversion                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Carousel | `<Carousel :opts="{ align: 'start' }" class="w-full">` wrapping `<CarouselContent>` with one `<CarouselItem v-for="product in products" :key="product.id" class="basis-full sm:basis-1/2 lg:basis-1/3">` per product, then `<CarouselPrevious />` and `<CarouselNext />`. The old `#item` slot body moves inside `CarouselItem` with `slotProps.data` becoming `product`. `numVisible="3"` and `numScroll="3"` are the basis classes; the carousel scrolls by whatever fits |
| Image    | `<ImagePreview src="https://primefaces.org/cdn/primevue/images/galleria/galleria10.jpg" alt="Image" width="250" />`                                                                                                                                                                                                                                                                                                                                                         |
| Galleria | `<Galleria :value="images" :responsive-options="galleriaResponsiveOptions" :num-visible="5" container-style="max-width: 640px">` keeping both the `item` and `thumbnail` slots unchanged                                                                                                                                                                                                                                                                                    |

Inside the carousel item: `border border-surface-200 dark:border-surface-700 rounded` becomes `border border-border rounded-lg`; the badge wrapper's `dark:bg-surface-900 absolute rounded-border` becomes `absolute left-1 top-1`, with the `Badge` carrying the variant; the two buttons become `<Button variant="outline" size="icon"><IconHeart /></Button>` and `<Button size="icon"><IconShoppingCart /></Button>`, dropping the `ml-2` in favour of a `gap-2` on their wrapper.

The vendored `Carousel` needs an `IntersectionObserver`, which `src/test/setup.ts` already stubs for the `Galleria` tests; nothing to add here.

- [ ] **Step 1: Rewrite the script block**

- [ ] **Step 2: Rewrite the template**

- [ ] **Step 3: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, `bunx prettier --check src/views/uikit/MediaDoc.vue`.

- [ ] **Step 4: Commit**

```
git add src/views/uikit/MediaDoc.vue
```

then

```
git commit -m "feat: port MediaDoc to the vendored Carousel, Galleria and ImagePreview"
```

---

### Task 10: `MenuDoc`

**Files:**

- Modify: `src/views/uikit/MenuDoc.vue` (514 lines, rewritten)

**Interfaces:**

- Consumes from `@/components/menu`: `AppBreadcrumb`, `AppContextMenu`, `AppMegaMenu`, `AppMenubar`, `AppSteps`, `MenuList`, `PanelMenu`, `TieredMenu`, `type MenuModelItem`, `type MegaMenuItem`.
- Consumes: `Tabs`, `TabsList`, `TabsTrigger` from `@/components/ui/tabs`; `InputGroup`, `InputGroupAddon`, `InputGroupInput`; `Button`; icons.
- Produces: nothing other tasks consume.

The page is six cards of menu models. Nothing here needs new behaviour: Plan 3 built every wrapper to this page's shape. The work is retyping seven models and swapping eight tags.

Script: add `lang="ts"`. Delete both template refs (`menu`, `contextMenu`) and both functions (`toggleMenu`, `onContextRightClick`): the replacements are declarative. Type each model and replace every `icon: 'pi pi-fw pi-x'` string with the mapped component:

| model              | type              | contents                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nestedMenuitems`  | `MenuModelItem[]` | five roots: Customers (`IconTable`) with New (`IconUserPlus`) holding Customer (`IconPlus`) and Duplicate (`IconCopy`), and Edit (`IconUserEdit`); Orders (`IconShoppingCart`) with View (`IconList`) and Search (`IconSearch`); Shipments (`IconEnvelope`) with Tracker (`IconCompass`), Map (`IconMapMarker`), Manage (`IconPencil`); Profile (`IconUser`) with Settings (`IconCog`), Billing (`IconFile`); Quit (`IconSignOut`) |
| `breadcrumbHome`   | `MenuModelItem`   | `{ icon: IconHome, to: '/' }`                                                                                                                                                                                                                                                                                                                                                                                                      |
| `breadcrumbItems`  | `MenuModelItem[]` | Computer, Notebook, Accessories, Backpacks, Item                                                                                                                                                                                                                                                                                                                                                                                   |
| `tieredMenuItems`  | `MenuModelItem[]` | the same four roots as `nestedMenuitems`, then `{ separator: true }`, then Quit (`IconSignOut`)                                                                                                                                                                                                                                                                                                                                    |
| `overlayMenuItems` | `MenuModelItem[]` | Save (`IconSave`), Update (`IconRefresh`), Delete (`IconTrash`), `{ separator: true }`, Home (`IconHome`)                                                                                                                                                                                                                                                                                                                          |
| `menuitems`        | `MenuModelItem[]` | Customers (no icon) with New (`IconPlus`) and Edit (`IconUserEdit`); Orders (no icon) with View (`IconList`) and Search (`IconSearch`)                                                                                                                                                                                                                                                                                             |
| `contextMenuItems` | `MenuModelItem[]` | Save (`IconSave`), Update (`IconRefresh`), Delete (`IconTrash`), `{ separator: true }`, Options (`IconCog`)                                                                                                                                                                                                                                                                                                                        |
| `megamenuItems`    | `MegaMenuItem[]`  | four roots, `items` being an array of columns and each column an array of groups: Fashion (`IconTag`), Electronics (`IconDesktop`), Furniture (`IconImage`), Sports (`IconStar`). Keep every label verbatim, including `Sports.7`, `Sports.7.1` and `Sports.7.2`                                                                                                                                                                   |
| `panelMenuitems`   | `MenuModelItem[]` | the first four roots of `nestedMenuitems` with no Quit                                                                                                                                                                                                                                                                                                                                                                             |
| `stepItems` (new)  | `MenuModelItem[]` | `[{ label: 'Header I' }, { label: 'Header II' }, { label: 'Header III' }]`, the model `AppSteps` needs                                                                                                                                                                                                                                                                                                                             |
| `activeStep` (new) | `ref<number>(0)`  | `AppSteps` is 0-based; the PrimeVue `Stepper value="1"` was 1-based and selected the first step                                                                                                                                                                                                                                                                                                                                    |

Card conversions:

| heading              | conversion                                                                                                                                                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Menubar              | `<AppMenubar :model="nestedMenuitems">` with the `end` slot holding `<InputGroup class="w-56"><InputGroupAddon><IconSearch /></InputGroupAddon><InputGroupInput placeholder="Search" /></InputGroup>`                                                                                                                  |
| Breadcrumb           | `<AppBreadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />`                                                                                                                                                                                                                                                    |
| Steps                | `<AppSteps :model="stepItems" v-model:active-step="activeStep" :readonly="false" />`. The PrimeVue demo was read-only by default; making it interactive matches `AppSteps`'s own default of `readonly: true` only if you pass nothing, so pass `:readonly="false"` to show the behaviour and keep the demo useful      |
| TabMenu              | `<Tabs default-value="0"><TabsList><TabsTrigger value="0">Header I</TabsTrigger>…</TabsList></Tabs>` with no `TabsContent`: the original has no panels either                                                                                                                                                          |
| Tiered Menu          | `<TieredMenu :model="tieredMenuItems" />`                                                                                                                                                                                                                                                                              |
| Plain Menu           | `<MenuList :model="menuitems" />`                                                                                                                                                                                                                                                                                      |
| Overlay Menu         | `<MenuList :model="overlayMenuItems" popup><template #trigger><Button variant="outline">Options<IconAngleDown /></Button></template></MenuList>`. The button moves inside the slot; drop `style="width: auto"`                                                                                                         |
| Context Menu         | `<AppContextMenu :model="contextMenuItems"><div class="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">Right click to display.</div></AppContextMenu>`. The default slot is the right-click target, so the `@contextmenu` handler on the card div goes away |
| MegaMenu, Horizontal | `<AppMegaMenu :model="megamenuItems" />`                                                                                                                                                                                                                                                                               |
| MegaMenu, Vertical   | `<AppMegaMenu :model="megamenuItems" orientation="vertical" />`                                                                                                                                                                                                                                                        |
| PanelMenu            | `<PanelMenu :model="panelMenuitems" />`                                                                                                                                                                                                                                                                                |

Keep every card wrapper, every heading and the `md:w-1/2`, `md:w-1/3`, `mt-6` and `mt-8` layout classes.

- [ ] **Step 1: Rewrite the script block, one model at a time**

Check each icon name against `src/components/icons.ts` as you write it. Every glyph this page uses is in the map.

- [ ] **Step 2: Rewrite the template**

- [ ] **Step 3: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, `bunx prettier --check src/views/uikit/MenuDoc.vue`.

Pay attention to the test run: `src/components/menu/*.test.ts` covers these wrappers, and a break there means the page is using them in a way the components do not support.

- [ ] **Step 4: Commit**

```
git add src/views/uikit/MenuDoc.vue
```

then

```
git commit -m "feat: port MenuDoc to the model-driven menu wrappers"
```

---

### Task 11: `OverlayDoc`

**Files:**

- Modify: `src/views/uikit/OverlayDoc.vue` (186 lines, rewritten)

**Interfaces:**

- Consumes: `Dialog` family, `Sheet` family, `Popover` family, `Tooltip` family, `Input`, `Button` from `@/components/ui/...`; `createColumns` and `DataTable` from `@/components/data-table`; `useConfirm` from `@/composables/useConfirm`; `useToast` from `@/composables/useToast`; `ProductService`; `formatCurrency` from `@/utils/currency`; icons.
- Consumes from Task 1: the `TooltipProvider` in `App.vue`, without which every `Tooltip` on this page throws.
- Produces: nothing other tasks consume.

Script: add `lang="ts"`. Keep `display`, `displayConfirmation` and the five drawer flags as `ref<boolean>(false)`. Delete `op`, `popup` and `toggleDataTable`: the popover is declarative now. Type `products` as `ref<Row[]>([])` with `type Row = Product & Record<string, unknown>`, matching `Crud.vue`. Add `const popoverOpen = ref(false);` for the popover.

Conversions:

| heading       | conversion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dialog        | `<Dialog v-model:open="display">` with a `DialogTrigger as-child` holding the Show button, and a `DialogContent class="sm:max-w-[30rem]"` holding `DialogHeader` with `DialogTitle` `Dialog`, a `DialogDescription class="sr-only"` naming the dialog for assistive tech, the lorem paragraph, and a `DialogFooter` with the Save button calling `close`. The `:breakpoints` and `:style` props go: a max-width class covers both                                                                                                             |
| Popover       | `<Popover v-model:open="popoverOpen">` with `PopoverTrigger as-child` holding the Show button and `<PopoverContent class="w-[28rem] p-0">` holding the `DataTable`. The table is `<DataTable :columns="columns" :data="products" row-key="id" paginator :page-size="5" @row-click="onProductSelect" />`. PrimeVue's `selectionMode="single"` plus `@row-select` becomes the wrapper's `row-click` emit, which carries the row object: `onProductSelect(row: Row)` closes the popover and raises the toast with `row.name`                     |
| Tooltip       | two `Tooltip` blocks, each `<Tooltip><TooltipTrigger as-child><Input placeholder="Username" /></TooltipTrigger><TooltipContent>Your username</TooltipContent></Tooltip>`, the second wrapping the Save button                                                                                                                                                                                                                                                                                                                                 |
| Drawer        | five `Sheet` components, each `v-model:open` on its own flag, with `SheetContent :side="…"` and a `SheetHeader` holding `SheetTitle` `Drawer` plus the lorem paragraph. Sides are `left`, `right`, `top`, `bottom`, and for the old `position="full"` use `side="right"` with `class="w-screen max-w-none"`. The five trigger buttons keep their icons (`IconArrowRight`, `IconArrowLeft`, `IconArrowDown`, `IconArrowUp`, `IconExternalLink`) as `size="icon"` buttons in a `flex gap-2` wrapper, replacing the inline `margin-right` styles |
| ConfirmPopup  | drop the `<ConfirmPopup />` tag; `ConfirmDialogHost` is already mounted in `App.vue`. The button keeps `@click="confirm($event)"` and gains `<IconCheck />Confirm`                                                                                                                                                                                                                                                                                                                                                                            |
| ConfirmDialog | `<Dialog v-model:open="displayConfirmation">` with `DialogContent class="sm:max-w-[22rem]"`, a `DialogTitle` `Confirmation`, a `DialogDescription` holding the question text, `<IconExclamationTriangle class="size-8" />` beside it, and a `DialogFooter` with a ghost `No` and a destructive-outline `Yes`, both calling `closeConfirmation`                                                                                                                                                                                                |

The `confirm` function becomes:

```ts
function confirm(event: MouseEvent): void {
    // currentTarget is captured now: it is null by the time the popover renders.
    const target = event.currentTarget as HTMLElement;
    confirmPopup.require({
        target,
        message: 'Are you sure you want to proceed?',
        icon: IconExclamationTriangle,
        acceptLabel: 'Save',
        rejectLabel: 'Cancel',
        rejectVariant: 'outline',
        accept: () => toast.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 }),
        reject: () => toast.add({ severity: 'info', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
    });
}
```

The popover's table needs three columns built with `createColumns<Row>()`: a `name` accessor headed `Name`, an `image` display column rendering the product image at `width: 64` as `Crud.vue` does, and a `price` accessor headed `Price` whose cell is `formatCurrency(ctx.getValue())`. PrimeVue had `sortable` on name and price; pass nothing, because the wrapper sorts every accessor column by default. Check that in `src/components/data-table/DataTable.vue` before relying on it, and if sorting is opt-in, set it explicitly.

- [ ] **Step 1: Rewrite the script block**

- [ ] **Step 2: Rewrite the template, card by card**

- [ ] **Step 3: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, `bunx prettier --check src/views/uikit/OverlayDoc.vue`.

- [ ] **Step 4: Commit**

```
git add src/views/uikit/OverlayDoc.vue
```

then

```
git commit -m "feat: port OverlayDoc to Dialog, Sheet, Popover, Tooltip and ConfirmPopover"
```

---

### Task 12: `PanelsDoc`

**Files:**

- Modify: `src/views/uikit/PanelsDoc.vue` (216 lines, rewritten)

**Interfaces:**

- Consumes: `Accordion` family, `Tabs` family, `Card` family, `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`, `InputGroup` family, `Button` from `@/components/ui/...`; `Toolbar` from `@/components/Toolbar.vue`; `Panel` from `@/components/Panel.vue`; `Fieldset` from `@/components/Fieldset.vue`; `Divider` from `@/components/Divider.vue`; `SplitButton` from `@/components/SplitButton.vue`; `MenuList` and `type MenuModelItem` from `@/components/menu`; icons.
- Produces: nothing other tasks consume.

Script: add `lang="ts"`. Type `items` and `cardMenu` as `MenuModelItem[]` with component icons (`IconCheck`, `IconUpload`, `IconTrash`, `IconHome` for `items`; `IconCheck`, `IconRefresh`, `IconTrash` for `cardMenu`). Delete `menuRef` and `toggle`: the popup menu is declarative, and the current `toggle()` body reads the global `event`, which is a latent bug.

Conversions:

| heading   | conversion                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toolbar   | `<Toolbar>` keeps its `start`, `center` and `end` slots. Start holds three ghost icon buttons (`IconPlus`, `IconPrint`, `IconUpload`) with `variant="ghost" size="icon"`, dropping the `mr-2` since the slot is a `flex gap-2`. Center holds `<InputGroup><InputGroupAddon><IconSearch /></InputGroupAddon><InputGroupInput placeholder="Search" /></InputGroup>`. End holds `<SplitButton label="Save" :model="items" />`                                                                                                                                                                                                                                 |
| Accordion | `<Accordion type="single" default-value="0" collapsible>` with three `<AccordionItem value="0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 1   | 2">`, each `<AccordionTrigger>Header I</AccordionTrigger>`plus`<AccordionContent>`holding its paragraph. Drop`class="m-0"`on the paragraphs;`AccordionContent` already spaces them |
| Tabs      | `<Tabs default-value="0">` with `<TabsList>` of three `TabsTrigger` and three `<TabsContent value="…">` holding the paragraphs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Panel     | `<Panel header="Header" toggleable>` with the paragraph in the default slot                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Fieldset  | `<Fieldset legend="Legend" toggleable>` with the paragraph in the default slot                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Card      | `<Card>` with `<CardHeader>` holding a `flex items-center justify-between` row: `<CardTitle>Card</CardTitle>` and a `MenuList` in popup mode whose `trigger` slot is `<Button variant="ghost" size="icon"><IconPlus /></Button>`, bound to `cardMenu`. `<CardContent>` holds the paragraph                                                                                                                                                                                                                                                                                                                                                                 |
| Divider   | the two-column login panel. `Divider layout="vertical" class="hidden! md:flex!"` and `Divider layout="horizontal" align="center" class="flex! md:hidden!"` keep their props; the local `Divider` takes `layout`, `align` and `type`. The two `InputText` become `Input` with `w-full`, their `label` elements become `Label`, and the password field becomes `<Input id="password" type="password" class="w-full" />`. The two buttons keep their icons (`IconUser`, `IconUserPlus`) and the `w-full max-w-[17.35rem] mx-auto` class; the Sign Up button becomes `variant="success"`                                                                       |
| Splitter  | `<ResizablePanelGroup direction="horizontal" class="h-75 rounded-lg border border-border">` with `<ResizablePanel :default-size="30" :min-size="10">`, a `<ResizableHandle with-handle />`, then `<ResizablePanel :default-size="70">` containing a nested `<ResizablePanelGroup direction="vertical">` of two panels (`:default-size="15"` and `:default-size="50"`) separated by another `ResizableHandle`. Each panel body is `<div class="flex h-full items-center justify-center">Panel N</div>`: the original wrote `className`, a React-ism that rendered nothing, so this fixes three dead attributes. Replace `style="height: 300px"` with `h-75` |

Keep the outer `flex flex-col`, the `md:w-1/2` columns, the `mt-6 md:mt-0` and `mt-8` spacing and every heading.

- [ ] **Step 1: Rewrite the script block**

- [ ] **Step 2: Rewrite the template, card by card**

- [ ] **Step 3: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, `bunx prettier --check src/views/uikit/PanelsDoc.vue`.

- [ ] **Step 4: Commit**

```
git add src/views/uikit/PanelsDoc.vue
```

then

```
git commit -m "feat: port PanelsDoc to Accordion, Tabs, Card, Resizable and the local panels"
```

---

### Task 13: `TableDoc`

**Files:**

- Modify: `src/views/uikit/TableDoc.vue` (394 lines, rewritten)

**Interfaces:**

- Consumes: `createColumns`, `DataTable`, `type DataTableColumnMeta` from `@/components/data-table`; `Badge`, `Button`, `Checkbox`, `Progress`, `Slider`, `Select` family from `@/components/ui/...`; `DatePicker`, `MultiSelect`, `StarRating`, `ToggleButton` from `@/components/...`; `formatCurrency` from `@/utils/currency` (Task 1); `formatDate` from `@/utils/dateFormat`; `CustomerService`, `ProductService`; `type Customer`, `type Product`, `type ProductOrder` from `@/service/types`; icons.
- Produces: nothing other tasks consume.

This is the page the `DataTable` wrapper was built for. Four cards, each one wrapper instance, plus a nested instance inside the expansion slot. The `@primevue/core/api` import goes: match modes live in the column meta now.

Script: add `lang="ts"`, drop the `FilterMatchMode`/`FilterOperator` import, and delete the local `formatCurrency` in favour of `@/utils/currency`. Keep `formatDate` but point it at the shared util: `src/utils/dateFormat.ts` exports `formatDate(date, pattern)` using PrimeVue patterns, so `formatDate(value, 'mm/dd/yy')` reproduces the current `toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })` output. Verify that against the util's tests before relying on it; if the pattern differs, keep a local two-line formatter and say so.

Rows: `type CustomerRow = Customer & Record<string, unknown>` and `type ProductRow = Product & Record<string, unknown>`.

Keep `statuses` and `representatives` as plain arrays (`reactive` buys nothing for literals). Retype the three severity helpers to return `BadgeVariants['variant']`, each with a `default` branch:

```ts
function statusVariant(status: string): BadgeVariants['variant'] {
    if (status === 'unqualified') return 'destructive';
    if (status === 'qualified') return 'success';
    if (status === 'new') return 'info';
    if (status === 'negotiation') return 'warning';
    return 'default';
}
```

`getOrderSeverity` and `getStockSeverity` follow the same shape. The upstream `getSeverity` had no branch for `proposal` and returned `null` for `renewal`; both now land on `default`.

#### Card 1, Filtering

One `DataTable` with `paginator`, `:page-size="10"`, `row-key="id"`, `row-hover`, `show-gridlines`, `:loading="loading1"`, `v-model:global-filter="globalFilter"` and `:global-filter-fields="['name', 'country', 'representative', 'balance', 'status']"`. The wrapper's global filter matches on column ids, so use the column ids you define rather than PrimeVue's dotted paths.

Columns, built with `createColumns<CustomerRow>()`. Each filterable column carries `meta` typed `DataTableColumnMeta`:

| id                                                              | header   | cell                                                                                                           | meta                                                                                                  |
| --------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `name` (accessor)                                               | Name     | plain value                                                                                                    | `{ filter: { type: 'text', placeholder: 'Search by name' } }`                                         |
| `country` (accessor on `row => row.country.name`)               | Country  | flag `img` plus the name, exactly the current markup with `class="flag flag-xx"` from the row's `country.code` | `{ filter: { type: 'text', placeholder: 'Search by country' } }`                                      |
| `representative` (accessor on `row => row.representative.name`) | Agent    | avatar `img` at `width: 32` plus the name                                                                      | `{ filter: { type: 'custom', matchModes: ['in'], showMatchModes: false } }`                           |
| `date` (accessor)                                               | Date     | `formatDate(new Date(value), 'mm/dd/yy')`                                                                      | `{ filter: { type: 'date' } }`                                                                        |
| `balance` (accessor)                                            | Balance  | `formatCurrency(value)`                                                                                        | `{ filter: { type: 'numeric' } }`                                                                     |
| `status` (accessor)                                             | Status   | a `Badge` with `statusVariant`                                                                                 | `{ filter: { type: 'custom', matchModes: ['equals'], showMatchModes: false } }`                       |
| `activity` (accessor)                                           | Activity | `<Progress>` at `class="h-1.5"`                                                                                | `{ filter: { type: 'custom', matchModes: ['between'], showMatchModes: false } }`                      |
| `verified` (accessor)                                           | Verified | `IconCheckCircle` in `text-green-500` or `IconTimesCircle` in `text-red-500`                                   | `{ filter: { type: 'custom', matchModes: ['equals'], showMatchModes: false }, class: 'text-center' }` |

The four `custom` filters use the wrapper's per-column filter slot, named `filter-<columnId>`. Each slot receives `{ value, setValue, matchMode, setMatchMode, apply, clear }` from `DataTableFilterMenu`; read that component before writing the slots. The four bodies:

```vue
<template #filter-representative="{ value, setValue }">
    <MultiSelect :model-value="(value as unknown[]) ?? []" :options="representatives" option-label="name" placeholder="Any" @update:model-value="setValue" />
</template>
<template #filter-status="{ value, setValue }">
    <Select :model-value="(value as string) ?? ''" @update:model-value="setValue">
        <SelectTrigger class="w-full"><SelectValue placeholder="Select One" /></SelectTrigger>
        <SelectContent>
            <SelectItem v-for="status in statuses" :key="status" :value="status">{{ status }}</SelectItem>
        </SelectContent>
    </Select>
</template>
<template #filter-activity="{ value, setValue }">
    <div class="flex flex-col gap-2">
        <Slider :model-value="(value as number[]) ?? [0, 100]" :min="0" :max="100" @update:model-value="setValue" />
        <div class="flex justify-between text-sm text-muted-foreground">
            <span>{{ ((value as number[]) ?? [0, 100])[0] }}</span>
            <span>{{ ((value as number[]) ?? [0, 100])[1] }}</span>
        </div>
    </div>
</template>
<template #filter-verified="{ value, setValue }">
    <div class="flex items-center gap-2">
        <Checkbox id="verified-filter" :model-value="value === true" @update:model-value="setValue" />
        <Label for="verified-filter">Verified</Label>
    </div>
</template>
```

The `date` filter uses the built-in `date` type, so the menu renders its own control; if the menu has no date input yet, give `date` a `custom` filter with a `filter-date` slot holding `<DatePicker :model-value="(value as Date) ?? null" @update:model-value="setValue" />` and say which branch you took.

Header slot: a `flex justify-between` row with `<Button variant="outline" @click="clearFilters"><IconFilterSlash />Clear</Button>` and the global search `InputGroup`. `clearFilter()` does not exist upstream; define it here against the wrapper's exposed method:

```ts
const table = ref<{ clearFilters: () => void } | null>(null);

function clearFilters(): void {
    table.value?.clearFilters();
}
```

and put `ref="table"` on the Filtering `DataTable`. Keep the `empty` and `loading` slots with their text.

`loading1` becomes `ref<boolean>(true)` and is set to `false` once the data resolves, which is what the current `ref(null)` was trying to express.

#### Card 2, Frozen Columns

A `ToggleButton v-model="balanceFrozen" on-label="Balance" off-label="Balance" :on-icon="IconLock" :off-icon="IconLockOpen"` above a `DataTable` with `scroll-height="400px"`, `row-key="id"` and `class="mt-6"`.

The frozen state is dynamic, so the columns must be a `computed`, not a constant: the wrapper derives pinning from column meta on every read of the columns array.

```ts
const frozenColumns = computed(() =>
    helper.columns([
        helper.accessor('name', { id: 'frozenName', header: 'Name', meta: { frozen: 'left', class: 'font-bold', headerClass: 'font-bold' } }),
        // the nine remaining columns, with the balance column's meta switching on balanceFrozen
        helper.accessor('balance', { header: 'Balance', cell: (ctx) => formatCurrency(ctx.getValue()), meta: balanceFrozen.value ? { frozen: 'right', class: 'font-bold' } : { class: 'font-bold' } })
    ])
);
```

Column order and headers are unchanged from the inventory: a frozen `Name`, then `Id`, `Name` again, `Country` (on `country.name`), `Date` (raw), `Company`, `Status` (raw text), `Activity` (raw number), `Representative` (on `representative.name`), and the `Balance` column. The duplicate `Name` needs a distinct `id`, since TanStack keys columns by id. `style="min-width: 200px"` becomes `meta.class` with `min-w-50`, or a `size` on the column: the wrapper already uses `column.getSize()` for pinned offsets, so prefer `size: 200`.

The old `<style scoped lang="scss">` block targeting `.p-datatable-frozen-tbody` and `.p-frozen-column` goes: the bold styling now comes from the column meta classes above.

#### Card 3, Row Expansion

A `DataTable` with `row-key="id"`, `expandable` and `:data="products"`, plus the header slot's two ghost buttons wired to the wrapper's exposed `expandAll` and `collapseAll` through a second template ref. Columns: `name`, an `image` display column, `price` through `formatCurrency`, `category`, `rating` through `StarRating` with `readonly`, and an `inventoryStatus` column rendering a `Badge`. The wrapper renders its own expander control on the first column when `expandable` is set, so the empty expander column is dropped.

The `expansion` slot receives `{ row }` and holds the nested table:

```vue
<template #expansion="{ row }">
    <div class="p-4">
        <div class="mb-2 font-semibold">Orders for {{ row.name }}</div>
        <DataTable :columns="orderColumns" :data="(row.orders as ProductOrder[])" row-key="id" />
    </div>
</template>
```

`orderColumns` is its own `createColumns<ProductOrder & Record<string, unknown>>()` set: `id`, `customer`, `date`, `amount` through `formatCurrency`, `status` as a lowercase `Badge` with `getOrderSeverity`, and a display column with a search icon button.

#### Card 4, Grouping

A `DataTable` with `:data="customers3"`, `row-key="id"`, `group-by="representative"`, `:initial-sorting="[{ id: 'representative', desc: false }]"`, `scroll-height="400px"`. Columns: `representative` (on `representative.name`), `name`, `country` with the flag body, `company`, `status` with a `Badge`, `date` raw.

The `groupHeader` slot receives `{ row, value, count }` from the wrapper. Render the avatar and the name:

```vue
<template #groupHeader="{ row, value }">
    <div class="flex items-center gap-2">
        <img :alt="row.representative.name" :src="`https://primefaces.org/cdn/primevue/images/avatar/${row.representative.image}`" width="32" />
        <span>{{ value }}</span>
    </div>
</template>
<template #groupFooter="{ count }">
    <div class="flex w-full justify-end font-bold">Total Customers: {{ count }}</div>
</template>
```

The wrapper already counts the group, so `calculateCustomerTotal` is deleted: it was an O(n) scan per group header.

- [ ] **Step 1: Read the wrapper and its filter menu**

Read `src/components/data-table/DataTable.vue`, `DataTableFilterMenu.vue`, `filters.ts` and `index.ts` in full before writing a line. Slot names, meta fields and the exposed methods are all defined there and this page uses nearly all of them.

- [ ] **Step 2: Rewrite the script block, one card's columns at a time**

- [ ] **Step 3: Rewrite the template, one card at a time**

- [ ] **Step 4: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, `bunx prettier --check src/views/uikit/TableDoc.vue`.

The `DataTable` tests must stay green: they are the contract this page leans on hardest.

- [ ] **Step 5: Commit**

```
git add src/views/uikit/TableDoc.vue
```

then

```
git commit -m "feat: port TableDoc to the DataTable wrapper filters, pinning, expansion and grouping"
```

---

### Task 14: `TimelineDoc` and `TreeDoc`

**Files:**

- Modify: `src/views/uikit/TimelineDoc.vue` (159 lines, rewritten)
- Modify: `src/views/uikit/TreeDoc.vue` (30 lines, rewritten and extended)

**Interfaces:**

- Consumes: `Timeline` from `@/components/Timeline.vue`; `Card` family, `Button` from `@/components/ui/...`; `Tree` and `type TreeSelectionKeys` from `@/components/tree`; `createColumns` and `DataTable` from `@/components/data-table`; `NodeService`; `type TreeNode`, `type TreeTableNode` from `@/service/types`; icons.
- Produces: nothing other tasks consume.

Two commits, one per page.

#### TimelineDoc

Script: add `lang="ts"`. Type the events array explicitly, because the icon is now a component and only the first event has an image:

```ts
interface TimelineEvent {
    status: string;
    date: string;
    icon: Component;
    color: string;
    image?: string;
}
```

Keep all four events, their statuses, dates and hex colours (`#9C27B0`, `#673AB7`, `#FF9800`, `#607D8B`), swapping each icon string for `IconShoppingCart`, `IconCog`, `IconEnvelope`, `IconCheck`. Keep `horizontalEvents` as `ref<string[]>([...])`.

Cards, all unchanged in structure: Left Align, Right Align, Alternate Align, Opposite Content, Templating, Horizontal (three alignments). Every `Timeline` keeps `:value`, `align` and `layout`; the local component takes the same values. `text-muted-color` on the opposite slot becomes `text-muted-foreground`.

The Templating card's `Card` becomes the vendored parts: `<Card class="mt-4"><CardHeader><CardTitle>{{ item.status }}</CardTitle><CardDescription>{{ item.date }}</CardDescription></CardHeader><CardContent>` holding the image, the paragraph and `<Button variant="ghost">Read more</Button>`. The marker slot keeps its inline `backgroundColor` binding, since the colours are per-event data.

The scoped SCSS block must be rewritten, not deleted: it is what keeps the alternate layout readable on small screens. It targets PrimeVue class names that no longer exist. Replace it with plain CSS against the local component's data attributes, and drop `lang="scss"` so this file does not depend on sass, which Plan 5 removes:

```vue
<style scoped>
    @media screen and (max-width: 960px) {
        /* The alternate layout needs both sides on one line once the card no longer fits beside the rail. */
        .customized-timeline :deep([data-slot='timeline-event'][data-side='right']) {
            flex-direction: row;
        }

        .customized-timeline :deep([data-slot='timeline-content']) {
            text-align: left;
        }

        .customized-timeline :deep([data-slot='timeline-opposite']) {
            flex: 0;
        }
    }
</style>
```

Confirm the three data-slot values against `src/components/Timeline.vue` before writing them.

#### TreeDoc

Script: add `lang="ts"`. `treeValue` is `ref<TreeNode[]>([])` and `selectedTreeValue` is `ref<TreeSelectionKeys | null>(null)`. The tree-table data needs flattening for the `DataTable` wrapper, because `TreeTableNode` nests its fields under `data`:

```ts
type TreeRow = { key: string; name: string; size: string; type: string; children?: TreeRow[] } & Record<string, unknown>;

// The wrapper reads flat rows and finds children under one key; TreeTableNode hides its fields under `data`.
function toRows(nodes: TreeTableNode[]): TreeRow[] {
    return nodes.map((node) => ({ key: node.key, ...node.data, children: node.children ? toRows(node.children) : undefined }));
}
```

Spec section 5.11 asks for `Tree` with selection modes and a filter, and for the `DataTable` wrapper with `subRows` expansion. The page grows from two cards to four:

| card                   | content                                                                                                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tree                   | `<Tree :value="treeValue" selection-mode="checkbox" v-model:selection-keys="selectedTreeValue" />`, unchanged from today                                                                                                          |
| Tree with filter (new) | `<Tree :value="treeValue" selection-mode="single" filter filter-placeholder="Search" />`                                                                                                                                          |
| TreeTable              | `<DataTable :columns="columns" :data="rows" row-key="key" sub-rows-key="children" />` with three accessor columns headed `Name`, `Size` and `Type`. The wrapper renders the expander on the first column when `subRowsKey` is set |
| (keep the headings)    | `Tree`, `Tree with Filter`, `TreeTable`                                                                                                                                                                                           |

The PrimeVue `TreeTable` had `selectionMode="checkbox"`; the wrapper's equivalent is the `selectable` prop with a checkbox column. Add `selectable` and `v-model:selection="selectedRows"` typed `ref<TreeRow[]>([])` so the demo keeps its selection behaviour.

- [ ] **Step 1: Rewrite `TimelineDoc.vue`**

- [ ] **Step 2: Commit TimelineDoc**

```
git add src/views/uikit/TimelineDoc.vue
```

then

```
git commit -m "feat: port TimelineDoc to the local Timeline and vendored Card"
```

- [ ] **Step 3: Rewrite `TreeDoc.vue`**

- [ ] **Step 4: Verify both pages**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`, `bunx prettier --check src/views/uikit/TimelineDoc.vue src/views/uikit/TreeDoc.vue`.

- [ ] **Step 5: Commit TreeDoc**

```
git add src/views/uikit/TreeDoc.vue
```

then

```
git commit -m "feat: port TreeDoc to the local Tree and the DataTable sub-row expansion"
```

---

### Task 15: `BlockViewer`, `blocksCode` and the Blocks page

**Files:**

- Modify: `src/components/BlockViewer.vue` (165 lines)
- Create: `src/views/utilities/blocksCode.ts`, `src/views/utilities/blocksCode.test.ts`
- Modify: `src/views/utilities/Blocks.vue` (1077 lines, shrinking to roughly 560)

**Interfaces:**

- Produces: `blocksCode` from `@/views/utilities/blocksCode`, a `Record<BlockKey, string>` with the eleven keys `hero`, `feature`, `pricing`, `cta`, `banner`, `page-heading`, `stats`, `sign-in`, `description-list`, `card`, `glass`, and `export type BlockKey` naming them.
- Consumes: `Button`, `Checkbox`, `InputGroup` family from `@/components/ui/...`; `PasswordInput` from `@/components/PasswordInput.vue`; `Chip` from `@/components/Chip.vue`; `BlockViewer` from `@/components/BlockViewer.vue`; icons.
- Produces: nothing else other tasks consume.

Three commits: `BlockViewer`, then the `blocksCode` extraction with its test, then the page.

#### BlockViewer

Props: `header`, `code`, `free`, `containerClass`, `previewStyle` stay; convert the options-style `defineProps` to a typed `withDefaults(defineProps<{...}>(), {...})`. Delete `recent`, which nothing reads and nothing passes.

Replace the scoped SCSS block entirely. It sets `.app-code`'s background from `--p-surface-900` and its text from `--p-surface-50`, which is a dark code panel in both modes. Per spec section 5.11 the replacement reads the shadcn tokens, so drop the style block and put the classes on the element instead:

```vue
<pre class="overflow-x-auto rounded-lg border border-border bg-muted p-4"><code class="text-sm text-muted-foreground">{{ code }}</code></pre>
```

That keeps a readable code panel in light and dark mode without a SCSS block, which matters because Plan 5 removes sass.

The three copy-button icon states become components: `<IconSpinner class="animate-spin" />` while loading, `<IconCheck />` when copied, `<IconCopy />` otherwise. Keep the cross-fade classes and the 2000ms reset. Keep `copyCode`'s `catch` branch and its `console.error`: swallowing a clipboard failure silently would be worse.

Keep the two-button Preview and Code segmented control and the `BlockView` lookup, but make it a plain `const BLOCK_VIEW = { PREVIEW: 0, CODE: 1 } as const;` rather than `reactive`, since its values never change.

Rewrite every PrimeVue-layer utility class in the component's own markup per the Shared conversion rules.

#### blocksCode.ts

Move the `blocksCode` object out of `Blocks.vue` verbatim, then apply the class rewrites to all eleven strings. Shape:

```ts
export type BlockKey = 'hero' | 'feature' | 'pricing' | 'cta' | 'banner' | 'page-heading' | 'stats' | 'sign-in' | 'description-list' | 'card' | 'glass';

// The Code tab shows the markup a user would paste, so these strings must track the template below
// them class for class. The test next to this file pins the part that silently rots: a class from the
// PrimeVue layer that the project no longer defines.
export const blocksCode: Record<BlockKey, string> = {
    hero: `…`,
    …
};
```

The test:

```ts
import { describe, expect, it } from 'vitest';
import { blocksCode, type BlockKey } from './blocksCode';

const KEYS: BlockKey[] = ['hero', 'feature', 'pricing', 'cta', 'banner', 'page-heading', 'stats', 'sign-in', 'description-list', 'card', 'glass'];

describe('blocksCode', () => {
    it('has a non-empty snippet for every block', () => {
        expect(Object.keys(blocksCode).sort()).toEqual([...KEYS].sort());
        for (const key of KEYS) expect(blocksCode[key].trim().length).toBeGreaterThan(0);
    });

    it('advertises no class from the PrimeVue layer', () => {
        // One regex per family, so a failure names which class leaked.
        for (const key of KEYS) {
            expect(blocksCode[key], key).not.toMatch(/\b(?:bg|text|border|fill|from|to)-surface-/);
            expect(blocksCode[key], key).not.toMatch(/\b(?:text|bg)-primary-(?:\d|emphasis|contrast)/);
            expect(blocksCode[key], key).not.toMatch(/\b(?:rounded-border|bg-highlight|text-muted-color)\b/);
        }
    });

    it('names no PrimeIcons glyph', () => {
        for (const key of KEYS) expect(blocksCode[key], key).not.toMatch(/\bpi-/);
    });
});
```

Those three tests are the whole safety net for a 500-line string rewrite, so write them first and watch the second and third fail against the unmodified strings before you rewrite them.

#### Blocks.vue

Import `blocksCode` from `./blocksCode` and keep `:code="blocksCode.hero"` and friends unchanged at every call site.

The page hero above the first `BlockViewer` keeps its two background images (`/demo/images/blocks/landing-blocks.jpg` and the dark variant, both local assets). Two text changes: the `PrimeBlocks` heading becomes `Blocks`, and the `Explore Blocks` button's `href` becomes `https://www.shadcn-vue.com/blocks` (verified live on 2026-10-11), keeping `target="_blank"` and `rel="noopener noreferrer"`.

The eleven blocks, in order, with what each needs beyond the class rewrite:

| block            | work                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero             | two `Button`, the second `variant="outline"`. Keeps the supabase-hosted hero image                                                                                                                                                                                                                                                                                                                                                                             |
| Feature          | icons only: six `<i class="pi pi-*">` become icon components at `class="size-5"` or whatever the surrounding box sizes to                                                                                                                                                                                                                                                                                                                                      |
| Card (glass)     | two `InputGroup` replacing the two `IconField`, with `IconUser` and `IconLock` addons. The `text-white/70!` on the icons stays. The Sign In `Button` keeps its glass classes but `bg-surface-950!`/`border-surface-950!`/`hover:bg-surface-950/80!` become `bg-zinc-950!`, `border-zinc-950!` and `hover:bg-zinc-950/80!`: this is a fixed dark design, which the Shared conversion rules send to the built-in zinc scale. Keeps the supabase background image |
| Pricing          | three `Button` with `class="w-full rounded-full"`; twenty-four check-circle icons become `IconCheckCircle`                                                                                                                                                                                                                                                                                                                                                     |
| Call to Action   | one `Button` with `class="mt-4 rounded-full"` and `IconDiscord` as a child                                                                                                                                                                                                                                                                                                                                                                                     |
| Banner           | `containerClass="bg-surface-0 dark:bg-surface-950"` becomes `containerClass="bg-card"`; the dismiss button becomes `variant="ghost" size="icon"` with `IconTimes`, keeping its `text-*!` overrides rewritten to tokens                                                                                                                                                                                                                                         |
| Page Heading     | breadcrumb chevron becomes `IconAngleRight`; three stat icons become components; two `Button`, the first `variant="outline"` with `IconUserPlus`, the second with `IconCheck`                                                                                                                                                                                                                                                                                  |
| Stats            | four gradient swatches with icons; `bg-linear-to-b from-* to-*` classes are stock Tailwind and stay                                                                                                                                                                                                                                                                                                                                                            |
| Sign-In          | `InputText` becomes `Input`; `Password` becomes `<PasswordInput id="password1" v-model="password" placeholder="Password" :feedback="false" class="w-full" />`; `Checkbox :binary="true"` becomes `<Checkbox id="rememberme1" v-model="checked1" />`; the Sign In `Button` keeps its classes with `IconUser` as a child and its `#icon` template slot removed                                                                                                   |
| Description List | three `Chip` lose their `severity="secondary"` prop, which the local `Chip` does not have and does not need (it is already secondary-coloured); five edit buttons become `variant="outline" size="icon" class="shrink-0 rounded-full"` with `IconPenToSquare`                                                                                                                                                                                                  |
| Card             | markup only                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

The two inline `style="background-image: url(…)"` attributes stay: they are per-block images, not design tokens. The four inline SVG logos keep their markup with `fill-surface-*` rewritten per the rules. The `🔥` emoji stays.

- [ ] **Step 1: Rewrite `BlockViewer.vue` and commit**

Verify with `bun run type-check` and `bun run build`, then:

```
git add src/components/BlockViewer.vue
```

then

```
git commit -m "feat: move BlockViewer onto the shadcn tokens and icon components"
```

- [ ] **Step 2: Write `blocksCode.test.ts` first**

Create the test file against a `blocksCode.ts` that does not exist yet.

Run: `bun run test src/views/utilities/blocksCode.test.ts`
Expected: FAIL, cannot resolve `./blocksCode`.

- [ ] **Step 3: Move the object into `blocksCode.ts` unchanged**

Run the test again: the first test passes, the second and third fail and name the leaked classes and glyphs.

- [ ] **Step 4: Rewrite the eleven strings until the test passes**

Run: `bun run test src/views/utilities/blocksCode.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit the extraction**

```
git add src/views/utilities/blocksCode.ts src/views/utilities/blocksCode.test.ts src/views/utilities/Blocks.vue
```

then

```
git commit -m "refactor: extract the Blocks code snippets and clear the PrimeVue classes from them"
```

Note that `Blocks.vue` is in this commit because removing the object from it is what makes the extraction compile.

- [ ] **Step 6: Rewrite the eleven blocks in `Blocks.vue`**

- [ ] **Step 7: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test` (expect 231 tests in 56 files), `bun run build`, `bunx prettier --check src/components/BlockViewer.vue src/views/utilities/blocksCode.ts src/views/utilities/blocksCode.test.ts src/views/utilities/Blocks.vue`.

Then run the same three greps the test runs, over the page itself, and paste the output:

- `grep -nE '\b(bg|text|border|fill|from|to)-surface-' src/views/utilities/Blocks.vue`
- `grep -nE '\bpi-' src/views/utilities/Blocks.vue`

Both must be empty.

- [ ] **Step 8: Commit the page**

```
git add src/views/utilities/Blocks.vue
```

then

```
git commit -m "feat: port the Blocks page to shadcn components and tokens"
```

---

### Task 16: The deferred fixes from the Plan 2 and Plan 3 gates

**Files:**

- Modify: `src/components/menu/model.ts`, `src/components/menu/MenuItemContent.vue`
- Modify: `src/components/tree/model.ts`, `src/components/tree/Tree.vue`
- Modify: `src/components/data-table/filters.ts`, `src/components/data-table/DataTable.vue`, `src/components/data-table/DataTableFilterMenu.vue`
- Modify: `src/utils/optionAccess.ts`
- Modify: `src/components/AutoComplete.vue`, `src/components/MultiSelect.vue`, `src/components/OverlayBadge.vue`, `src/components/ConfirmPopover.vue`
- Modify: `src/components/file-upload/FileUpload.vue`
- Modify: `src/components/list/moves.ts`, `src/components/list/ListItems.vue`
- Modify: `src/layout/AppMenuItem.vue`, `src/layout/AppTopbar.vue`, `src/components/landing/TopbarWidget.vue`
- Modify: `src/assets/layout/_topbar.scss`
- Test: `src/components/data-table/filters.test.ts`, `src/components/list/moves.test.ts`, `src/components/tree/Tree.test.ts`, `src/components/menu/MenuList.test.ts`

**Interfaces:**

- Produces: `deepEquals(a: unknown, b: unknown): boolean` exported from `@/utils/optionAccess`, consumed by `src/components/data-table/filters.ts`.
- Everything else is a behaviour fix inside an existing surface.

Fourteen findings the two gates raised and the controller parked. They are small, independent and in different files, so they are one task with one commit. Each item names its file and its test.

Behaviour changes that need a test (write the test first, watch it fail, then fix):

1. **Menu item `class` is dropped.** `src/components/menu/model.ts:15` declares `class?: string` and no wrapper reads it. Apply it on the `MenuItemContent` root by merging into its `cn(...)` call. Test in `MenuList.test.ts`: an item with `class: 'text-destructive'` renders an element carrying that class.
2. **`TreeNodeLike.selectable` is ignored.** `src/components/tree/model.ts:8-9`. Honour it in `Tree.vue` by cancelling the item select event for a node with `selectable: false`; keep `leaf` as documentation of the service shape or delete it, and say which you chose. Test in `Tree.test.ts`: clicking a `selectable: false` node in single mode emits no `update:selectionKeys`.
3. **Two deep-equality copies.** `src/components/data-table/filters.ts:59-62` (`sameValue`) duplicates `src/utils/optionAccess.ts:12-15` (`sameOption`'s object branch). Export `deepEquals` from `optionAccess.ts`, use it in both, and keep `sameOption`'s key-based branch as it is. Test in `filters.test.ts`: the `in` match mode still matches an object option by value.
4. **An empty `matchModes` list crashes the filter menu.** `DataTableFilterMenu.vue:23` asserts `modes.value[0]!`, so a column configured `matchModes: []` yields `undefined` and `predicates[undefined]` throws on Apply. Fall back to the type's default list when the array is empty. Test in `filters.test.ts` or a focused menu test: a column with `matchModes: []` renders and applies with the type's first default mode.
5. **`moveTop`, `moveBottom` and `transferAll` allocate when nothing moves.** `src/components/list/moves.ts:39-53`. Return the input array when the result is unchanged, as `moveUp` and `moveDown` already do, so `OrderList` and `PickList` stop emitting an unchanged model. Test in `moves.test.ts`: `moveTop(items, [], id)` and `transferAll([], target)` return the same array instance they were given.

Fixes with no behaviour to pin (no test, but say so in the report):

6. **`v-for` keys collide on duplicate labels.** `AutoComplete.vue:84,108` and `MultiSelect.vue:77` key on the option label; `FileUpload.vue:142` keys an alert on its message. Key on the index combined with the label, or on the option value when `optionValue` is set.
7. **`ConfirmPopover` retains the last target element.** `ConfirmPopover.vue:9` keeps the settled options, including the DOM node, until the next targeted request. Clear `shown` once the close transition finishes.
8. **`DataTable`'s selection watcher is deep.** `DataTable.vue:190` traverses every selected row object on each change. Watch the mapped key list instead.
9. **`Tree` writes filter-driven expansions into the user's model.** `Tree.vue:41` writes every key Reka reports, so nodes the filter opened stay open after the filter is cleared. Subtract the filter's own expanded set before writing.
10. **`OverlayBadge.severity` is typed `string`.** Narrow it to the union of the keys in its own `variants` record so a typo fails type-check.
11. **`previewOf` runs twice per rendered row.** `FileUpload.vue:147` calls it in both `v-if` and `:src`. Hold the result in the loop with a `v-for` over a computed list of `{ file, preview }`.
12. **`ListItems`'s keydown handler does not check `event.target`.** It will swallow Space and Enter from an interactive element inside a consumer's `option` slot. Return early when `event.target` is not the option element itself.
13. **`target="_blank"` links carry no `rel`.** `src/layout/AppMenuItem.vue:77` renders the three external menu entries. Bind `rel="noopener noreferrer"` whenever the target is `_blank`. This is the Plan 2 security gate's F4.
14. **Two panel toggles have no `aria-expanded`.** `src/layout/AppTopbar.vue:75` and `src/components/landing/TopbarWidget.vue:42`. Bind `aria-expanded` to the open ref and `aria-controls` to the panel's id. In `TopbarWidget.vue:46-60`, give the five nav anchors real `href="#hero"`-style targets so they are keyboard focusable, keeping the existing click handler and calling `preventDefault` in it. This is the Plan 2 gate's F6.
15. **A dead SCSS line.** `src/assets/layout/_topbar.scss:120` has `transform-origin: top` on a rule whose transform was removed with the `v-styleclass` directives. Delete the line.

Not changed, and recorded as such in the report: the `MenuItemContent` URL scheme check (menu models are literals in this repo, so there is no untrusted path; the Plan 3 security gate scored it hardening-only), the `FileUpload` `accept` check (client-side `accept` is a convenience filter and the component never uploads), the quill and `decode-uri-component` advisories (no fix in range), and the `DataTable` expansion-row ordering when `expandable` and `subRowsKey` are combined (no page does both; `TreeDoc` uses `subRowsKey` alone).

- [ ] **Step 1: Write the five failing tests**

Run: `bun run test src/components/menu src/components/tree src/components/list src/components/data-table`
Expected: five new failures, each naming the behaviour above.

- [ ] **Step 2: Fix items 1 to 5 and watch the tests pass**

- [ ] **Step 3: Apply items 6 to 15**

- [ ] **Step 4: Verify**

Run and paste: `bun run type-check`, `bun run lint`, `bun run test` (expect 236 tests in 56 files), `bun run build`, `bunx prettier --check` over every file you touched.

- [ ] **Step 5: Commit**

```
git add src/components src/layout src/utils src/assets/layout/_topbar.scss
```

then

```
git commit -m "fix: clear the deferred findings from the Plan 2 and Plan 3 gates"
```

---

### Task 17: The PrimeVue sweep

**Files:**

- Modify: `src/main.ts`
- Modify: `vite.config.ts`
- Modify: `src/layout/composables/layout.ts`
- Delete: `src/layout/composables/primevueBridge.ts`
- Delete: `src/types/tailwindcss-primeui.d.ts` (and the now-empty `src/types/` directory)
- Modify: `src/assets/tailwind.css:6`
- Modify: `src/assets/styles.scss:2`
- Modify: `src/layout/AppMenu.vue:82`
- Modify: `package.json`, `bun.lock`

**Interfaces:**

- Produces: a tree with no PrimeVue import, plugin, stylesheet, type shim or package.
- Consumes: nothing. This task must run after every page task, because PrimeVue cannot leave while a page still renders one of its components.

Do not start until Tasks 3 to 15 are committed and `grep -rn "from 'primevue\|from '@primevue" src/views` is empty. If it is not, stop and report which page still imports PrimeVue.

- [ ] **Step 1: Strip `src/main.ts`**

It becomes:

```ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import '@/assets/tailwind.css';
import '@/assets/styles.scss';

const app = createApp(App);

app.use(router);
app.mount('#app');
```

The `ToastService` and `ConfirmationService` plugins go because `useToast` and `useConfirm` are local composables now; the theme plugin and `syncPrimeVueTheme` go because `src/utils/theme.ts` writes the tokens directly.

- [ ] **Step 2: Strip `vite.config.ts`**

Remove the `PrimeVueResolver` import and the whole `Components({...})` plugin entry: the comment on it already records that PrimeVue was the only thing auto-imported. Remove the `unplugin-vue-components` import with it. Leave the Vue plugin, the Tailwind plugin, the `@` alias and the `test` block untouched.

- [ ] **Step 3: Cut the bridge**

Delete `src/layout/composables/primevueBridge.ts`. In `src/layout/composables/layout.ts`, remove the `syncPrimeVueTheme` import and the watcher or call that uses it. Read the file first: the token writing that must keep working lives in `src/layout/composables/theme.ts`, which has its own tests, so `bun run test src/layout` is the check that the layout still themes.

- [ ] **Step 4: Cut the stylesheet and the shim**

In `src/assets/tailwind.css`, delete line 6, `@plugin 'tailwindcss-primeui';`. In `src/assets/styles.scss`, delete line 2, `@use 'primeicons/primeicons.css';`, leaving the layout and demo imports. Delete `src/types/tailwindcss-primeui.d.ts`; if `src/types/` is then empty, remove the directory. That deletion also removes one of the five standing lint warnings, so from here the expected count is 4.

- [ ] **Step 5: Repoint the All Blocks menu entry**

`src/layout/AppMenu.vue:82`: `url: 'https://blocks.primevue.org/'` becomes `url: 'https://www.shadcn-vue.com/blocks'`. Verified live on 2026-10-11, titled "Building Blocks for the Web - shadcn/vue". Leave the label, the icon and `target: '_blank'` as they are; Task 16 added the `rel`.

- [ ] **Step 6: Remove the packages**

Remove these seven from `package.json`: `primevue`, `@primeuix/themes`, `@primevue/auto-import-resolver`, `primeflex`, `primeicons`, `tailwindcss-primeui`, `unplugin-vue-components`. Keep `sass`: spec section 5.13 retires it in phase 7, which is Plan 5.

Edit `package.json` by hand rather than with `bun remove`, then run `bun install` to settle `bun.lock`. `bunfig.toml` sets `exact = true`, so check `git diff package.json` afterwards and restore any caret range the install rewrote on an unrelated dependency.

Then confirm nothing was pulled out from under the build: `bun run build` is the test, because a missing runtime package fails there rather than at type-check.

- [ ] **Step 7: Verify**

Run and paste all of:

- `bun run type-check`
- `bun run lint` (expect 0 errors and 4 warnings now)
- `bun run test` (expect the Task 16 total unchanged)
- `bun run build`
- `git diff --stat package.json bun.lock`

- [ ] **Step 8: Commit**

```
git add src/main.ts vite.config.ts src/layout src/assets/tailwind.css src/assets/styles.scss package.json bun.lock
```

then

```
git commit -m "chore: remove PrimeVue, the auto-import resolver, PrimeIcons and the primeui plugin"
```

The deletions need their own staging if `git add` on a directory does not pick them up; `git add -u src/layout src/types` covers the two removed files.

---

### Task 18: Phase gate for Plan 4

**Files:**

- None modified.

- [ ] **Step 1: Prove PrimeVue is gone**

Run each and paste the output.

```bash
grep -rn "from 'primevue\|from \"primevue\|from '@primevue\|from '@primeuix\|require('primevue" src vite.config.ts
```

Expected: no output.

```bash
grep -rn "primeicons/\|tailwindcss-primeui" src vite.config.ts package.json
```

Expected: no output.

```bash
grep -rn -- "--p-" src
```

Expected: no output. This is the token grep: `--p-primary-500` and friends were the last PrimeVue runtime dependency in the CSS.

```bash
grep -rnE "\bpi(-[a-z0-9-]+)? " src --include=*.vue | grep -v "primefaces.org/cdn"
```

Expected: no output, meaning no `class="pi pi-x"` icon markup is left.

```bash
grep -rnE "\b(bg|text|border|fill)-surface-|rounded-border|bg-highlight|text-muted-color|text-primary-(500|400|emphasis|contrast)" src
```

Expected: no output, meaning no PrimeVue-layer utility class is left.

```bash
grep -rn "primevue\|primeuix\|primeicons" src | grep -v "primefaces.org/cdn" | grep -v "src/views/pages/Documentation.vue"
```

Expected: only comment lines that document where a behaviour or a constant came from, for example `src/components/file-upload/validate.ts` naming PrimeVue 4's `formatSize` and `src/composables/useToast.ts` naming the composable it mirrors. List every line the grep returns and confirm each is prose, not a reference. Any non-comment line is a failure of this task.

Two exclusions, both deliberate: `https://primefaces.org/cdn/primevue/images/...` is the demo image host and stays per the Global Constraints, and `src/views/pages/Documentation.vue` is rewritten by Plan 5 under spec phase 8.

```bash
grep -rn $'\xe2\x80\x94' src docs/superpowers/plans/2026-10-11-shadcn-migration-plan-4-showcase-pages.md
```

Expected: no output. The byte escape is an em dash, written this way so this file does not contain one.

- [ ] **Step 2: Full verification**

Run each and paste the output: `bun run type-check` (exit 0), `bun run lint` (0 errors, 4 warnings: the two in `scripts/update-deps.ts`, one in `src/components/ui/calendar/CalendarHeading.vue` and one in `src/service/types.ts`), `bun run test`, `bun run build`.

Report the real test totals and reconcile them against the plan's arithmetic: 212 at the start, plus 8 (Task 1), 8 (Task 2), 3 (Task 15) and 5 (Task 16) is 236 in 56 files. A different number means a task's count was off; say which task moved it.

- [ ] **Step 3: Unused-file inventory**

Run `bunx knip` and list what it reports under `src/`. Compare against the inventory Plan 3's gate wrote to its workspace: every component Plan 3 listed as unused should now be consumed by a page, so the expected result is that the list shrinks to the vendored `ui` folders Plan 5 will use, plus whatever the pages genuinely do not reach. Name any Plan 3 component still listed as unused, because that means a page did not adopt it and spec section 5.11 says it should have.

Also confirm `MaskedInput` is no longer listed (Task 7 is its consumer) and that `@internationalized/date` is still reported as an unlisted dependency, which remains the user's call.

- [ ] **Step 4: Route inventory**

Run `grep -c "path:" src/router/index.ts` and confirm the route count is unchanged from the start of this plan. Spec section 5.11 says routes and the menu model are unchanged except the All Blocks URL and the icon values, so a changed count means a page was dropped or added.

- [ ] **Step 5: Browser pass**

If a browser is available: `bun run dev`, then walk every route in light and dark mode, all three presets, at desktop and mobile widths, and report the console for Reka or Vue warnings. Check in particular the four pages whose behaviour cannot be unit tested: `ChartDoc` (six charts repaint on a theme change), `TableDoc` (four tables, eight filters), `OverlayDoc` (five sheets, a popover table, two tooltips, the confirm popover) and `Blocks` (eleven blocks in both modes).

If no browser is available, say so plainly and name it as the one check this plan could not run.

- [ ] **Step 6: Report**

No commit. Reply with the grep results, the verification output, the knip inventory, the route count and the browser observation. Plan 5 is written from this state.

---

## Self-review against the spec

**Spec coverage.** Section 5.11's application-page rows were Plan 2's and are done, except `Documentation.vue`, which spec phase 8 assigns to Plan 5 and which this plan states as out of scope in two places. Every showcase row in 5.11's table has a task: ButtonDoc and MessagesDoc (Task 3), ChartDoc (Task 4), FileDoc and MiscDoc (Task 5), FormLayout including the new Validation section (Task 6), InputDoc including the mask and range examples (Task 7), ListDoc (Task 8), MediaDoc (Task 9), MenuDoc (Task 10), OverlayDoc (Task 11), PanelsDoc (Task 12), TableDoc (Task 13), TimelineDoc and TreeDoc (Task 14), Blocks and BlockViewer (Task 15). The utility-class table in 5.11 is reproduced in Shared conversion rules. Section 5.12's icon rule is honoured: the map is the only `@lucide/vue` consumer and `pi-star-fill`, the one glyph with no entry, has an explicit rendering. Section 5.13's removals are Task 17, minus `sass`, which 5.13 itself defers to phase 7. Section 8's `mask.test.ts` is Task 2; the rest of section 8's list landed in Plans 1 to 3 and must stay green, which every task checks. Section 9's phase 6 exit criterion is Task 18, with the grep narrowed from prose to imports, tokens and packages, and the narrowing stated.

**One spec row changed shape.** 5.11's InputDoc row lists `MaskedInput` for "the mask example", but the current InputDoc has no mask example: PrimeVue's `InputMask` appears nowhere in the tree. Task 2 builds the component and Task 7 adds the section, so the spec row is satisfied by adding the demo the spec implies rather than by porting one that never existed. Plan 3 left `InputMask` out for exactly the reason that it had no consumer; this plan gives it one.

**Placeholder scan.** No TBD, no TODO, no "similar to Task N", no "add error handling". Every page task carries its own section table rather than pointing at a sibling. Three tasks hand the implementer a judgement call with a named fallback and a reporting duty rather than a guess: the `ScrollArea` and `ScrollTop` pairing in Task 5, the vee-validate slot shape in Task 6, and the date filter control in Task 13. Those are verification instructions with a stated default, not deferred design.

**Type consistency.** `type Row = Product & Record<string, unknown>` is the shape `Crud.vue` already uses and Tasks 11 and 13 reuse it by name. `formatCurrency` has one signature, defined in Task 1 and consumed by Tasks 11 and 13. `chartShade` and `paletteShade` are defined in Task 1 and consumed only by Task 4, with `RevenueStreamWidget` rewritten onto them in Task 1 itself. `BlockKey` is defined in Task 15 and used only there. `MenuModelItem` and `MegaMenuItem` come from `@/components/menu` and are used by Tasks 3, 10 and 12. `TreeSelectionKeys` comes from `@/components/tree` and is used by Tasks 7 and 14. `BadgeVariants['variant']` is the return type of every severity helper in Tasks 8, 9 and 13. `DataTableColumnMeta` is the meta type in Task 13 only.

**Test arithmetic.** 212 at the start of this plan, plus 4 currency and 4 chart-colour tests (Task 1), 8 mask tests (Task 2), 3 blocksCode tests (Task 15) and 5 gate-fix tests (Task 16), is 236 in 56 files. Page tasks add none, which is spec section 8's own scoping and is stated in the Global Constraints so a reviewer does not read it as an omission.
