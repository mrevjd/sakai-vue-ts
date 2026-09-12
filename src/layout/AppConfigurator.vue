<script setup lang="ts">
    import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
    import { useLayout } from '@/layout/composables/layout';
    import { primaryPalettes, surfacePalettes, type PaletteOption } from '@/layout/palettes';
    import { presetNames, type PresetName } from '@/layout/presets';
    import type { MenuMode } from '@/utils/layoutConfig';

    const { layoutConfig, isDarkTheme, changeMenuMode } = useLayout();

    const menuModes: { label: string; value: MenuMode }[] = [
        { label: 'Static', value: 'static' },
        { label: 'Overlay', value: 'overlay' }
    ];

    function swatchColor(option: PaletteOption): string {
        return option.name === 'noir' ? 'var(--foreground)' : (option.palette['500'] ?? '');
    }

    function isSurfaceSelected(option: PaletteOption): boolean {
        if (layoutConfig.surface) return layoutConfig.surface === option.name;
        return option.name === (isDarkTheme.value ? 'zinc' : 'slate');
    }

    // ToggleGroup emits undefined when the active item is clicked again; the old SelectButton had allowEmpty=false.
    function onPreset(value: unknown): void {
        if (typeof value === 'string' && presetNames.includes(value as PresetName)) layoutConfig.preset = value as PresetName;
    }

    function onMenuMode(value: unknown): void {
        if (value === 'static' || value === 'overlay') changeMenuMode({ value });
    }
</script>

<template>
    <div class="config-panel hidden absolute top-[3.25rem] right-0 w-64 p-4 bg-card border border-border rounded-lg origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]">
        <div class="flex flex-col gap-4">
            <div>
                <span class="text-sm text-muted-foreground font-semibold">Primary</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-between">
                    <button
                        v-for="option of primaryPalettes"
                        :key="option.name"
                        type="button"
                        :title="option.name"
                        :class="['border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1', { 'outline-primary': layoutConfig.primary === option.name }]"
                        :style="{ backgroundColor: swatchColor(option) }"
                        @click="layoutConfig.primary = option.name"
                    ></button>
                </div>
            </div>
            <div>
                <span class="text-sm text-muted-foreground font-semibold">Surface</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-between">
                    <button
                        v-for="option of surfacePalettes"
                        :key="option.name"
                        type="button"
                        :title="option.name"
                        :class="['border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1', { 'outline-primary': isSurfaceSelected(option) }]"
                        :style="{ backgroundColor: option.palette['500'] }"
                        @click="layoutConfig.surface = option.name"
                    ></button>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-foreground font-semibold">Presets</span>
                <ToggleGroup type="single" variant="outline" :model-value="layoutConfig.preset" @update:model-value="onPreset">
                    <ToggleGroupItem v-for="name of presetNames" :key="name" :value="name">{{ name }}</ToggleGroupItem>
                </ToggleGroup>
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-foreground font-semibold">Menu Mode</span>
                <ToggleGroup type="single" variant="outline" :model-value="layoutConfig.menuMode" @update:model-value="onMenuMode">
                    <ToggleGroupItem v-for="mode of menuModes" :key="mode.value" :value="mode.value">{{ mode.label }}</ToggleGroupItem>
                </ToggleGroup>
            </div>
        </div>
    </div>
</template>
