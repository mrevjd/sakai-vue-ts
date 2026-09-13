# shadcn-vue Migration, Plan 2: Application Pages and Layout Phase A

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port every application page (Dashboard and its five widgets, Crud, Login, Access, Error, NotFound, Empty, Landing and its six widgets) and the layout pieces that do not depend on the Sidebar swap (topbar, floating configurator, configurator panel, menu items, footer) from PrimeVue to shadcn-vue, adding the gap components those pages need (Toolbar, StarRating, PasswordInput with a strength util, the lucide icon map, Button and Badge severity variants), so that after this plan no application page imports or auto-imports a PrimeVue component.

**Architecture:** Each page keeps its layout and copy; only the component layer and the utility classes change. PrimeVue stays installed and registered because the fifteen showcase pages still use it until Plan 3. Gap components live under `src/components` with tests, following the wrappers Plan 1 landed (`AppChart`, `DataTable`, `useToast`, `useConfirm`). Icons are lucide components re-exported by PrimeIcons-derived names from one map file so a menu model or a widget imports one name. Utility classes move from `tailwindcss-primeui` names to shadcn tokens with one fixed mapping applied file by file.

**Tech Stack:** Vue 3.5, Vite 8, TypeScript 6 strict, Tailwind 4.3, the vendored shadcn-vue (nova) components, Reka UI 2.10, `@lucide/vue` 1.45 (bare export names; lucide ships no brand icons, so `Github` does not exist), `@vueuse/core` 14 (`onClickOutside`), TanStack Table 9 through the Plan 1 `DataTable`, Vitest 4.1 with jsdom and `@vue/test-utils` 2.5, Bun.

**Spec:** `docs/superpowers/specs/2026-09-12-shadcn-vue-migration-design.md` (revision 3). This plan implements spec phase 5 and the part of phase 4 those pages need. Plan 3 takes the showcase pages, the remaining gap components and the sweep; Plan 4 takes the Sidebar swap, docs and the final gate.

**Prior plan:** Plan 1 landed on this branch through commit `6151833`. Its review gate deferred these items to Plan 2, and each is a step below: `_topbar.scss` reads `--text-secondary-color`, a name nothing defines; `AppConfigurator` duplicates `resolveSurface` with `zinc`/`slate` literals; `useConfirm` wraps state in a deep `readonly()` so an icon still reads back as a proxy; `RevenueStreamWidget` initialises chart data to `null` while `AppChart` requires `data`; `downloadCsv` revokes its object URL synchronously, to be checked in the browser on the Crud export; the dead `.config-panel` block in `_topbar.scss`.

## Global Constraints

- Work only in the worktree `.claude/worktrees/shadcn-vue-migration` on branch `worktree-shadcn-vue-migration`. Never touch the main checkout.
- Bun only: `bun run <script>`, `bunx`. Never `npm`, `npx`, `yarn`, bare `bun test` or bare `bun build`. No new dependencies in this plan; everything needed is installed.
- Git commands are single plain commands, one per shell invocation (`git add <paths>` then `git commit -m ...`); the harness refuses compound git lines and heredocs. Use the Write and Edit tools for file content.
- Formatting is the repo's Prettier config: 4-space indent, single quotes, semicolons, no trailing commas, `printWidth` 250, indented script blocks in `.vue` files. Run `bunx prettier --check` on every changed file before committing and `--write` where it differs.
- TypeScript strict with `noUnusedLocals` and `noUnusedParameters`. Every ported page's `<script setup>` gains `lang="ts"` (several are plain JS today). Tests import `describe`, `it`, `expect`, `vi` from `vitest` explicitly.
- Every task ends green on all of: `bun run type-check`, `bun run lint` (0 errors; 5 pre-existing warnings are expected), `bun run test`, `bun run build`.
- `@plugin 'tailwindcss-primeui'` in `src/assets/tailwind.css`, `app.use(PrimeVue, ...)`, `ToastService` and `ConfirmationService` in `src/main.ts`, `<Toast />` in `AppLayout.vue`, and the `Components({ dirs: [], resolvers: [PrimeVueResolver()] })` plugin all stay in place. Showcase pages need them until Plan 3's sweep.
- Comment why, not what. Handle errors explicitly. No em dashes in any file or commit message. No AI attribution lines in commits.
- **Utility class mapping**, applied verbatim wherever a ported file carries the left-hand form; no other class renames are made:

| tailwindcss-primeui form | shadcn form |
|---|---|
| `bg-surface-0 dark:bg-surface-900` | `bg-card` |
| `bg-surface-50 dark:bg-surface-950` | `bg-background` |
| `text-surface-900 dark:text-surface-0` | `text-foreground` |
| `text-surface-700 dark:text-surface-100` | `text-foreground` |
| `text-surface-600 dark:text-surface-200` | `text-muted-foreground` |
| `text-muted-color` | `text-muted-foreground` |
| `border-surface` | `border-border` |
| `border-surface-200 dark:border-surface-600` | `border-border` |
| `border-surface-300 dark:border-surface-500` | `border-border` |
| `bg-surface-300 dark:bg-surface-500` | `bg-muted` |
| `bg-highlight` | `bg-accent` |
| `rounded-border` | `rounded-lg` |
| `text-primary`, `border-primary`, `outline-primary` | unchanged |

- **PrimeVue prop mapping** for `Button`: `severity="secondary"` becomes `variant="secondary"`, `severity="danger"` becomes `variant="destructive"`, `severity="warn"` becomes `variant="warning"`, `text` becomes `variant="ghost"`, `outlined` becomes `variant="outline"`, `rounded` becomes `class="rounded-full"`, `icon="pi pi-x"` becomes a lucide child, `label="X"` becomes slot text, `as="router-link" to="/x"` becomes `as-child` wrapping `<RouterLink to="/x">`. For `Tag`: `severity="success"` becomes `variant="success"`, `warn` becomes `warning`, `danger` becomes `destructive`.
- Icon sizing: a lucide icon replacing a `pi` glyph gets `class="size-5"` in buttons and menus, `size-6` where the glyph carried `text-xxl!` or `text-xl!`, `size-8` for `text-3xl!` and `size-9` for `text-4xl!`, keeping any colour class the glyph had.

## Verified facts this plan relies on

Checked in the worktree on 2026-09-13, at commit `6151833`:

- `@lucide/vue` exports every bare name in the icon map below (checked against `node_modules/@lucide/vue/dist/lucide-vue.d.ts`); it exports no `Github`, so the two repository links use `ExternalLink`.
- `@vueuse/core` exports `onClickOutside`.
- The vendored `Button` forwards `as` and `asChild` to Reka's `Primitive`; `buttonVariants` in `src/components/ui/button/index.ts` currently has variants `default`, `outline`, `secondary`, `ghost`, `destructive`, `link` and sizes `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`. `badgeVariants` has `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`.
- `PopoverContent` defaults to `align: 'center'`, `sideOffset: 4`, renders `w-72 p-2.5` with the popover tokens; `DropdownMenuContent` defaults to `align: 'start'`; `DropdownMenuItem` takes `variant?: 'default' | 'destructive'`.
- `Input`, `Textarea` and `NumberFieldInput` use `useVModel` on `modelValue` (`string | number`) and carry `data-slot="input"` (`textarea` for the textarea), so the Plan 1 preset height hook applies to them.
- `Separator` defaults to horizontal and decorative and renders `bg-border h-px w-full`.
- `RadioGroupItem` renders a `size-4` circle with a `CircleIcon` indicator.
- PrimeVue's `Password` default regexes, copied for `passwordStrength.ts`: medium `^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})`, strong `^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})`.
- `ProductService` exposes `getProducts()`, `getProductsSmall()`, `getProductsMini()` returning `Promise<Product[]>`; `Product` has `id`, `code`, `name`, `description`, `image`, `price`, `category`, `quantity`, `inventoryStatus: 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK'`, `rating`.
- The `DataTable` wrapper (`@/components/data-table`) exposes `createColumns<TData>()`, props `columns`, `data`, `rowKey`, `paginator`, `pageSize`, `pageSizeOptions`, `reportTemplate`, `selectable`, models `v-model:selection` and `v-model:globalFilter`, slots `header` and `empty`, and `visibleRows()` and `selectedRows()` on its instance. Its generic constraint is `TData extends Record<string, unknown>`; `Product` is an interface, so consumers pass `Product & Record<string, unknown>` or declare the columns with `createColumns<Product & Record<string, unknown>>()`.
- `useToast()` from `@/composables/useToast` and `useConfirm()` from `@/composables/useConfirm` keep PrimeVue's call shapes; `ConfirmDialogHost` and `Toaster` are mounted in `App.vue`.
- `useLayout()` returns `layoutConfig`, `layoutState`, `isDarkTheme`, `toggleDarkMode`, `toggleMenu`, `hideMobileMenu`, `changeMenuMode`, `isDesktop`; `resolvePrimary(name)` and `resolveSurface(name, mode)` in `@/utils/theme` return `PaletteOption` objects whose `palette` has shades `'50'` to `'950'` (`noir` has an empty palette).
- The suite is 64 tests in 12 files. `find src -name '*.test.ts' | wc -l` prints 12.
- `_topbar.scss` sizes topbar icons with two `i { font-size: ... }` rules (lines 59 and 143); `_menu.scss` gives `.layout-menuitem-icon` a right margin and `.layout-submenu-toggler` a transition; `_topbar.scss:161-167` still holds a `.config-panel .config-panel-label` block that nothing renders, and line 164 reads `--text-secondary-color`.

## File structure

Created:

- `src/components/icons.ts` + `icons.test.ts` (lucide re-export map)
- `src/utils/passwordStrength.ts` + `passwordStrength.test.ts`
- `src/components/PasswordInput.vue` + `PasswordInput.test.ts`
- `src/components/StarRating.vue` + `StarRating.test.ts`
- `src/components/Toolbar.vue`
- `src/test/variants.test.ts`

