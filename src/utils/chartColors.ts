import { primaryPalettes, type Shade } from '@/layout/palettes';
import { resolvePrimary, resolveSurface, type ThemeMode } from '@/utils/theme';

// chart.js needs a concrete colour string, not a CSS variable that resolves per element, so chart
// datasets read the palette records directly rather than computed styles.
export function paletteShade(name: string, key: Shade): string {
    return primaryPalettes.find((option) => option.name === name)?.palette[key] ?? 'var(--foreground)';
}

// The picked primary drives dataset colours; noir carries no palette, so it borrows the surface scale.
export function chartShade(primary: string, surface: string | null, mode: ThemeMode, key: Shade): string {
    return resolvePrimary(primary).palette[key] ?? resolveSurface(surface, mode).palette[key] ?? 'var(--foreground)';
}
