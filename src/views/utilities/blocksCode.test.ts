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