Modified:

- `src/components/ui/button/index.ts`, `src/components/ui/badge/index.ts` (variants added)
- `src/composables/useConfirm.ts`
- `src/layout/AppTopbar.vue`, `AppMenu.vue`, `AppMenuItem.vue`, `AppConfigurator.vue`, `AppFooter.vue`
- `src/components/FloatingConfigurator.vue`
- `src/assets/layout/_topbar.scss`, `_menu.scss`
- `src/components/dashboard/*.vue` (5), `src/views/Dashboard.vue`
- `src/views/pages/Crud.vue`
- `src/views/pages/auth/Login.vue`, `Access.vue`, `Error.vue`, `src/views/pages/NotFound.vue`, `src/views/pages/Empty.vue`
- `src/components/landing/*.vue` (6), `src/views/pages/Landing.vue`

---

### Task 1: Button and Badge severity variants

**Files:**
- Modify: `src/components/ui/button/index.ts`, `src/components/ui/badge/index.ts`
- Create: `src/test/variants.test.ts`

**Interfaces:**
- Produces: `Button` variants `success`, `warning`, `info`, `help`, `contrast`; `Badge` variants `success`, `warning`, `info`, `contrast`. Every later task that maps a PrimeVue severity uses these names.

- [ ] **Step 1: Write the failing test**

`src/test/variants.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { badgeVariants } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';

describe('severity variants added for PrimeVue parity', () => {
    it('gives every added button variant a distinct background', () => {
        const classes = (['success', 'warning', 'info', 'help', 'contrast'] as const).map((variant) => buttonVariants({ variant }));
        expect(classes[0]).toContain('bg-green-600');
        expect(classes[1]).toContain('bg-amber-500');
        expect(classes[2]).toContain('bg-sky-500');
        expect(classes[3]).toContain('bg-purple-500');
        expect(classes[4]).toContain('bg-foreground');
        expect(new Set(classes).size).toBe(5);
    });

    it('gives every added badge variant a distinct background', () => {
        const classes = (['success', 'warning', 'info', 'contrast'] as const).map((variant) => badgeVariants({ variant }));
        expect(classes[0]).toContain('bg-green-600');
        expect(classes[1]).toContain('bg-amber-500');
        expect(classes[2]).toContain('bg-sky-500');
        expect(classes[3]).toContain('bg-foreground');
        expect(new Set(classes).size).toBe(4);
    });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `bun run test src/test/variants.test.ts`
Expected: FAIL; `vue-tsc` is not involved in Vitest, so the failure is the assertions (`cva` ignores unknown variants and returns the base classes, which do not contain `bg-green-600`).

- [ ] **Step 3: Add the variants**

In `src/components/ui/button/index.ts`, inside `variants.variant`, after the `link` entry add:
```ts
                success: 'bg-green-600 text-white hover:bg-green-600/90 focus-visible:ring-green-600/40',
                warning: 'bg-amber-500 text-white hover:bg-amber-500/90 focus-visible:ring-amber-500/40',
                info: 'bg-sky-500 text-white hover:bg-sky-500/90 focus-visible:ring-sky-500/40',
                help: 'bg-purple-500 text-white hover:bg-purple-500/90 focus-visible:ring-purple-500/40',
                contrast: 'bg-foreground text-background hover:bg-foreground/90'
```
(the `link` entry gains a trailing comma; the file uses no trailing comma after the last entry, so `contrast` has none).

In `src/components/ui/badge/index.ts`, inside `variants.variant`, after the `link` entry add:
```ts
                success: 'bg-green-600 text-white [a]:hover:bg-green-600/80',
                warning: 'bg-amber-500 text-white [a]:hover:bg-amber-500/80',
                info: 'bg-sky-500 text-white [a]:hover:bg-sky-500/80',
                contrast: 'bg-foreground text-background [a]:hover:bg-foreground/80'
```

- [ ] **Step 4: Run to see it pass, verify, commit**

`bun run test src/test/variants.test.ts` (2 pass), then `bun run type-check`, `bun run lint`, `bun run test` (66 tests, 13 files), `bun run build`.
```bash
git add src/components/ui/button/index.ts src/components/ui/badge/index.ts src/test/variants.test.ts
```
```bash
git commit -m "feat: add severity variants to Button and Badge for PrimeVue parity"
```

---

### Task 2: The icon map

**Files:**
- Create: `src/components/icons.ts`, `src/components/icons.test.ts`

**Interfaces:**
- Produces: named re-exports from `@/components/icons`, one per PrimeIcons name used by the application pages and layout, so a file imports `{ IconHome, IconTrash }` and never touches `@lucide/vue` directly. Every export is a Vue component usable as `<IconHome class="size-5" />` or as `component :is`.

- [ ] **Step 1: Write the failing test**

`src/components/icons.test.ts`:
```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import * as icons from './icons';

