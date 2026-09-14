<script setup lang="ts">
    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
    import { IconAngleDown, IconAngleRight } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from './model';

    defineOptions({ name: 'PanelMenu' });
    const props = withDefaults(defineProps<{ model: MenuModelItem[]; nested?: boolean; class?: string }>(), { nested: false, class: undefined });
</script>

<template>
    <div :class="cn('flex flex-col', props.nested ? 'gap-0.5 pl-4' : 'gap-2', props.class)" data-slot="panel-menu">
        <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
            <Collapsible v-if="item.items" v-slot="{ open }" :class="cn(!props.nested && 'rounded-lg border border-border bg-card')">
                <!-- A group header is the toggle, as in PrimeVue: its to/url are ignored and its command runs once per click. -->
                <CollapsibleTrigger
                    :class="cn('flex w-full items-center justify-between gap-2 text-left text-sm hover:bg-muted focus-visible:outline-none', props.nested ? 'rounded-md px-3 py-2' : 'rounded-lg px-4 py-3 font-semibold')"
                    :data-slot="props.nested ? 'panel-menu-item' : 'panel-menu-header'"
                    :disabled="item.disabled"
                    @click="runCommand(item, $event)"
                >
                    <MenuItemContent :item="item" label-only />
                    <IconAngleDown v-if="open" class="size-4 shrink-0" />
                    <IconAngleRight v-else class="size-4 shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent :class="cn(!props.nested && 'border-t border-border p-1')">
                    <PanelMenu :model="item.items" nested />
                </CollapsibleContent>
            </Collapsible>
            <MenuItemContent
                v-else
                :item="item"
                :class="cn('rounded-md px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none', !props.nested && 'rounded-lg border border-border bg-card px-4 py-3 font-semibold')"
                :data-slot="props.nested ? 'panel-menu-item' : 'panel-menu-header'"
                @click="runCommand(item, $event)"
            />
        </template>
    </div>
</template>
