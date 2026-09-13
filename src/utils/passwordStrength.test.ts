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
