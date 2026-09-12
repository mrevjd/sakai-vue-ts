// TRANSITIONAL. Keeps PrimeVue's own theme in step with the picker while unported pages still
// render PrimeVue components. Delete this file, and its two call sites, in the Plan 3 sweep.
import { $t } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Nora from '@primeuix/themes/nora';
import { primaryPalettes, surfacePalettes } from '@/layout/palettes';
import type { PresetName } from '@/layout/presets';
import type { ThemeInput } from '@/utils/theme';

const primePresets: Record<PresetName, unknown> = { Aura, Lara, Nora };

// Lifted unchanged from the old AppConfigurator.getPresetExt().
function primaryExtension(primaryName: string): Record<string, unknown> {
    const color = primaryPalettes.find((option) => option.name === primaryName);
    if (!color) return {};
    if (color.name === 'noir') {
        return {
            semantic: {
                primary: {
                    50: '{surface.50}',
                    100: '{surface.100}',
                    200: '{surface.200}',
                    300: '{surface.300}',
                    400: '{surface.400}',
                    500: '{surface.500}',
                    600: '{surface.600}',
                    700: '{surface.700}',
                    800: '{surface.800}',
                    900: '{surface.900}',
                    950: '{surface.950}'
                },
                colorScheme: {
                    light: {
                        primary: { color: '{primary.950}', contrastColor: '#ffffff', hoverColor: '{primary.800}', activeColor: '{primary.700}' },
                        highlight: { background: '{primary.950}', focusBackground: '{primary.700}', color: '#ffffff', focusColor: '#ffffff' }
                    },
                    dark: {
                        primary: { color: '{primary.50}', contrastColor: '{primary.950}', hoverColor: '{primary.200}', activeColor: '{primary.300}' },
                        highlight: { background: '{primary.50}', focusBackground: '{primary.300}', color: '{primary.950}', focusColor: '{primary.950}' }
                    }
                }
            }
        };
    }
    return {
        semantic: {
            primary: color.palette,
            colorScheme: {
                light: {
                    primary: { color: '{primary.500}', contrastColor: '#ffffff', hoverColor: '{primary.600}', activeColor: '{primary.700}' },
                    highlight: { background: '{primary.50}', focusBackground: '{primary.100}', color: '{primary.700}', focusColor: '{primary.800}' }
                },
                dark: {
                    primary: { color: '{primary.400}', contrastColor: '{surface.900}', hoverColor: '{primary.300}', activeColor: '{primary.200}' },
                    highlight: {
                        background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                        focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                        color: 'rgba(255,255,255,.87)',
                        focusColor: 'rgba(255,255,255,.87)'
                    }
                }
            }
        }
    };
}

export function syncPrimeVueTheme(input: ThemeInput): void {
    const preset = primePresets[input.preset as PresetName] ?? Aura;
    const surface = surfacePalettes.find((option) => option.name === input.surface)?.palette;
    $t().preset(preset).preset(primaryExtension(input.primary)).surfacePalette(surface).use({ useDefaultOptions: true });
}
