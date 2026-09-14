<script setup lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { cn } from '@/lib/utils';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from './model';

    // Inline: a plain list. Popup: a DropdownMenu around the `trigger` slot, which replaces PrimeVue's
    // `menu.toggle(event)` call on a ref; the trigger button moves inside this component's slot.
    const props = withDefaults(defineProps<{ model: MenuModelItem[]; popup?: boolean; class?: string }>(), { popup: false, class: undefined });
</script>

<template>
    <DropdownMenu v-if="props.popup">
        <DropdownMenuTrigger as-child><slot name="trigger" /></DropdownMenuTrigger>
        <DropdownMenuContent align="start" :class="cn('min-w-40', props.class)" data-slot="menu-list-popup">
            <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
                <DropdownMenuSeparator v-if="item.separator" />
                <template v-else-if="item.items">
                    <DropdownMenuLabel data-slot="menu-group-label">{{ item.label }}</DropdownMenuLabel>
                    <DropdownMenuItem v-for="(child, childIndex) in item.items.filter(isVisible)" :key="childIndex" :disabled="child.disabled" @select="runCommand(child, $event)"><MenuItemContent :item="child" /></DropdownMenuItem>
                </template>
                <DropdownMenuItem v-else :disabled="item.disabled" @select="runCommand(item, $event)"><MenuItemContent :item="item" /></DropdownMenuItem>
            </template>
        </DropdownMenuContent>
    </DropdownMenu>
    <ul v-else role="menu" :class="cn('flex min-w-40 flex-col gap-0.5 rounded-lg border border-border bg-card p-1', props.class)" data-slot="menu-list">
        <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
            <li v-if="item.separator" role="separator" class="my-1 border-t border-border" />
            <template v-else-if="item.items">
                <li class="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase" data-slot="menu-group-label">{{ item.label }}</li>
                <li
                    v-for="(child, childIndex) in item.items.filter(isVisible)"
                    :key="childIndex"
                    role="menuitem"
                    :aria-disabled="child.disabled || undefined"
                    :tabindex="child.disabled ? -1 : 0"
                    :class="cn('cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none', child.disabled && 'pointer-events-none opacity-50')"
                    @click="runCommand(child, $event)"
                    @keydown.enter="runCommand(child, $event)"
                >
                    <MenuItemContent :item="child" />
                </li>
            </template>
            <li
                v-else
                role="menuitem"
                :aria-disabled="item.disabled || undefined"
                :tabindex="item.disabled ? -1 : 0"
                :class="cn('cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none', item.disabled && 'pointer-events-none opacity-50')"
                @click="runCommand(item, $event)"
                @keydown.enter="runCommand(item, $event)"
            >
                <MenuItemContent :item="item" />
            </li>
        </template>
    </ul>
</template>
