<script setup lang="ts">
    import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '@/components/ui/menubar';
    import { IconAngleDown } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from './model';

    const props = defineProps<{ model: MenuModelItem[]; class?: string }>();
</script>

<template>
    <Menubar :class="cn('h-auto flex-wrap justify-between gap-1 p-1', props.class)" data-slot="app-menubar">
        <div class="flex flex-wrap items-center gap-1">
            <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
                <MenubarMenu v-if="item.items">
                    <MenubarTrigger class="gap-2"><MenuItemContent :item="item" /><IconAngleDown class="size-3.5 opacity-60" /></MenubarTrigger>
                    <MenubarContent>
                        <template v-for="(child, childIndex) in item.items.filter(isVisible)" :key="childIndex">
                            <MenubarSeparator v-if="child.separator" />
                            <MenubarSub v-else-if="child.items">
                                <MenubarSubTrigger><MenuItemContent :item="child" /></MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem v-for="(leaf, leafIndex) in child.items.filter(isVisible)" :key="leafIndex" :disabled="leaf.disabled" @select="runCommand(leaf, $event)"><MenuItemContent :item="leaf" /></MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarItem v-else :disabled="child.disabled" @select="runCommand(child, $event)"><MenuItemContent :item="child" /></MenubarItem>
                        </template>
                    </MenubarContent>
                </MenubarMenu>
                <button v-else type="button" class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-muted focus-visible:outline-none" :disabled="item.disabled" @click="runCommand(item, $event)">
                    <MenuItemContent :item="item" />
                </button>
            </template>
        </div>
        <div v-if="$slots.end" class="ml-auto"><slot name="end" /></div>
    </Menubar>
</template>