describe('icon map', () => {
    it('re-exports only components, each rendering an svg', () => {
        const names = Object.keys(icons);
        expect(names.length).toBeGreaterThan(50);
        for (const name of names) {
            expect(name.startsWith('Icon'), `${name} is not prefixed`).toBe(true);
            const wrapper = mount(icons[name as keyof typeof icons] as never, { props: { class: 'size-5' } });
            expect(wrapper.element.tagName.toLowerCase(), `${name} did not render an svg`).toBe('svg');
        }
    });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `bun run test src/components/icons.test.ts`
Expected: FAIL, unresolved import `./icons`.

- [ ] **Step 3: Write the map**

`src/components/icons.ts`. The comment names the PrimeIcons glyph each export replaces so the mapping is reviewable in one place:
```ts
// One import point for icons. Each export is named after the PrimeIcons glyph it replaces (pi-home
// becomes IconHome) so a port is a rename, and a derived project adds an icon by adding one line.
export {
    AlignLeft as IconAlignLeft, // pi-align-left
    ChevronDown as IconAngleDown, // pi-angle-down
    ArrowRight as IconArrowRight, // pi-arrow-right
    ArrowUp as IconArrowUp, // pi-arrow-up
    Menu as IconBars, // pi-bars
    Bell as IconBell, // pi-bell
    Book as IconBook, // pi-book
    Briefcase as IconBriefcase, // pi-briefcase
    Calendar as IconCalendar, // pi-calendar
    ChartBar as IconChartBar, // pi-chart-bar
    Check as IconCheck, // pi-check
    SquareCheck as IconCheckSquare, // pi-check-square
    Circle as IconCircle, // pi-circle
    CircleOff as IconCircleOff, // pi-circle-off
    Copy as IconClone, // pi-clone
    Settings as IconCog, // pi-cog
    MessageSquare as IconComment, // pi-comment
    Monitor as IconDesktop, // pi-desktop
    DollarSign as IconDollar, // pi-dollar
    Download as IconDownload, // pi-download
    EllipsisVertical as IconEllipsisV, // pi-ellipsis-v
    CircleAlert as IconExclamationCircle, // pi-exclamation-circle
    TriangleAlert as IconExclamationTriangle, // pi-exclamation-triangle
    Eye as IconEye, // pi-eye
    EyeOff as IconEyeSlash, // pi-eye-slash
    File as IconFile, // pi-file
    ExternalLink as IconGithub, // pi-github (lucide ships no brand icons)
    Globe as IconGlobe, // pi-globe
    Heart as IconHeart, // pi-heart
    House as IconHome, // pi-home
    IdCard as IconIdCard, // pi-id-card
    Image as IconImage, // pi-image
    Inbox as IconInbox, // pi-inbox
    List as IconList, // pi-list
    Lock as IconLock, // pi-lock
    Map as IconMap, // pi-map
    Smartphone as IconMobile, // pi-mobile
    Moon as IconMoon, // pi-moon
    Palette as IconPalette, // pi-palette
    Pencil as IconPencil, // pi-pencil
    Plus as IconPlus, // pi-plus
    Power as IconPowerOff, // pi-power-off
    Hexagon as IconPrime, // pi-prime
    CircleQuestionMark as IconQuestion, // pi-question
    CircleHelp as IconQuestionCircle, // pi-question-circle
    Search as IconSearch, // pi-search
    Share2 as IconShareAlt, // pi-share-alt
    ShoppingCart as IconShoppingCart, // pi-shopping-cart
    LogIn as IconSignIn, // pi-sign-in
    Star as IconStar, // pi-star
    Sun as IconSun, // pi-sun
    Table as IconTable, // pi-table
    Tablet as IconTablet, // pi-tablet
    X as IconTimes, // pi-times
    CircleX as IconTimesCircle, // pi-times-circle
    Trash2 as IconTrash, // pi-trash
    LockOpen as IconUnlock, // pi-unlock
    Upload as IconUpload, // pi-upload
    User as IconUser, // pi-user
    Users as IconUsers // pi-users
} from '@lucide/vue';
```

- [ ] **Step 4: Run to see it pass, verify, commit**

`bun run test src/components/icons.test.ts` (1 pass; 60 icons mount). Then the four verification commands (67 tests, 14 files).
```bash
git add src/components/icons.ts src/components/icons.test.ts
```
```bash
git commit -m "feat: add the lucide icon map keyed by PrimeIcons names"
```

---

### Task 3: Password strength util and `PasswordInput`

**Files:**
- Create: `src/utils/passwordStrength.ts`, `src/utils/passwordStrength.test.ts`, `src/components/PasswordInput.vue`, `src/components/PasswordInput.test.ts`

**Interfaces:**
- Produces: `type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong'`, `passwordStrength(value: string): PasswordStrength`; `PasswordInput` with `v-model` (string), props `id`, `placeholder`, `toggleMask` (default true), `feedback` (default true), `disabled`, `class`; emits `update:modelValue`. Used by Login in Task 9 and by Blocks in Plan 3.

- [ ] **Step 1: Write the failing util test**

`src/utils/passwordStrength.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { passwordStrength } from './passwordStrength';

describe('passwordStrength', () => {
    it('is none for an empty value', () => {
        expect(passwordStrength('')).toBe('none');
    });

    it('is weak below the medium rule', () => {
        expect(passwordStrength('abc')).toBe('weak');
        expect(passwordStrength('abcdefgh')).toBe('weak');
        expect(passwordStrength('ABCDEFGH')).toBe('weak');
    });

    it('is medium with two character classes and six characters', () => {
        expect(passwordStrength('abcDEF')).toBe('medium');
        expect(passwordStrength('abc123')).toBe('medium');
        expect(passwordStrength('ABC123')).toBe('medium');
    });

    it('is strong with lower, upper and a digit at eight characters', () => {
        expect(passwordStrength('Abcdefg1')).toBe('strong');
        expect(passwordStrength('Abcdef1')).toBe('medium');
    });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

Run: `bun run test src/utils/passwordStrength.test.ts` and expect an unresolved import. Create `src/utils/passwordStrength.ts`:
```ts
export type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong';

// PrimeVue's Password defaults, kept so a derived project's meter reads the same as before the migration.
const MEDIUM = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

export function passwordStrength(value: string): PasswordStrength {
    if (value.length === 0) return 'none';
    if (STRONG.test(value)) return 'strong';
    if (MEDIUM.test(value)) return 'medium';
    return 'weak';
}
```
Run the test again: 4 pass.

- [ ] **Step 3: Write the failing component test**

`src/components/PasswordInput.test.ts`:
```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PasswordInput from './PasswordInput.vue';

describe('PasswordInput', () => {
    it('masks by default and toggles to text from the eye button', async () => {
        const wrapper = mount(PasswordInput, { props: { modelValue: 'secret', id: 'pw' } });
        const input = wrapper.get('input');
        expect(input.attributes('type')).toBe('password');
        expect(input.attributes('id')).toBe('pw');
        await wrapper.get('[data-testid=password-toggle]').trigger('click');
        expect(input.attributes('type')).toBe('text');
        await wrapper.get('[data-testid=password-toggle]').trigger('click');
        expect(input.attributes('type')).toBe('password');
    });

    it('emits the typed value', async () => {
        const wrapper = mount(PasswordInput, { props: { modelValue: '' } });
        await wrapper.get('input').setValue('Abcdefg1');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['Abcdefg1']);
    });

    it('shows the strength label that matches the value when feedback is on', async () => {
        const wrapper = mount(PasswordInput, { props: { modelValue: 'abc' } });
        expect(wrapper.get('[data-testid=password-strength]').text()).toBe('Weak');
        await wrapper.setProps({ modelValue: 'Abcdefg1' });
        expect(wrapper.get('[data-testid=password-strength]').text()).toBe('Strong');
        await wrapper.setProps({ modelValue: '' });
        expect(wrapper.find('[data-testid=password-strength]').exists()).toBe(false);
    });

    it('renders neither the meter nor the toggle when they are switched off', () => {
        const wrapper = mount(PasswordInput, { props: { modelValue: 'abc', feedback: false, toggleMask: false } });
        expect(wrapper.find('[data-testid=password-strength]').exists()).toBe(false);
        expect(wrapper.find('[data-testid=password-toggle]').exists()).toBe(false);
    });
});
```

- [ ] **Step 4: Run to see it fail, then implement**

Run: `bun run test src/components/PasswordInput.test.ts` and expect an unresolved import. Create `src/components/PasswordInput.vue`:
```vue
<script setup lang="ts">
    import { computed, ref, type HTMLAttributes } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { IconEye, IconEyeSlash } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import { passwordStrength, type PasswordStrength } from '@/utils/passwordStrength';

    const props = withDefaults(
        defineProps<{
            id?: string;
            placeholder?: string;
            toggleMask?: boolean;
            feedback?: boolean;
            disabled?: boolean;
            class?: HTMLAttributes['class'];
        }>(),
        { id: undefined, placeholder: '', toggleMask: true, feedback: true, disabled: false, class: undefined }
    );

    const model = defineModel<string>({ default: '' });
    const revealed = ref(false);

    const strength = computed<PasswordStrength>(() => passwordStrength(model.value));
    const strengthLabel = computed(() => ({ none: '', weak: 'Weak', medium: 'Medium', strong: 'Strong' })[strength.value]);
    // Fill fraction and colour mirror PrimeVue's meter: a third per level.
    const strengthClass = computed(() => ({ none: 'w-0', weak: 'w-1/3 bg-destructive', medium: 'w-2/3 bg-amber-500', strong: 'w-full bg-green-600' })[strength.value]);
</script>

<template>
    <div :class="cn('flex flex-col gap-2', props.class)" data-slot="password-input">
        <div class="relative">
            <Input :id="props.id" v-model="model" :type="revealed ? 'text' : 'password'" :placeholder="props.placeholder" :disabled="props.disabled" :class="props.toggleMask ? 'pr-9' : undefined" autocomplete="current-password" />
            <Button v-if="props.toggleMask" type="button" variant="ghost" size="icon-sm" class="absolute top-1/2 right-1 -translate-y-1/2" :aria-label="revealed ? 'Hide password' : 'Show password'" data-testid="password-toggle" @click="revealed = !revealed">
                <IconEyeSlash v-if="revealed" class="size-4" />
                <IconEye v-else class="size-4" />
            </Button>
        </div>
        <div v-if="props.feedback && strength !== 'none'" class="flex items-center gap-3" data-testid="password-strength-meter">
            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div :class="cn('h-full transition-all', strengthClass)" />
            </div>
            <span class="text-xs text-muted-foreground" data-testid="password-strength">{{ strengthLabel }}</span>
        </div>
    </div>
</template>
```
Run the test again: 4 pass.

- [ ] **Step 5: Verify and commit**

The four verification commands (75 tests, 16 files).
```bash
git add src/utils/passwordStrength.ts src/utils/passwordStrength.test.ts src/components/PasswordInput.vue src/components/PasswordInput.test.ts
```
```bash
git commit -m "feat: add PasswordInput with a PrimeVue-compatible strength meter"
```

---

### Task 4: `StarRating`

**Files:**
- Create: `src/components/StarRating.vue`, `src/components/StarRating.test.ts`

**Interfaces:**
- Produces: `StarRating` with `v-model` (`number | null`), props `stars` (default 5), `readonly`, `disabled`, `class`; emits `update:modelValue`. Keyboard: ArrowRight and ArrowUp raise, ArrowLeft and ArrowDown lower, within `[1, stars]`. Clicking the current value again clears to `null` (PrimeVue 4 behaviour is to keep it; clearing is the documented difference so a mouse user can reset). Used by Crud in Task 8 and by InputDoc and TableDoc in Plan 3.

- [ ] **Step 1: Write the failing test**

`src/components/StarRating.test.ts`:
```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StarRating from './StarRating.vue';

describe('StarRating', () => {
    it('renders one radio per star and marks the filled ones', () => {
        const wrapper = mount(StarRating, { props: { modelValue: 3 } });
        const stars = wrapper.findAll('[role=radio]');
        expect(stars).toHaveLength(5);
        expect(stars.map((star) => star.attributes('aria-checked'))).toEqual(['false', 'false', 'true', 'false', 'false']);
        expect(wrapper.findAll('[data-filled=true]')).toHaveLength(3);
    });

    it('emits the clicked value and clears when the current value is clicked again', async () => {
        const wrapper = mount(StarRating, { props: { modelValue: 3 } });
        await wrapper.findAll('[role=radio]')[4]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([5]);
        await wrapper.setProps({ modelValue: 5 });
        await wrapper.findAll('[role=radio]')[4]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([null]);
    });

    it('moves with the arrow keys inside the range', async () => {
        const wrapper = mount(StarRating, { props: { modelValue: 5 } });
        const group = wrapper.get('[role=radiogroup]');
        await group.trigger('keydown', { key: 'ArrowRight' });
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        await group.trigger('keydown', { key: 'ArrowLeft' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([4]);
        await wrapper.setProps({ modelValue: null });
        await group.trigger('keydown', { key: 'ArrowUp' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([1]);
    });

    it('ignores clicks and keys when readonly or disabled', async () => {
        const wrapper = mount(StarRating, { props: { modelValue: 2, readonly: true } });
        await wrapper.findAll('[role=radio]')[0]!.trigger('click');
        await wrapper.get('[role=radiogroup]').trigger('keydown', { key: 'ArrowRight' });
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        expect(wrapper.findAll('[role=radio]')[0]!.attributes('tabindex')).toBe('-1');
    });
});
```

- [ ] **Step 2: Run to see it fail, then implement**

Run: `bun run test src/components/StarRating.test.ts` and expect an unresolved import. Create `src/components/StarRating.vue`:
```vue
<script setup lang="ts">
    import { computed, type HTMLAttributes } from 'vue';
    import { IconStar } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(
        defineProps<{
            stars?: number;
            readonly?: boolean;
            disabled?: boolean;
            class?: HTMLAttributes['class'];
        }>(),
        { stars: 5, readonly: false, disabled: false, class: undefined }
    );

    const model = defineModel<number | null>({ default: null });

    const inert = computed(() => props.readonly || props.disabled);
    const values = computed(() => Array.from({ length: Math.max(1, Math.floor(props.stars)) }, (_, index) => index + 1));

    function select(value: number): void {
        if (inert.value) return;
        // Clicking the current value again clears the rating; PrimeVue keeps it, so this is the one documented difference.
        model.value = model.value === value ? null : value;
    }

    function onKeydown(event: KeyboardEvent): void {
        if (inert.value) return;
        const current = model.value ?? 0;
        let next: number | null = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(values.value.length, current + 1);
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(1, current - 1);
        if (next === null || next === current) return;
        event.preventDefault();
        model.value = next;
    }
</script>

<template>
    <div role="radiogroup" :aria-disabled="props.disabled || undefined" :aria-readonly="props.readonly || undefined" :class="cn('inline-flex items-center gap-1', inert && 'cursor-default', props.class)" data-slot="star-rating" @keydown="onKeydown">
        <button
            v-for="value in values"
            :key="value"
            type="button"
            role="radio"
            :aria-checked="model === value"
            :aria-label="`${value} of ${values.length}`"
            :data-filled="model !== null && value <= model"
            :tabindex="inert ? -1 : model === value || (model === null && value === 1) ? 0 : -1"
            :disabled="props.disabled"
            :class="cn('rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring', inert ? 'cursor-default' : 'cursor-pointer')"
            @click="select(value)"
        >
            <IconStar :class="cn('size-5 transition-colors', model !== null && value <= model ? 'fill-primary text-primary' : 'text-muted-foreground')" />
        </button>
    </div>
</template>
```
Run the test again: 4 pass.

- [ ] **Step 3: Verify and commit**

The four verification commands (79 tests, 17 files).
```bash
git add src/components/StarRating.vue src/components/StarRating.test.ts
```
```bash
git commit -m "feat: add StarRating with keyboard support"
```

---

### Task 5: `Toolbar` and the `useConfirm` readonly fix

**Files:**
- Create: `src/components/Toolbar.vue`
- Modify: `src/composables/useConfirm.ts`

**Interfaces:**
- Produces: `Toolbar` with slots `start`, `center`, `end` and a `class` prop, rendering a bordered card-toned bar; PrimeVue's `Toolbar` slot names are kept so the Crud port is a tag rename. `confirmState` becomes `shallowReadonly(state)`.

- [ ] **Step 1: Write the component**

`src/components/Toolbar.vue` (markup only, no test; the CLAUDE.md scope covers components with logic):
```vue
<script setup lang="ts">
    import type { HTMLAttributes } from 'vue';
    import { cn } from '@/lib/utils';

    const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
    <div role="toolbar" :class="cn('flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3', props.class)" data-slot="toolbar">
        <div class="flex items-center gap-2"><slot name="start" /></div>
        <div class="flex items-center gap-2"><slot name="center" /></div>
        <div class="flex items-center gap-2"><slot name="end" /></div>
    </div>
</template>
```

- [ ] **Step 2: Fix the readonly wrapper**

In `src/composables/useConfirm.ts` change the import line to `import { shallowReactive, shallowReadonly, type Component, type DeepReadonly } from 'vue';`, and replace the `confirmState` declaration and its comment with:
```ts
// Shallow on both sides: readonly() would deep-proxy the icon component again and trip Vue's reactive-component warning.
export const confirmState: Readonly<ConfirmState> = shallowReadonly(state);
```
Remove the now unused `DeepReadonly` from the import if `vue-tsc` reports it unused. Run `bun run test src/composables/useConfirm src/components/ConfirmDialogHost` (6 pass). Add one test to `src/components/ConfirmDialogHost.test.ts` after the existing two:
```ts
    it('renders a functional icon component without proxying it', async () => {
        const Icon = () => h('svg', { 'data-testid': 'confirm-icon' });
        const wrapper = mount(ConfirmDialogHost, { attachTo: document.body });
        requireConfirm({ message: 'With icon', icon: Icon });
        await settle();
        expect(document.body.querySelector('[data-testid=confirm-icon]')).not.toBeNull();
        expect(isProxy(confirmState.options?.icon)).toBe(false);
        wrapper.unmount();
    });
```
with `import { h, isProxy } from 'vue';` added to that test file's imports. Run the file again: 3 pass.

- [ ] **Step 3: Verify and commit**

The four verification commands (80 tests, 17 files).
```bash
git add src/components/Toolbar.vue src/composables/useConfirm.ts src/components/ConfirmDialogHost.test.ts
```
```bash
git commit -m "feat: add Toolbar and stop useConfirm deep-proxying the icon"
```

---

### Task 6: Layout phase A, part 1: configurator panel and floating configurator

**Files:**
- Modify: `src/layout/AppConfigurator.vue`, `src/components/FloatingConfigurator.vue`

**Interfaces:**
- Consumes: `resolveSurface` from `@/utils/theme`; `Popover`, `PopoverTrigger`, `PopoverContent`; `IconSun`, `IconMoon`, `IconPalette`.
- Produces: `AppConfigurator` is now popover content with no positioning of its own (Task 7's topbar and this task's floating configurator wrap it in `PopoverContent`).

- [ ] **Step 1: Make the panel content-only and reuse the surface fallback**

In `src/layout/AppConfigurator.vue`:
- Add `import { resolveSurface } from '@/utils/theme';` after the presets import.
- Replace `isSurfaceSelected` with:
```ts
    function isSurfaceSelected(option: PaletteOption): boolean {
        return resolveSurface(layoutConfig.surface, isDarkTheme.value ? 'dark' : 'light').name === option.name;
    }
```
- Replace the root element's opening tag `<div class="config-panel hidden absolute top-[3.25rem] right-0 w-64 p-4 bg-card border border-border rounded-lg origin-top shadow-[...]">` with `<div class="flex flex-col gap-4" data-slot="app-configurator">` and remove the inner `<div class="flex flex-col gap-4">` wrapper so the four groups sit directly under the root (the closing tags reduce by one).

- [ ] **Step 2: Rewrite the floating configurator**

`src/components/FloatingConfigurator.vue`:
```vue
<script setup lang="ts">
    import { Button } from '@/components/ui/button';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { IconMoon, IconPalette, IconSun } from '@/components/icons';
    import AppConfigurator from '@/layout/AppConfigurator.vue';
    import { useLayout } from '@/layout/composables/layout';

    const { toggleDarkMode, isDarkTheme } = useLayout();
</script>

<template>
    <div class="fixed top-8 right-8 flex gap-4">
        <Button type="button" variant="secondary" size="icon-lg" class="rounded-full" :aria-label="isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleDarkMode">
            <IconMoon v-if="isDarkTheme" class="size-5" />
            <IconSun v-else class="size-5" />
        </Button>
        <Popover>
            <PopoverTrigger as-child>
                <Button type="button" size="icon-lg" class="rounded-full" aria-label="Theme settings">
                    <IconPalette class="size-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" class="w-64 p-4">
                <AppConfigurator />
            </PopoverContent>
        </Popover>
    </div>
</template>
```

- [ ] **Step 3: Verify and commit**

`grep -n 'v-styleclass' src/components/FloatingConfigurator.vue` prints nothing. The four verification commands (80 tests).
```bash
git add src/layout/AppConfigurator.vue src/components/FloatingConfigurator.vue
```
```bash
git commit -m "refactor: serve the configurator from a shadcn Popover"
```

---

### Task 7: Layout phase A, part 2: topbar, menu, footer, SCSS

**Files:**
- Modify: `src/layout/AppTopbar.vue`, `src/layout/AppMenu.vue`, `src/layout/AppMenuItem.vue`, `src/layout/AppFooter.vue`, `src/assets/layout/_topbar.scss`, `src/assets/layout/_menu.scss`

**Interfaces:**
- Consumes: the icon map, `Popover*`, `DropdownMenu*`, `onClickOutside` from `@vueuse/core`, `AppConfigurator` (content-only after Task 6).
- Produces: `AppMenuItem`'s `MenuItem.icon` is now `Component | undefined` instead of a class string; `AppMenu.vue`'s model uses icon components. `AppSidebar.vue` is untouched.

- [ ] **Step 1: Rewrite the topbar**

`src/layout/AppTopbar.vue`. The logo `<svg>` block (the three `<path>` elements and the `<mask>`) is kept byte for byte from the current file; only the script, the action buttons and the menus change. Replace the file with the following, pasting the existing `<svg ...>...</svg>` where marked:
```vue
<script setup lang="ts">
    import { onClickOutside } from '@vueuse/core';
    import { ref } from 'vue';
    import { Button } from '@/components/ui/button';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { IconBars, IconBell, IconCalendar, IconCog, IconEllipsisV, IconInbox, IconMoon, IconPalette, IconPowerOff, IconSun, IconUser } from '@/components/icons';
    import { useLayout } from '@/layout/composables/layout';
    import AppConfigurator from './AppConfigurator.vue';

    const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

    const profileMenuItems = [
        { label: 'Profile', icon: IconUser },
        { label: 'Settings', icon: IconCog },
        { label: 'Calendar', icon: IconCalendar },
        { label: 'Inbox', icon: IconInbox },
        { label: 'Log out', icon: IconPowerOff }
    ];

    // Below the lg breakpoint the action list is a dropdown panel; the SCSS positions it, this only shows and hides it.
    const mobileMenuOpen = ref(false);
    const actionsRef = ref<HTMLElement | null>(null);
    onClickOutside(actionsRef, () => {
        mobileMenuOpen.value = false;
    });
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button type="button" class="layout-menu-button layout-topbar-action" aria-label="Toggle menu" @click="toggleMenu">
                <IconBars class="size-5" />
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <!-- paste the existing <svg ...>...</svg> block here, unchanged -->
                <span>SAKAI</span>
            </router-link>
        </div>

        <div ref="actionsRef" class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" :aria-label="isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleDarkMode">
                    <IconMoon v-if="isDarkTheme" class="size-5" />
                    <IconSun v-else class="size-5" />
                </button>
                <Popover>
                    <PopoverTrigger as-child>
                        <button type="button" class="layout-topbar-action layout-topbar-action-highlight" aria-label="Theme settings">
                            <IconPalette class="size-5" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" class="w-64 p-4">
                        <AppConfigurator />
                    </PopoverContent>
                </Popover>
            </div>

            <button type="button" class="layout-topbar-menu-button layout-topbar-action" aria-label="More actions" @click="mobileMenuOpen = !mobileMenuOpen">
                <IconEllipsisV class="size-5" />
            </button>

            <div class="layout-topbar-menu lg:block" :class="{ hidden: !mobileMenuOpen }">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <IconCalendar class="size-5" />
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <IconInbox class="size-5" />
                        <span>Messages</span>
                    </button>
                    <button type="button" class="layout-topbar-action notification-button">
                        <span class="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500"></span>
                        <IconBell class="size-5" />
                        <span>Notifications</span>
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <button type="button" class="layout-topbar-action">
                                <IconUser class="size-5" />
                                <span>Profile</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" class="min-w-40">
                            <DropdownMenuItem v-for="item in profileMenuItems" :key="item.label">
                                <component :is="item.icon" class="size-4" />
                                {{ item.label }}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    </div>
</template>
```
The old `toggleNotifications` handler referenced a function that never existed; the notifications button now has no handler, which is what it did before. `Button` is imported for the type of `as-child` targets only if the linter requires it; if `bun run lint` reports it unused, delete that import line.

- [ ] **Step 2: Menu model and items on icon components**

In `src/layout/AppMenu.vue`, add `import { IconAlignLeft, IconBars, IconBook, IconBriefcase, IconCalendar, IconChartBar, IconCheckSquare, IconCircle, IconCircleOff, IconClone, IconComment, IconExclamationCircle, IconEye, IconFile, IconGithub, IconGlobe, IconHome, IconIdCard, IconImage, IconList, IconLock, IconMobile, IconPencil, IconPrime, IconShareAlt, IconSignIn, IconTable, IconTablet, IconTimesCircle, IconUser } from '@/components/icons';` and replace every `icon: 'pi pi-fw pi-<name>'` value with the matching component: `pi-home` to `IconHome`, `pi-id-card` to `IconIdCard`, `pi-check-square` to `IconCheckSquare`, `pi-mobile` to `IconMobile`, `pi-table` to `IconTable`, `pi-list` to `IconList`, `pi-share-alt` to `IconShareAlt`, `pi-tablet` to `IconTablet`, `pi-clone` to `IconClone`, `pi-image` to `IconImage`, `pi-bars` to `IconBars`, `pi-comment` to `IconComment`, `pi-file` to `IconFile`, `pi-chart-bar` to `IconChartBar`, `pi-calendar` to `IconCalendar`, `pi-circle` to `IconCircle`, `pi-prime` to `IconPrime`, `pi-eye` to `IconEye`, `pi-globe` to `IconGlobe`, `pi-briefcase` to `IconBriefcase`, `pi-user` to `IconUser`, `pi-sign-in` to `IconSignIn`, `pi-times-circle` to `IconTimesCircle`, `pi-lock` to `IconLock`, `pi-pencil` to `IconPencil`, `pi-exclamation-circle` to `IconExclamationCircle`, `pi-circle-off` to `IconCircleOff`, `pi-align-left` to `IconAlignLeft`, `pi-book` to `IconBook`, `pi-github` to `IconGithub`. Type the model: `const model = ref<MenuItem[]>([...])` importing `type { MenuItem }` from `./AppMenuItem.vue` (export the interface there in the next step). Delete the `class: 'rotated-icon'` entry on the Button item.

In `src/layout/AppMenuItem.vue`:
- Change `icon?: string;` to `icon?: Component;`, add `type Component` to the `vue` import, and export the interface (`export interface MenuItem`).
- Add `import { IconAngleDown } from '@/components/icons';`.
- Replace both `<i :class="item.icon" class="layout-menuitem-icon" />` with `<component :is="item.icon" v-if="item.icon" class="layout-menuitem-icon size-4 shrink-0" />` and both `<i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items" />` with `<IconAngleDown v-if="item.items" class="layout-submenu-toggler size-4" />`.

- [ ] **Step 3: Footer and SCSS**

`src/layout/AppFooter.vue`:
```vue
<template>
    <div class="layout-footer">
        SAKAI Vue TS on
        <a href="https://github.com/mrevjd/sakai-vue-ts" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">GitHub</a>
    </div>
</template>
```

In `src/assets/layout/_topbar.scss`:
- Line 59 block `i { font-size: 1.25rem; }` becomes `svg { width: 1.25rem; height: 1.25rem; }`.
- Line 143 block `i { font-size: 1rem; margin-right: 0.5rem; }` becomes `svg { width: 1rem; height: 1rem; margin-right: 0.5rem; }`.
- Delete the whole `.config-panel { ... }` block at the end of the file (lines 161 to 167 today); it references `--text-secondary-color`, which nothing defines, and no template renders those classes since Task 9 of Plan 1.

In `src/assets/layout/_menu.scss`, the `.layout-submenu-toggler` rule drops `font-size: 75%;` (the SVG carries its size). `.layout-menuitem-icon { margin-right: 0.5rem; }` stays.

- [ ] **Step 4: Verify and commit**

`grep -rn 'v-styleclass\|pi pi-\|pi-fw' src/layout src/components/FloatingConfigurator.vue` prints nothing. `grep -n 'text-secondary-color' src/assets/layout/_topbar.scss` prints nothing. The four verification commands (80 tests). Then `bun run dev`, open http://localhost:5173/, and check: the topbar renders lucide icons; the palette button opens the configurator popover under the button and clicking outside closes it; the profile button opens a dropdown with five entries; narrow the window below 992px and the ellipsis button shows and hides the action panel; the sidebar menu shows icons and chevrons and submenu chevrons rotate on open. Stop the dev server. If no browser is available, say so in the report.
```bash
git add src/layout/AppTopbar.vue src/layout/AppMenu.vue src/layout/AppMenuItem.vue src/layout/AppFooter.vue src/assets/layout/_topbar.scss src/assets/layout/_menu.scss
```
```bash
git commit -m "refactor: port the topbar, menu and footer to shadcn and lucide"
```

---

### Task 8: Dashboard widgets

**Files:**
- Modify: `src/components/dashboard/StatsWidget.vue`, `RecentSalesWidget.vue`, `BestSellingWidget.vue`, `RevenueStreamWidget.vue`, `NotificationsWidget.vue`, `src/views/Dashboard.vue`

**Interfaces:**
- Consumes: `DataTable`, `createColumns`, `AppChart`, `DropdownMenu*`, `Button`, the icon map, `resolvePrimary`, `resolveSurface`, `ProductService.getProductsSmall()`.

- [ ] **Step 1: StatsWidget**

Add `<script setup lang="ts">import { IconComment, IconDollar, IconShoppingCart, IconUsers } from '@/components/icons';</script>` above the template. Apply the class mapping (`text-muted-color` to `text-muted-foreground`, `text-surface-900 dark:text-surface-0` to `text-foreground`, `rounded-border` to `rounded-lg`) and replace the four glyphs: `<i class="pi pi-shopping-cart text-blue-500 text-xl!"></i>` with `<IconShoppingCart class="size-6 text-blue-500" />`, `pi-dollar` with `<IconDollar class="size-6 text-orange-500" />`, `pi-users` with `<IconUsers class="size-6 text-cyan-500" />`, `pi-comment` with `<IconComment class="size-6 text-purple-500" />`.

- [ ] **Step 2: RecentSalesWidget**

```vue
<script setup lang="ts">
    import { h, onMounted, ref } from 'vue';
    import { createColumns, DataTable } from '@/components/data-table';
    import { Button } from '@/components/ui/button';
    import { IconSearch } from '@/components/icons';
    import { ProductService } from '@/service/ProductService';
    import type { Product } from '@/service/types';

    type Row = Product & Record<string, unknown>;

    const products = ref<Row[]>([]);

    function formatCurrency(value: number): string {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    const helper = createColumns<Row>();
    const columns = helper.columns([
        helper.display({
            id: 'image',
            header: 'Image',
            cell: ({ row }) => h('img', { src: `https://primefaces.org/cdn/primevue/images/product/${row.original.image}`, alt: row.original.image, width: 50, class: 'shadow' })
        }),
        helper.accessor('name', { header: 'Name' }),
        helper.accessor('price', { header: 'Price', cell: (ctx) => formatCurrency(ctx.getValue()) }),
        helper.display({
            id: 'view',
            header: 'View',
            cell: () => h(Button, { variant: 'ghost', size: 'icon-sm', 'aria-label': 'View' }, () => h(IconSearch, { class: 'size-4' }))
        })
    ]);

    onMounted(() => {
        ProductService.getProductsSmall().then((data) => (products.value = data as Row[]));
    });
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Recent Sales</div>
        <DataTable :columns="columns" :data="products" row-key="id" paginator :page-size="5" />
    </div>
</template>
```

- [ ] **Step 3: BestSellingWidget and NotificationsWidget**

Both share the header pattern. In each, replace the script with:
```vue
<script setup lang="ts">
    import { Button } from '@/components/ui/button';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { IconEllipsisV, IconPlus, IconTrash } from '@/components/icons';

    const items = [
        { label: 'Add New', icon: IconPlus },
        { label: 'Remove', icon: IconTrash }
    ];
</script>
```
(NotificationsWidget additionally imports `IconArrowUp, IconDollar, IconDownload, IconHeart, IconQuestion`.) Replace the header's `<div>` holding the `Button` and `Menu` with:
```vue
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm" class="rounded-full" aria-label="Widget actions"><IconEllipsisV class="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="min-w-40">
                    <DropdownMenuItem v-for="item in items" :key="item.label"><component :is="item.icon" class="size-4" />{{ item.label }}</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
```
Apply the class mapping throughout both templates (`text-surface-900 dark:text-surface-0`, `text-surface-700 dark:text-surface-100`, `text-muted-color`, `bg-surface-300 dark:bg-surface-500`, `rounded-border`, `border-surface`). In NotificationsWidget replace the six glyphs: `<i class="pi pi-dollar text-xl! text-blue-500"></i>` with `<IconDollar class="size-6 text-blue-500" />` (twice), `pi-download` with `<IconDownload class="size-6 text-orange-500" />`, `pi-question` with `<IconQuestion class="size-6 text-pink-500" />`, `pi-arrow-up` with `<IconArrowUp class="size-6 text-green-500" />`, `pi-heart` with `<IconHeart class="size-6 text-purple-500" />`.

- [ ] **Step 4: RevenueStreamWidget on AppChart and the palette**

```vue
<script setup lang="ts">
    import type { ChartData, ChartOptions } from 'chart.js';
    import { computed, onMounted, ref, watch } from 'vue';
    import AppChart from '@/components/AppChart.vue';
    import { useLayout } from '@/layout/composables/layout';
    import { resolvePrimary, resolveSurface, type ThemeMode } from '@/utils/theme';
    import type { Shade } from '@/layout/palettes';

    const { layoutConfig, isDarkTheme } = useLayout();

    // Bar shades follow the picked primary palette; noir has no palette of its own and uses the surface scale.
    function primaryShade(key: Shade): string {
        const mode: ThemeMode = isDarkTheme.value ? 'dark' : 'light';
        const primary = resolvePrimary(layoutConfig.primary).palette[key];
        return primary ?? resolveSurface(layoutConfig.surface, mode).palette[key] ?? '#000000';
    }

    function buildData(): ChartData {
        return {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
                { type: 'bar', label: 'Subscriptions', backgroundColor: primaryShade('400'), data: [4000, 10000, 15000, 4000], barThickness: 32 },
                { type: 'bar', label: 'Advertising', backgroundColor: primaryShade('300'), data: [2100, 8400, 2400, 7500], barThickness: 32 },
                { type: 'bar', label: 'Affiliate', backgroundColor: primaryShade('200'), data: [4100, 5200, 3400, 7400], borderRadius: { topLeft: 8, topRight: 8 }, borderSkipped: true, barThickness: 32 }
            ]
        };
    }

    function buildOptions(): ChartOptions {
        const documentStyle = getComputedStyle(document.documentElement);
        const borderColor = documentStyle.getPropertyValue('--border');
        const textMutedColor = documentStyle.getPropertyValue('--muted-foreground');
        return {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            scales: {
                x: { stacked: true, ticks: { color: textMutedColor }, grid: { color: 'transparent' } },
                y: { stacked: true, ticks: { color: textMutedColor }, grid: { color: borderColor, drawTicks: false } }
            }
        };
    }

    // AppChart requires data, so the widget starts with a real object and swaps it once the DOM tokens are readable.
    const chartData = ref<ChartData>(buildData());
    const chartOptions = ref<ChartOptions>({ maintainAspectRatio: false, aspectRatio: 0.8 });
    const ready = computed(() => chartData.value.datasets.length > 0);

    function refresh(): void {
        chartData.value = buildData();
        chartOptions.value = buildOptions();
    }

    watch([() => layoutConfig.primary, () => layoutConfig.surface, () => layoutConfig.preset, isDarkTheme], refresh);
    onMounted(refresh);
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Revenue Stream</div>
        <AppChart v-if="ready" type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>
