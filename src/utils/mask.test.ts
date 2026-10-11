import { describe, expect, it } from 'vitest';
import { applyMask, isMaskComplete, maskUnmasked } from './mask';

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

    describe('with a mask whose literals include a digit', () => {
        const mask = '+1 (999) 999-9999';

        it('is idempotent when fed its own output', () => {
            for (const raw of ['', '5', '55', '5551234', '5551234567']) {
                const once = applyMask(raw, mask).display;
                expect(applyMask(once, mask).display).toBe(once);
                expect(applyMask(applyMask(once, mask).display, mask).display).toBe(once);
            }
        });

        it('does not consume the literal 1 as input when keystrokes are appended to the display', () => {
            let display = applyMask('', mask).display;
            for (const key of ['5', '5', '5']) display = applyMask(display + key, mask).display;
            expect(display).toBe('+1 (555) ___-____');
            expect(applyMask(display, mask).unmasked).toBe('555');
        });

        it('still accepts a 1 typed into a placeholder position', () => {
            expect(applyMask('+1 (5__) ___-____1', mask).display).toBe('+1 (51_) ___-____');
        });
    });
});

describe('maskUnmasked', () => {
    it('places every character as input, even one equal to a literal at the same index', () => {
        // An unmask-mode model holds only typed characters, so '21' is two digits, not a 2 and the literal 1.
        expect(maskUnmasked('21', '+1 (999) 999-9999').display).toBe('+1 (21_) ___-____');
        expect(maskUnmasked('9123456789', '(999) 999-9999').display).toBe('(912) 345-6789');
        expect(maskUnmasked('', '99/99').display).toBe('__/__');
    });
});

describe('isMaskComplete', () => {
    it('is true only when no slot character is left in the required part', () => {
        expect(isMaskComplete('(912) 345-6789', '(999) 999-9999')).toBe(true);
        expect(isMaskComplete('(912) 345-678_', '(999) 999-9999')).toBe(false);
        expect(isMaskComplete('99', '99?-99')).toBe(true);
    });
});
