import { DEFAULT_PRIMARY, primaryPalettes, surfacePalettes } from '@/layout/palettes';
import { DEFAULT_PRESET, presetNames, type PresetName } from '@/layout/presets';

export type MenuMode = 'static' | 'overlay';

export interface LayoutConfig {
    preset: PresetName;
    primary: string;
    surface: string | null;
    darkTheme: boolean;
    menuMode: MenuMode;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
    preset: DEFAULT_PRESET,
    primary: DEFAULT_PRIMARY,
    surface: null,
    darkTheme: false,
    menuMode: 'static'
};

const MENU_MODES: MenuMode[] = ['static', 'overlay'];

// localStorage is user-editable and survives template upgrades, so every field is validated
// and anything unexpected falls back to its default instead of throwing at module load.
export function parseLayoutConfig(raw: string | null): LayoutConfig {
    let parsed: unknown = null;
    if (raw) {
        try {
            parsed = JSON.parse(raw);
        } catch {
            parsed = null;
        }
    }
    const source = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
    const defaults = DEFAULT_LAYOUT_CONFIG;
    return {
        preset: presetNames.includes(source.preset as PresetName) ? (source.preset as PresetName) : defaults.preset,
        primary: primaryPalettes.some((option) => option.name === source.primary) ? (source.primary as string) : defaults.primary,
        surface: surfacePalettes.some((option) => option.name === source.surface) ? (source.surface as string) : defaults.surface,
        darkTheme: typeof source.darkTheme === 'boolean' ? source.darkTheme : defaults.darkTheme,
        menuMode: MENU_MODES.includes(source.menuMode as MenuMode) ? (source.menuMode as MenuMode) : defaults.menuMode
    };
}
