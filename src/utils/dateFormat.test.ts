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
        expect(formatDate(date, "'Day' dd")).toBe('Day 06');
        expect(formatDate(null, 'mm/dd/yy')).toBe('');
    });
});
