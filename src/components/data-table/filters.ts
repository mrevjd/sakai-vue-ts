import type { FilterFn, Row, RowData, TableFeatures } from '@tanstack/vue-table';
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
// Generic over the feature set rather than typed `FilterFn<DataTableFeatures, RowData>`: features.ts
// registers this function, so naming DataTableFeatures here would put it inside its own type's
// initializer (TS2502). The generic still unifies with the `filterFns` slot's `FilterFn<any, any>`.
export function matchModeFilter<TFeatures extends TableFeatures, TData extends RowData>(row: Row<TFeatures, TData>, columnId: string, filterValue: MatchModeFilterValue | undefined): boolean {
    if (!filterValue || isEmpty(filterValue.value)) return true;
    return predicates[filterValue.matchMode](row.getValue(columnId), filterValue.value);
}
