import type { Component } from 'vue';

// One item shape for every menu, the same fields PrimeVue's MenuItem carried, with the icon as a component.
export interface MenuModelItem {
    label?: string;
    icon?: Component;
    command?: (event: { originalEvent: Event; item: MenuModelItem }) => void;
    to?: string;
    url?: string;
    target?: string;
    items?: MenuModelItem[];
    separator?: boolean;
    disabled?: boolean;
    visible?: boolean;
    class?: string;
}

// MegaMenu columns: each root item holds columns, each column holds groups, each group holds items.
export interface MegaMenuItem extends Omit<MenuModelItem, 'items'> {
    items?: MenuModelItem[][];
}

export function isVisible(item: MenuModelItem): boolean {
    return item.visible !== false;
}

export function runCommand(item: MenuModelItem, event: Event): void {
    if (item.disabled) return;
    item.command?.({ originalEvent: event, item });
}
