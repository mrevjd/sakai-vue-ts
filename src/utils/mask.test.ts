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
