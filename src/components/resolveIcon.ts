import type { Component } from 'vue';
import * as icons from '@/components/icons';

// Every export in icons.ts is named after the PrimeIcons glyph it replaces (IconCalendarPlus for
// pi-calendar-plus), so the glyph name is derived from the export name rather than kept in a second
// hand-written table that could drift from the first.
function glyphName(exportName: string): string {
    return exportName
        .slice('Icon'.length)
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase();
}

const byGlyph: ReadonlyMap<string, Component> = new Map(Object.entries(icons).map(([name, component]) => [`pi-${glyphName(name)}`, component as Component]));

// Accepts the class strings the demo data carries ('pi pi-fw pi-inbox') and returns the mapped
// component, so services and menu models keep their string icons untouched.
export function resolveIcon(className: string | undefined): Component | undefined {
    if (!className) return undefined;
    const token = className.split(/\s+/).find((part) => part.startsWith('pi-') && part !== 'pi-fw');
    return token ? byGlyph.get(token) : undefined;
}
