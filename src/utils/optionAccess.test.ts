import { describe, expect, it } from 'vitest';
import { deepEquals, optionLabel, optionValue, sameOption } from './optionAccess';

describe('deepEquals', () => {
    it('ignores field order but not array order', () => {
        expect(deepEquals({ name: 'Amy', id: 1 }, { id: 1, name: 'Amy' })).toBe(true);
        expect(deepEquals([1, 2], [2, 1])).toBe(false);
        expect(deepEquals({ tags: ['a', 'b'] }, { tags: ['a', 'b'] })).toBe(true);
    });

    it('compares Dates by time', () => {
        expect(deepEquals(new Date(2026, 0, 1), new Date(2026, 0, 1))).toBe(true);
        expect(deepEquals(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(false);
        expect(deepEquals(new Date(2026, 0, 1), {})).toBe(false);
    });

    it('keeps arrays, objects and null apart', () => {
        expect(deepEquals(['a'], { 0: 'a' })).toBe(false);
        expect(deepEquals(null, {})).toBe(false);
        expect(deepEquals(null, null)).toBe(true);
    });

    it('treats a missing field and an undefined one as different', () => {
        expect(deepEquals({ a: 1, b: undefined }, { a: 1 })).toBe(false);
        expect(deepEquals({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });
});

describe('sameOption', () => {
    it('compares by the option key when one is given, otherwise structurally', () => {
        expect(sameOption({ code: 'NY', name: 'New York' }, { code: 'NY', name: 'Renamed' }, 'code')).toBe(true);
        expect(sameOption({ code: 'NY', name: 'New York' }, { name: 'New York', code: 'NY' })).toBe(true);
        expect(sameOption({ code: 'NY' }, { code: 'RM' })).toBe(false);
    });
});

describe('optionLabel and optionValue', () => {
    it('read the key from an object option and fall back to the option itself', () => {
        expect(optionLabel({ name: 'Rome' }, 'name')).toBe('Rome');
        expect(optionLabel('Rome')).toBe('Rome');
        expect(optionLabel(null)).toBe('');
        expect(optionValue({ code: 'RM' }, 'code')).toBe('RM');
        expect(optionValue('RM')).toBe('RM');
    });
});
