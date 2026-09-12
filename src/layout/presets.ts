// Values read on 2026-09-12 from node_modules/@primeuix/themes/dist/<preset>/base/index.mjs and
// dist/<preset>/button/index.mjs, before the package is removed in Plan 3:
//   content.borderRadius   Aura {border.radius.md} = 6px, Lara md = 6px, Nora {border.radius.xs} = 2px
//   formField.paddingY     Aura 0.5rem, Lara 0.625rem, Nora 0.5rem (control height = 2 * paddingY + 1.25rem line)
//   button fontWeight      Aura 500, Lara 600, Nora 700
//   transitionDuration     Aura 0.2s, Lara 0.2s, Nora 0s
export type PresetName = 'Aura' | 'Lara' | 'Nora';

export interface PresetTokens {
    radius: string;
    controlHeight: string;
    buttonFontWeight: string;
    transitionDuration: string;
}

export const presetNames: PresetName[] = ['Aura', 'Lara', 'Nora'];
export const DEFAULT_PRESET: PresetName = 'Aura';

export const presets: Record<PresetName, PresetTokens> = {
    Aura: { radius: '6px', controlHeight: '2.25rem', buttonFontWeight: '500', transitionDuration: '0.2s' },
    Lara: { radius: '6px', controlHeight: '2.5rem', buttonFontWeight: '600', transitionDuration: '0.2s' },
    Nora: { radius: '2px', controlHeight: '2.25rem', buttonFontWeight: '700', transitionDuration: '0s' }
};