```
`grid.borderColor` was not a chart.js 4 option and is dropped.

- [ ] **Step 5: Dashboard.vue**

Add `lang="ts"` to its script tag; nothing else changes.

- [ ] **Step 6: Verify and commit**

`grep -rn 'pi pi-\|primevue\|text-surface\|text-muted-color\|rounded-border\|bg-surface' src/components/dashboard src/views/Dashboard.vue` prints nothing. The four verification commands (80 tests). Browser check if available: the dashboard renders four stat cards with icons, a paginated recent-sales table with five rows and sort arrows, a bar chart whose colours follow a primary pick, and two widget dropdowns.
```bash
git add src/components/dashboard src/views/Dashboard.vue
```
```bash
git commit -m "refactor: port the dashboard widgets to shadcn, DataTable and AppChart"
```

---

### Task 9: Crud

**Files:**
- Modify: `src/views/pages/Crud.vue`

**Interfaces:**
- Consumes: `DataTable` (selection, global filter, paginator, `visibleRows()`), `Toolbar`, `StarRating`, `Badge` variants, `Dialog*`, `Input`, `Textarea`, `Select*`, `RadioGroup*`, `NumberField*`, `Label`, `useToast`, `useConfirm`, `toCsv`/`downloadCsv`, the icon map.

- [ ] **Step 1: Replace the file**

```vue
<script setup lang="ts">
    import { computed, h, onMounted, ref } from 'vue';
    import AppToolbar from '@/components/Toolbar.vue';
    import StarRating from '@/components/StarRating.vue';
    import { createColumns, DataTable } from '@/components/data-table';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field';
    import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Textarea } from '@/components/ui/textarea';
    import { IconExclamationTriangle, IconPencil, IconPlus, IconSearch, IconTrash, IconUpload } from '@/components/icons';
    import { useConfirm } from '@/composables/useConfirm';
    import { useToast } from '@/composables/useToast';
    import { ProductService } from '@/service/ProductService';
    import type { Product } from '@/service/types';
    import { downloadCsv, toCsv } from '@/utils/csv';

    type Row = Product & Record<string, unknown>;
    type Draft = Partial<Product>;

    const toast = useToast();
    const confirm = useConfirm();
    const table = ref<InstanceType<typeof DataTable<Row>> | null>(null);

    const products = ref<Row[]>([]);
    const selectedProducts = ref<Row[]>([]);
    const globalFilter = ref('');
    const productDialog = ref(false);
    const product = ref<Draft>({});
    const submitted = ref(false);

    const statuses = [
        { label: 'INSTOCK', value: 'INSTOCK' },
        { label: 'LOWSTOCK', value: 'LOWSTOCK' },
        { label: 'OUTOFSTOCK', value: 'OUTOFSTOCK' }
    ] as const;
    const categories = ['Accessories', 'Clothing', 'Electronics', 'Fitness'];

    onMounted(() => {
        ProductService.getProducts().then((data) => (products.value = data as Row[]));
    });

    function formatCurrency(value: number | undefined): string {
        return value === undefined ? '' : value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    function statusVariant(status: Product['inventoryStatus']): 'success' | 'warning' | 'destructive' {
        if (status === 'INSTOCK') return 'success';
        if (status === 'LOWSTOCK') return 'warning';
        return 'destructive';
    }

    const helper = createColumns<Row>();
    const columns = helper.columns([
        helper.accessor('code', { header: 'Code' }),
        helper.accessor('name', { header: 'Name' }),
        helper.display({
            id: 'image',
            header: 'Image',
            cell: ({ row }) => h('img', { src: `https://primefaces.org/cdn/primevue/images/product/${row.original.image}`, alt: row.original.image, class: 'rounded', style: 'width: 64px' })
        }),
        helper.accessor('price', { header: 'Price', cell: (ctx) => formatCurrency(ctx.getValue()) }),
        helper.accessor('category', { header: 'Category' }),
        helper.accessor('rating', { header: 'Reviews', cell: (ctx) => h(StarRating, { modelValue: ctx.getValue(), readonly: true }) }),
        helper.accessor('inventoryStatus', { header: 'Status', cell: (ctx) => h(Badge, { variant: statusVariant(ctx.getValue()) }, () => ctx.getValue()) }),
        helper.display({
            id: 'actions',
            header: '',
            cell: ({ row }) =>
                h('div', { class: 'flex gap-2' }, [
                    h(Button, { variant: 'outline', size: 'icon', class: 'rounded-full', 'aria-label': 'Edit', onClick: () => editProduct(row.original) }, () => h(IconPencil, { class: 'size-4' })),
                    h(Button, { variant: 'outline', size: 'icon', class: 'rounded-full text-destructive', 'aria-label': 'Delete', onClick: () => confirmDeleteProduct(row.original) }, () => h(IconTrash, { class: 'size-4' }))
                ])
        })
    ]);

    const hasSelection = computed(() => selectedProducts.value.length > 0);

    function openNew(): void {
        product.value = {};
        submitted.value = false;
        productDialog.value = true;
    }

    function hideDialog(): void {
        productDialog.value = false;
        submitted.value = false;
    }

    function createId(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: 5 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    function saveProduct(): void {
        submitted.value = true;
        if (!product.value.name?.trim()) return;

        if (product.value.id) {
            products.value = products.value.map((item) => (item.id === product.value.id ? ({ ...item, ...product.value } as Row) : item));
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        } else {
            const created: Row = {
                id: createId(),
                code: createId(),
                name: product.value.name,
                description: product.value.description ?? '',
                image: 'product-placeholder.svg',
                price: product.value.price ?? 0,
                category: product.value.category ?? categories[0]!,
                quantity: product.value.quantity ?? 0,
                inventoryStatus: product.value.inventoryStatus ?? 'INSTOCK',
                rating: product.value.rating ?? 0
            };
            products.value = [...products.value, created];
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        }
        productDialog.value = false;
        product.value = {};
    }

    function editProduct(item: Product): void {
        product.value = { ...item };
        productDialog.value = true;
    }

    function confirmDeleteProduct(item: Product): void {
        confirm.require({
            header: 'Confirm',
            message: `Are you sure you want to delete ${item.name}?`,
            icon: IconExclamationTriangle,
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptVariant: 'destructive',
            accept: () => {
                products.value = products.value.filter((row) => row.id !== item.id);
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
            }
        });
    }

    function confirmDeleteSelected(): void {
        confirm.require({
            header: 'Confirm',
            message: 'Are you sure you want to delete the selected products?',
            icon: IconExclamationTriangle,
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptVariant: 'destructive',
            accept: () => {
                const ids = new Set(selectedProducts.value.map((row) => row.id));
                products.value = products.value.filter((row) => !ids.has(row.id));
                selectedProducts.value = [];
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
            }
        });
    }

    function exportCSV(): void {
        const rows = table.value?.visibleRows() ?? products.value;
        const csv = toCsv(rows, [
            { key: 'code', header: 'Code' },
            { key: 'name', header: 'Name' },
            { key: 'price', header: 'Price' },
            { key: 'category', header: 'Category' },
            { key: 'rating', header: 'Reviews' },
            { key: 'inventoryStatus', header: 'Status' }
        ]);
        downloadCsv('products.csv', csv);
    }
</script>

<template>
    <div>
        <div class="card">
            <AppToolbar class="mb-6">
                <template #start>
                    <Button variant="secondary" @click="openNew"><IconPlus class="size-4" />New</Button>
                    <Button variant="secondary" :disabled="!hasSelection" @click="confirmDeleteSelected"><IconTrash class="size-4" />Delete</Button>
                </template>
                <template #end>
                    <Button variant="secondary" @click="exportCSV"><IconUpload class="size-4" />Export</Button>
                </template>
            </AppToolbar>

            <DataTable ref="table" v-model:selection="selectedProducts" v-model:global-filter="globalFilter" :columns="columns" :data="products" row-key="id" selectable paginator :page-size="10" :page-size-options="[5, 10, 25]" report-template="Showing {first} to {last} of {totalRecords} products">
                <template #header>
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h4 class="m-0">Manage Products</h4>
                        <div class="relative">
                            <IconSearch class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input v-model="globalFilter" placeholder="Search..." class="pl-8" />
                        </div>
                    </div>
                </template>
            </DataTable>
        </div>

        <Dialog v-model:open="productDialog">
            <DialogContent class="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Product Details</DialogTitle>
                </DialogHeader>
                <div class="flex flex-col gap-6">
                    <img v-if="product.image" :src="`https://primefaces.org/cdn/primevue/images/product/${product.image}`" :alt="product.image" class="m-auto block pb-4" />
                    <div>
                        <Label for="name" class="mb-3 block font-bold">Name</Label>
                        <Input id="name" v-model.trim="product.name" required autofocus :aria-invalid="submitted && !product.name" />
                        <small v-if="submitted && !product.name" class="text-destructive">Name is required.</small>
                    </div>
                    <div>
                        <Label for="description" class="mb-3 block font-bold">Description</Label>
                        <Textarea id="description" v-model="product.description" rows="3" />
                    </div>
                    <div>
                        <Label for="inventoryStatus" class="mb-3 block font-bold">Inventory Status</Label>
                        <Select v-model="product.inventoryStatus">
                            <SelectTrigger id="inventoryStatus" class="w-full"><SelectValue placeholder="Select a Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="status in statuses" :key="status.value" :value="status.value">{{ status.label }}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <span class="mb-4 block font-bold">Category</span>
                        <RadioGroup v-model="product.category" class="grid grid-cols-2 gap-4">
                            <div v-for="category in categories" :key="category" class="flex items-center gap-2">
                                <RadioGroupItem :id="`category-${category}`" :value="category" />
                                <Label :for="`category-${category}`">{{ category }}</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <Label for="price" class="mb-3 block font-bold">Price</Label>
                            <NumberField id="price" v-model="product.price" :min="0" :format-options="{ style: 'currency', currency: 'USD', currencyDisplay: 'symbol' }">
                                <NumberFieldContent>
                                    <NumberFieldDecrement />
                                    <NumberFieldInput />
                                    <NumberFieldIncrement />
                                </NumberFieldContent>
                            </NumberField>
                        </div>
                        <div>
                            <Label for="quantity" class="mb-3 block font-bold">Quantity</Label>
                            <NumberField id="quantity" v-model="product.quantity" :min="0" :step="1" :format-options="{ maximumFractionDigits: 0 }">
                                <NumberFieldContent>
                                    <NumberFieldDecrement />
                                    <NumberFieldInput />
                                    <NumberFieldIncrement />
                                </NumberFieldContent>
                            </NumberField>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" @click="hideDialog">Cancel</Button>
                    <Button @click="saveProduct">Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>
```
The two PrimeVue confirmation dialogs are replaced by `useConfirm().require(...)`, which the `ConfirmDialogHost` in `App.vue` renders. `FilterMatchMode` and `primevue/usetoast` are gone.

- [ ] **Step 2: Verify**

`grep -n 'primevue\|pi pi-\|FilterMatchMode' src/views/pages/Crud.vue` prints nothing. The four verification commands (80 tests). If `vue-tsc` rejects `InstanceType<typeof DataTable<Row>>`, type the ref as `ref<{ visibleRows: () => Row[] } | null>(null)` and say so in the report.

Browser check if available, at `/pages/crud`: the table lists products with star ratings and coloured status badges; the search box filters; New opens the dialog, Save with an empty name shows the error, Save with a name adds a row and a toast appears at top right; Delete on a row opens the confirm dialog and Yes removes the row with a toast; selecting rows enables the toolbar Delete; Export downloads `products.csv` (open it: a header row, one line per visible product, and no cell starting with `=`), which also settles the deferred question about the synchronous URL revoke.

- [ ] **Step 3: Commit**

```bash
git add src/views/pages/Crud.vue
```
```bash
git commit -m "refactor: port Crud to DataTable, shadcn dialogs and the toast and confirm shims"
```

---

### Task 10: Auth pages, NotFound and Empty

**Files:**
- Modify: `src/views/pages/auth/Login.vue`, `Access.vue`, `Error.vue`, `src/views/pages/NotFound.vue`, `src/views/pages/Empty.vue`

- [ ] **Step 1: Login**

Keep the `<svg>` logo block byte for byte. Replace the script and the form portion:
```vue
<script setup lang="ts">
    import { ref } from 'vue';
    import { RouterLink } from 'vue-router';
    import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
    import PasswordInput from '@/components/PasswordInput.vue';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';

    const email = ref('');
    const password = ref('');
    const checked = ref(false);
</script>
```
Template changes: the outer `bg-surface-50 dark:bg-surface-950` becomes `bg-background`; `bg-surface-0 dark:bg-surface-900` becomes `bg-card`; the two `text-surface-900 dark:text-surface-0` become `text-foreground`; `text-muted-color` becomes `text-muted-foreground`; `var(--primary-color)` in the gradient and the SVG fills stays (the SCSS still aliases it). The form becomes:
```vue
                    <div>
                        <Label for="email1" class="mb-2 block text-xl font-medium text-foreground">Email</Label>
                        <Input id="email1" v-model="email" type="text" placeholder="Email address" class="mb-8 w-full md:w-[30rem]" />

                        <Label for="password1" class="mb-2 block text-xl font-medium text-foreground">Password</Label>
                        <PasswordInput id="password1" v-model="password" placeholder="Password" :feedback="false" class="mb-4" />

                        <div class="mt-2 mb-8 flex items-center justify-between gap-8">
                            <div class="flex items-center gap-2">
                                <Checkbox id="rememberme1" v-model="checked" />
                                <Label for="rememberme1">Remember me</Label>
                            </div>
                            <span class="ml-2 cursor-pointer text-right font-medium text-primary no-underline">Forgot password?</span>
                        </div>
                        <Button as-child class="w-full"><RouterLink to="/">Sign In</RouterLink></Button>
                    </div>
```
Delete the scoped `<style>` block (it styled PrimeIcons eye glyphs).

- [ ] **Step 2: Access and Error**

Both: add `lang="ts"`, import `{ RouterLink } from 'vue-router'`, `{ Button } from '@/components/ui/button'` and the icon (`IconLock` for Access, `IconExclamationCircle` for Error). Apply the class mapping (`bg-surface-50 dark:bg-surface-950` to `bg-background`, `bg-surface-0 dark:bg-surface-900` to `bg-card`, `text-surface-900 dark:text-surface-0` to `text-foreground`, `text-muted-color` to `text-muted-foreground`). Replace `<i class="text-orange-500 pi pi-fw pi-lock text-xxl!"></i>` with `<IconLock class="size-6 text-orange-500" />` and `<i class="pi pi-fw pi-exclamation-circle text-xxl! text-pink-500"></i>` with `<IconExclamationCircle class="size-6 text-pink-500" />`. Replace `<Button as="router-link" label="Go to Dashboard" to="/" severity="warn" />` with `<Button as-child variant="warning"><RouterLink to="/">Go to Dashboard</RouterLink></Button>` and the Error page's `severity="danger"` form with `variant="destructive"`.

- [ ] **Step 3: NotFound**

Add `lang="ts"`, import `RouterLink`, `Button`, and `{ IconQuestionCircle, IconTable, IconUnlock }`. Keep the `<svg>` block. Apply the mapping (`bg-surface-0 dark:bg-surface-900` to `bg-card`, `text-surface-900 dark:text-surface-0` to `text-foreground`, `text-surface-600 dark:text-surface-200` to `text-muted-foreground`, `border-surface-300 dark:border-surface-500` to `border-border`, `rounded-border` to `rounded-lg`). `var(--surface-ground)` in the gradient stays. Replace the three glyphs with `<IconTable class="size-6" />`, `<IconQuestionCircle class="size-6" />`, `<IconUnlock class="size-6" />`, and the final button with `<Button as-child><RouterLink to="/">Go to Dashboard</RouterLink></Button>`.

- [ ] **Step 4: Empty**

Change `<div className="card">` to `<div class="card">` (a React attribute that Vue ignored, so the card styling never applied).

- [ ] **Step 5: Verify and commit**

`grep -rn 'primevue\|pi pi-\|text-surface\|bg-surface\|text-muted-color\|rounded-border\|border-surface' src/views/pages/auth src/views/pages/NotFound.vue src/views/pages/Empty.vue` prints nothing. The four verification commands (80 tests). Browser check if available: `/auth/login` shows the password eye toggle working and the Sign In button navigating home; `/auth/access`, `/auth/error` and `/pages/notfound` render their icons, cards and buttons; `/pages/empty` now renders inside a card.
```bash
git add src/views/pages/auth src/views/pages/NotFound.vue src/views/pages/Empty.vue
```
```bash
git commit -m "refactor: port the auth, not-found and empty pages to shadcn"
```

---

### Task 11: Landing page and widgets

**Files:**
- Modify: `src/views/pages/Landing.vue`, `src/components/landing/TopbarWidget.vue`, `HeroWidget.vue`, `FeaturesWidget.vue`, `HighlightsWidget.vue`, `PricingWidget.vue`, `FooterWidget.vue`

- [ ] **Step 1: TopbarWidget**

Keep the `<svg>` block. Replace the script with:
```vue
<script setup lang="ts">
    import { onClickOutside } from '@vueuse/core';
    import { ref } from 'vue';
    import { RouterLink } from 'vue-router';
    import { Button } from '@/components/ui/button';
    import { IconBars } from '@/components/icons';

    const menuOpen = ref(false);
    const rootRef = ref<HTMLElement | null>(null);
    onClickOutside(rootRef, () => {
        menuOpen.value = false;
    });

    function smoothScroll(id: string): void {
        menuOpen.value = false;
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
</script>
```
Wrap the template's existing top-level nodes in `<div ref="rootRef" class="contents">`. Replace the `v-styleclass` `Button` with `<Button variant="ghost" size="icon-lg" class="rounded-full lg:hidden!" aria-label="Toggle navigation" @click="menuOpen = !menuOpen"><IconBars class="size-6" /></Button>`. On the menu `div`, replace `hidden lg:flex` with `lg:flex` and add `:class="{ hidden: !menuOpen }"`. Apply the mapping (`text-surface-900 dark:text-surface-0` to `text-foreground`, `bg-surface-0 dark:bg-surface-900` to `bg-card`, `border-surface` to `border-border`, `rounded-border` to `rounded-lg`). Replace the two buttons with `<Button as-child variant="ghost" class="rounded-full"><RouterLink to="/auth/login">Login</RouterLink></Button>` and `<Button as-child class="rounded-full"><RouterLink to="/auth/login">Register</RouterLink></Button>`.

- [ ] **Step 2: HeroWidget**

Add `<script setup lang="ts">import { RouterLink } from 'vue-router'; import { Button } from '@/components/ui/button';</script>`. Replace the button with `<Button as-child size="lg" class="mt-8 rounded-full px-4! text-xl!"><RouterLink to="/">Get Started</RouterLink></Button>`. The fixed light gradient and `text-gray-*` classes stay; the section is a designed light panel in both modes.

- [ ] **Step 3: FeaturesWidget and HighlightsWidget**

Add `<script setup lang="ts">` importing the icons each uses: Features `IconEye, IconGlobe, IconIdCard, IconMap, IconMobile, IconMoon, IconPalette, IconShoppingCart, IconStar, IconUsers`; Highlights `IconDesktop, IconMobile`. Apply the mapping (`text-surface-900 dark:text-surface-0` to `text-foreground`, `text-muted-color` to `text-muted-foreground`, `bg-surface-0 dark:bg-surface-900` to `bg-card`, `text-surface-600 dark:text-surface-200` to `text-muted-foreground`, `text-surface-700 dark:text-surface-100` to `text-foreground`). Replace each glyph, keeping its colour class: Features `<i class="pi pi-fw pi-users text-xxl! text-yellow-700"></i>` with `<IconUsers class="size-6 text-yellow-700" />`, and likewise `pi-palette` cyan-700, `pi-map` indigo-700, `pi-id-card` slate-700, `pi-star` orange-700, `pi-moon` pink-700, `pi-shopping-cart` teal-700, `pi-globe` blue-700, `pi-eye` purple-700; Highlights `<i class="pi pi-fw pi-mobile text-4xl! text-purple-700"></i>` with `<IconMobile class="size-9 text-purple-700" />` and `pi-desktop text-3xl! text-yellow-700` with `<IconDesktop class="size-8 text-yellow-700" />`. The gradient panels and `text-gray-*` testimonial block stay.

- [ ] **Step 4: PricingWidget**

Add `<script setup lang="ts">import { Button } from '@/components/ui/button'; import { Separator } from '@/components/ui/separator'; import { IconCheck } from '@/components/icons';</script>`. Apply the mapping (`text-surface-900 dark:text-surface-0` to `text-foreground`, `text-muted-color` to `text-muted-foreground`, `text-surface-600 dark:text-surface-200` to `text-muted-foreground`, `border-surface-200 dark:border-surface-600` to `border-border`). Replace each `<Button label="Get Started" class="p-button-rounded border-0 ml-4 font-light leading-tight bg-blue-500 text-white"></Button>` with `<Button class="ml-4 rounded-full bg-blue-500 font-light text-white hover:bg-blue-500/90">Get Started</Button>`, each `<Divider class="w-full bg-surface-200"></Divider>` with `<Separator class="w-full" />`, and each `<i class="pi pi-fw pi-check text-xl text-cyan-500 mr-2"></i>` with `<IconCheck class="mr-2 inline size-5 text-cyan-500" />`.

- [ ] **Step 5: FooterWidget and Landing.vue**

FooterWidget: keep the `<svg>` block; apply the mapping (`text-surface-900 dark:text-surface-0` to `text-foreground`, `text-surface-700 dark:text-surface-100` to `text-foreground`). Landing.vue: `bg-surface-0 dark:bg-surface-900` becomes `bg-card`.

- [ ] **Step 6: Verify and commit**

`grep -rn 'primevue\|pi pi-\|v-styleclass\|text-surface\|bg-surface\|text-muted-color\|rounded-border\|border-surface\|<Divider' src/components/landing src/views/pages/Landing.vue` prints nothing. The four verification commands (80 tests). Browser check if available at `/landing`: the nav links scroll to their sections; below 992px the bars button shows and hides the nav; every feature card has its icon; the pricing cards show separators and check icons; the footer renders.
```bash
git add src/components/landing src/views/pages/Landing.vue
```
```bash
git commit -m "refactor: port the landing page widgets to shadcn and lucide"
```

---

### Task 12: Phase gate for Plan 2

**Files:**
- None modified.

- [ ] **Step 1: No application page reaches PrimeVue**

Run: `grep -rln "primevue\|pi pi-\|pi-fw\|v-styleclass\|FilterMatchMode" src/views/pages src/views/Dashboard.vue src/components/dashboard src/components/landing src/layout src/components/FloatingConfigurator.vue src/App.vue`
Expected: only `src/views/pages/Documentation.vue` (its prose and code samples mention PrimeVue until Plan 4 rewrites it) and `src/layout/AppLayout.vue` (the `<Toast />` that stays until Plan 3). Anything else is a missed port.

Run: `grep -rn "text-surface\|bg-surface\|text-muted-color\|rounded-border\|bg-highlight\|border-surface" src/views/pages src/views/Dashboard.vue src/components/dashboard src/components/landing src/layout src/components/FloatingConfigurator.vue | grep -v Documentation.vue`
Expected: no output.

- [ ] **Step 2: Full verification**

`bun run type-check` exit 0; `bun run lint` 0 errors; `bun run test` reports `Test Files 17 passed (17)` and 80 tests; `bun run build` succeeds.

- [ ] **Step 3: Browser pass**

If a browser is available: every route in light and dark mode and at desktop and mobile widths: `/`, `/pages/crud` (including an Export download opened in a spreadsheet), `/auth/login`, `/auth/access`, `/auth/error`, `/pages/notfound`, `/pages/empty`, `/landing`; the configurator popover from both the topbar and the floating button; the Nora preset on the Crud dialog inputs (2.25rem controls). Also two PrimeVue pages, `/uikit/input` and `/uikit/table`, to confirm they still render. If no browser is available, say so.

- [ ] **Step 4: Report**

No commit. Reply with the grep results, the verification output and the browser observations. Plan 3 is written from this state.

---

## Self-review against the spec

- Spec 5.10 application pages: Crud (Task 9), Login (Task 10), dashboard widgets (Task 8), Landing (Task 11), Access, Error, NotFound, Empty (Task 10), FloatingConfigurator (Task 6). Documentation is left for Plan 4's rewrite; its classes are swept in Plan 3 with `tailwindcss-primeui`. `AppFooter` link (Task 7).
- Spec 5.7 gap components used here: `Toolbar` (Task 5), `StarRating` (Task 4), `PasswordInput` with `passwordStrength` (Task 3); `Divider` is not needed by any application page (Pricing uses `Separator` directly) and stays in Plan 3 with PanelsDoc. `Badge` and `Button` variants (Task 1).
- Spec 5.8 layout phase A: popovers replace `v-styleclass` (Tasks 6, 7), mobile menus become ref toggles (Tasks 7, 11), the profile `Menu` becomes `DropdownMenu` (Task 7), `AppMenuItem` renders icon components (Task 7).
- Spec 5.12 icons: the map (Task 2) covers every glyph in the ported files; the two `pi-github` links use `ExternalLink` because lucide has no brand icons.
- Plan 1 deferred items: `_topbar.scss:164` and the dead `.config-panel` block (Task 7), `resolveSurface` in the configurator (Task 6), `shallowReadonly` (Task 5), the `RevenueStreamWidget` null guard (Task 8), the synchronous revoke check (Task 9 browser step).
- Names consistent across tasks: `IconX` exports from `@/components/icons`, `passwordStrength`, `PasswordInput` props `id`, `placeholder`, `toggleMask`, `feedback`, `disabled`; `StarRating` model `number | null` with `stars`, `readonly`, `disabled`; `Toolbar` slots `start`, `center`, `end`; `confirmState` remains the exported name.
- Test counts: 64 + 2 (variants) + 1 (icons) + 4 + 4 (password) + 4 (rating) + 1 (host icon) = 80 tests in 17 files.
