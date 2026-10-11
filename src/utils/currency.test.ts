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
