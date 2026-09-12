import { describe, expect, it } from 'vitest';
import { DEFAULT_LAYOUT_CONFIG, parseLayoutConfig } from './layoutConfig';

describe('parseLayoutConfig', () => {
    it('returns the defaults for null, empty and corrupt input', () => {
        expect(parseLayoutConfig(null)).toEqual(DEFAULT_LAYOUT_CONFIG);
        expect(parseLayoutConfig('')).toEqual(DEFAULT_LAYOUT_CONFIG);
        expect(parseLayoutConfig('{not json')).toEqual(DEFAULT_LAYOUT_CONFIG);
        expect(parseLayoutConfig('42')).toEqual(DEFAULT_LAYOUT_CONFIG);
    });

    it('round-trips a valid config', () => {
        const stored = { preset: 'Nora', primary: 'blue', surface: 'ocean', darkTheme: true, menuMode: 'overlay' };
        expect(parseLayoutConfig(JSON.stringify(stored))).toEqual(stored);
    });

    it('drops unknown keys and replaces wrong types field by field', () => {
        const parsed = parseLayoutConfig(JSON.stringify({ preset: 7, primary: ['x'], surface: 3, darkTheme: 'yes', menuMode: null, extra: true }));
        expect(parsed).toEqual(DEFAULT_LAYOUT_CONFIG);
        expect(Object.keys(parsed)).toHaveLength(5);
    });

    it('rejects names that are not a known preset, palette or menu mode', () => {
        const parsed = parseLayoutConfig(JSON.stringify({ preset: 'Material', primary: 'mauve', surface: 'sand', menuMode: 'icon', darkTheme: true }));
        expect(parsed).toEqual({ ...DEFAULT_LAYOUT_CONFIG, darkTheme: true });
    });
});
