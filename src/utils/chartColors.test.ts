import { describe, expect, it } from 'vitest';
import { chartShade, paletteShade } from './chartColors';

describe('paletteShade', () => {
    it('reads a named primary palette', () => {
        expect(paletteShade('indigo', '500')).toBe('#6366f1');
        expect(paletteShade('purple', '400')).toBe('#c084fc');
    });

    it('falls back to the foreground token for an unknown palette', () => {
        expect(paletteShade('nope', '500')).toBe('var(--foreground)');
    });
});

describe('chartShade', () => {
    it('uses the picked primary palette', () => {
        expect(chartShade('emerald', 'slate', 'light', '500')).toBe('#10b981');
    });

    it('falls back to the surface scale for noir, which has no palette of its own', () => {
        expect(chartShade('noir', 'slate', 'light', '500')).toBe('#64748b');
        expect(chartShade('noir', null, 'dark', '500')).toBe('#71717a');
    });
});
