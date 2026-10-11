import { primaryPalettes, type Shade } from '@/layout/palettes';
import { resolvePrimary, resolveSurface, type ThemeMode } from '@/utils/theme';

// chart.js needs a concrete colour string, not a CSS variable that resolves per element, so chart
// datasets read the palette records directly rather than computed styles.
// The fallback is concrete for the same reason: a canvas cannot resolve var(...). Slate 500 reads on
// both the light and the dark surface.
const FALLBACK_SHADE = '#64748b';

export function paletteShade(name: string, key: Shade): string {
    return primaryPalettes.find((option) => option.name === name)?.palette[key] ?? FALLBACK_SHADE;
}

// The picked primary drives dataset colours; noir carries no palette, so it borrows the surface scale.
export function chartShade(primary: string, surface: string | null, mode: ThemeMode, key: Shade): string {
    return resolvePrimary(primary).palette[key] ?? resolveSurface(surface, mode).palette[key] ?? FALLBACK_SHADE;
}
