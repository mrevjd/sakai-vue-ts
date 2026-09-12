import { describe, expect, it } from 'vitest';
import { applyTheme } from './theme';

describe('applyTheme', () => {
    it('writes the token record onto the root element as inline custom properties', () => {
        applyTheme({ preset: 'Aura', primary: 'emerald', surface: null, darkTheme: false });
        const style = document.documentElement.style;
        expect(style.getPropertyValue('--primary')).toBe('#10b981');
        expect(style.getPropertyValue('--background')).toBe('#f1f5f9');
        expect(style.getPropertyValue('--radius')).toBe('6px');
    });

    it('overwrites the same properties on the next call', () => {
        applyTheme({ preset: 'Nora', primary: 'blue', surface: 'zinc', darkTheme: true });
        const style = document.documentElement.style;
        expect(style.getPropertyValue('--primary')).toBe('#60a5fa');
        expect(style.getPropertyValue('--background')).toBe('#09090b');
        expect(style.getPropertyValue('--radius')).toBe('2px');
    });
});
