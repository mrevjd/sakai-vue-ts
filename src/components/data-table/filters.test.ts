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
