import { describe, expect, it } from 'vitest';
import { primaryPalettes, surfacePalettes } from '@/layout/palettes';
import { PRESET_TOKENS, presetVars, PRIMARY_TOKENS, primaryVars, resolvePreset, resolvePrimary, resolveSurface, SURFACE_TOKENS, surfaceVars, themeVars } from './theme';

const emerald = primaryPalettes.find((p) => p.name === 'emerald')!;
const noir = primaryPalettes.find((p) => p.name === 'noir')!;
const slate = surfacePalettes.find((s) => s.name === 'slate')!.palette;
const zinc = surfacePalettes.find((s) => s.name === 'zinc')!.palette;

describe('resolvePrimary and resolveSurface', () => {
    it('falls back to emerald for an unknown primary', () => {
        expect(resolvePrimary('nope').name).toBe('emerald');
        expect(resolvePrimary('blue').name).toBe('blue');
    });

    it('uses slate in light and zinc in dark when no surface is chosen or the name is unknown', () => {
        expect(resolveSurface(null, 'light').name).toBe('slate');
        expect(resolveSurface(null, 'dark').name).toBe('zinc');
        expect(resolveSurface('nope', 'light').name).toBe('slate');
        expect(resolveSurface('ocean', 'dark').name).toBe('ocean');
    });
});

describe('primaryVars', () => {
    it('uses shade 500 on white in light mode', () => {
        const vars = primaryVars(emerald, 'light', slate);
        expect(vars['--primary']).toBe('#10b981');
        expect(vars['--primary-foreground']).toBe('#ffffff');
        expect(vars['--ring']).toBe('#10b981');
        expect(vars['--chart-1']).toBe('#10b981');
    });

    it('uses shade 400 on the surface 900 shade in dark mode', () => {
        const vars = primaryVars(emerald, 'dark', zinc);
        expect(vars['--primary']).toBe('#34d399');
        expect(vars['--primary-foreground']).toBe('#18181b');
    });

    it('maps noir onto the surface scale', () => {
        expect(primaryVars(noir, 'light', slate)['--primary']).toBe('#020617');
        expect(primaryVars(noir, 'light', slate)['--primary-foreground']).toBe('#ffffff');
        expect(primaryVars(noir, 'dark', slate)['--primary']).toBe('#f8fafc');
        expect(primaryVars(noir, 'dark', slate)['--primary-foreground']).toBe('#020617');
    });

    it('returns exactly the documented primary tokens', () => {
        expect(Object.keys(primaryVars(emerald, 'light', slate)).sort()).toEqual([...PRIMARY_TOKENS].sort());
    });
});

describe('surfaceVars', () => {
    it('keeps a grey ground with white cards in light mode', () => {
        const vars = surfaceVars(slate, 'light');
        expect(vars['--background']).toBe('#f1f5f9');
        expect(vars['--card']).toBe('#ffffff');
        expect(vars['--popover']).toBe('#ffffff');
        expect(vars['--foreground']).toBe('#334155');
        expect(vars['--muted-foreground']).toBe('#64748b');
        expect(vars['--border']).toBe('#e2e8f0');
        expect(vars['--sidebar']).toBe('#ffffff');
    });

    it('uses the 950 ground and 900 cards in dark mode', () => {
        const vars = surfaceVars(zinc, 'dark');
        expect(vars['--background']).toBe('#09090b');
        expect(vars['--card']).toBe('#18181b');
        expect(vars['--foreground']).toBe('#ffffff');
        expect(vars['--muted-foreground']).toBe('#a1a1aa');
        expect(vars['--border']).toBe('#3f3f46');
        expect(vars['--sidebar-accent']).toBe('#27272a');
    });

    it('returns exactly the documented surface tokens', () => {
        expect(Object.keys(surfaceVars(slate, 'light')).sort()).toEqual([...SURFACE_TOKENS].sort());
    });
});

describe('presetVars', () => {
    it('returns the recorded PrimeVue values per preset', () => {
        expect(presetVars('Aura')).toEqual({ '--radius': '6px', '--control-height': '2.25rem', '--button-font-weight': '500', '--transition-duration': '0.2s' });
        expect(presetVars('Lara')['--control-height']).toBe('2.5rem');
        expect(presetVars('Nora')['--radius']).toBe('2px');
        expect(presetVars('Nora')['--transition-duration']).toBe('0s');
    });

    it('falls back to Aura for an unknown preset name', () => {
        expect(resolvePreset('Material')).toBe('Aura');
        expect(resolvePreset('Nora')).toBe('Nora');
    });

    it('returns exactly the documented preset tokens', () => {
        expect(Object.keys(presetVars('Aura')).sort()).toEqual([...PRESET_TOKENS].sort());
    });
});

describe('themeVars', () => {
    it('merges preset, surface and primary tokens with no overlap', () => {
        const vars = themeVars({ preset: 'Aura', primary: 'emerald', surface: null, darkTheme: false });
        expect(Object.keys(vars)).toHaveLength(PRESET_TOKENS.length + SURFACE_TOKENS.length + PRIMARY_TOKENS.length);
        expect(vars['--primary']).toBe('#10b981');
        expect(vars['--background']).toBe('#f1f5f9');
        expect(vars['--radius']).toBe('6px');
    });

    it('switches to the dark mapping and the zinc default surface', () => {
        const vars = themeVars({ preset: 'Nora', primary: 'emerald', surface: null, darkTheme: true });
        expect(vars['--primary']).toBe('#34d399');
        expect(vars['--background']).toBe('#09090b');
        expect(vars['--primary-foreground']).toBe('#18181b');
        expect(vars['--radius']).toBe('2px');
    });
});
