import { DEFAULT_PRIMARY, DEFAULT_SURFACE_DARK, DEFAULT_SURFACE_LIGHT, primaryPalettes, surfacePalettes, type Palette, type PaletteOption, type Shade } from '@/layout/palettes';

export type ThemeMode = 'light' | 'dark';
export type TokenRecord = Record<string, string>;

export const PRIMARY_TOKENS = ['--primary', '--primary-foreground', '--ring', '--sidebar-primary', '--sidebar-primary-foreground', '--chart-1'] as const;

export const SURFACE_TOKENS = [
    '--background',
    '--foreground',
    '--card',
    '--card-foreground',
    '--popover',
    '--popover-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--border',
    '--input',
    '--sidebar',
    '--sidebar-foreground',
    '--sidebar-accent',
    '--sidebar-accent-foreground',
    '--sidebar-border'
] as const;

const WHITE = '#ffffff';

function shade(palette: Palette, key: Shade): string {
    const value = palette[key];
    if (!value) throw new Error(`Palette is missing shade ${key}`);
    return value;
}

export function resolvePrimary(name: string): PaletteOption {
    return primaryPalettes.find((option) => option.name === name) ?? primaryPalettes.find((option) => option.name === DEFAULT_PRIMARY)!;
}

export function resolveSurface(name: string | null, mode: ThemeMode): PaletteOption {
    const fallback = mode === 'dark' ? DEFAULT_SURFACE_DARK : DEFAULT_SURFACE_LIGHT;
    return surfacePalettes.find((option) => option.name === name) ?? surfacePalettes.find((option) => option.name === fallback)!;
}

// Mirrors the semantic mapping the PrimeVue configurator applied: 500 on white in light mode,
// 400 on the surface's 900 shade in dark mode, and noir riding on the surface scale.
export function primaryVars(primary: PaletteOption, mode: ThemeMode, surface: Palette): TokenRecord {
    let color: string;
    let foreground: string;
    if (primary.name === 'noir') {
        color = mode === 'dark' ? shade(surface, '50') : shade(surface, '950');
        foreground = mode === 'dark' ? shade(surface, '950') : WHITE;
    } else {
        color = mode === 'dark' ? shade(primary.palette, '400') : shade(primary.palette, '500');
        foreground = mode === 'dark' ? shade(surface, '900') : WHITE;
    }
    return {
        '--primary': color,
        '--primary-foreground': foreground,
        '--ring': color,
        '--sidebar-primary': color,
        '--sidebar-primary-foreground': foreground,
        '--chart-1': color
    };
}

export function surfaceVars(surface: Palette, mode: ThemeMode): TokenRecord {
    const s = (key: Shade) => shade(surface, key);
    if (mode === 'dark') {
        return {
            '--background': s('950'),
            '--foreground': s('0'),
            '--card': s('900'),
            '--card-foreground': s('0'),
            '--popover': s('900'),
            '--popover-foreground': s('0'),
            '--secondary': s('800'),
            '--secondary-foreground': s('0'),
            '--muted': s('800'),
            '--muted-foreground': s('400'),
            '--accent': s('800'),
            '--accent-foreground': s('0'),
            '--border': s('700'),
            '--input': s('700'),
            '--sidebar': s('900'),
            '--sidebar-foreground': s('0'),
            '--sidebar-accent': s('800'),
            '--sidebar-accent-foreground': s('0'),
            '--sidebar-border': s('700')
        };
    }
    return {
        '--background': s('100'),
        '--foreground': s('700'),
        '--card': s('0'),
        '--card-foreground': s('700'),
        '--popover': s('0'),
        '--popover-foreground': s('700'),
        '--secondary': s('100'),
        '--secondary-foreground': s('700'),
        '--muted': s('100'),
        '--muted-foreground': s('500'),
        '--accent': s('100'),
        '--accent-foreground': s('700'),
        '--border': s('200'),
        '--input': s('200'),
        '--sidebar': s('0'),
        '--sidebar-foreground': s('700'),
        '--sidebar-accent': s('100'),
        '--sidebar-accent-foreground': s('700'),
        '--sidebar-border': s('200')
    };
}
