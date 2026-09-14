<script setup lang="ts">
    import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
    import { cn } from '@/lib/utils';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MegaMenuItem } from './model';

    const props = withDefaults(defineProps<{ model: MegaMenuItem[]; orientation?: 'horizontal' | 'vertical'; class?: string }>(), { orientation: 'horizontal', class: undefined });
</script>

<template>
    <NavigationMenu
        :orientation="props.orientation"
        :viewport="props.orientation === 'horizontal'"
        :class="cn('max-w-full justify-start rounded-lg border border-border bg-card p-1', props.orientation === 'vertical' && 'w-56 items-stretch', props.class)"
        data-slot="app-mega-menu"
        :data-orientation="props.orientation"
    >
        <NavigationMenuList :class="cn('gap-1', props.orientation === 'vertical' && 'flex-col items-stretch')">
            <NavigationMenuItem v-for="(root, rootIndex) in props.model" :key="rootIndex" class="relative">
                <NavigationMenuTrigger :class="cn('gap-2', props.orientation === 'vertical' && 'w-full justify-between')"><MenuItemContent :item="{ label: root.label, icon: root.icon }" label-only /></NavigationMenuTrigger>
                <NavigationMenuContent :class="cn('p-4', props.orientation === 'vertical' && 'absolute top-0 left-full ml-1 w-max rounded-lg border border-border bg-popover shadow-md')">
                    <div class="grid gap-6" :style="{ gridTemplateColumns: `repeat(${root.items?.length ?? 1}, minmax(10rem, 1fr))` }">
                        <div v-for="(column, columnIndex) in root.items" :key="columnIndex" class="flex flex-col gap-4">
                            <div v-for="(group, groupIndex) in column.filter(isVisible)" :key="groupIndex" class="flex flex-col gap-1">
                                <div class="px-2 text-xs font-semibold text-muted-foreground uppercase" data-slot="app-mega-menu-group">{{ group.label }}</div>
                                <NavigationMenuLink v-for="(leaf, leafIndex) in (group.items ?? []).filter(isVisible)" :key="leafIndex" as-child @click="runCommand(leaf, $event)">
                                    <MenuItemContent :item="leaf" class="rounded-md px-2 py-1.5 text-sm hover:bg-muted" />
                                </NavigationMenuLink>
                            </div>
                        </div>
                    </div>
                </NavigationMenuContent>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
</template>
