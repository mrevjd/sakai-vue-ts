<script setup lang="ts">
    import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from './model';

    // The default slot is the right-click area, which replaces PrimeVue's `contextMenu.show(event)` call.
    const props = defineProps<{ model: MenuModelItem[] }>();
</script>

<template>
    <ContextMenu>
        <ContextMenuTrigger as-child><slot /></ContextMenuTrigger>
        <ContextMenuContent class="min-w-40" data-slot="app-context-menu">
            <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
                <ContextMenuSeparator v-if="item.separator" />
                <ContextMenuSub v-else-if="item.items">
                    <ContextMenuSubTrigger><MenuItemContent :item="item" label-only /></ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <ContextMenuItem v-for="(child, childIndex) in item.items.filter(isVisible)" :key="childIndex" as-child :disabled="child.disabled" @select="runCommand(child, $event)"><MenuItemContent :item="child" /></ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuItem v-else as-child :disabled="item.disabled" @select="runCommand(item, $event)"><MenuItemContent :item="item" /></ContextMenuItem>
            </template>
        </ContextMenuContent>
    </ContextMenu>
</template>
