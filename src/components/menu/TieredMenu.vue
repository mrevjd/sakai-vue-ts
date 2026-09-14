<script setup lang="ts">
    import { ref } from 'vue';
    import { IconAngleRight } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import MenuItemContent from './MenuItemContent.vue';
    import { isVisible, runCommand, type MenuModelItem } from './model';

    defineOptions({ name: 'TieredMenu' });
    const props = withDefaults(defineProps<{ model: MenuModelItem[]; nested?: boolean; class?: string }>(), { nested: false, class: undefined });

    // Click toggles a submenu for touch; hover and focus-within open it through the group classes.
    // A parent's to and url are ignored; its command runs once per click before the toggle, as PrimeVue's does.
    const openIndex = ref<number | null>(null);
    function toggle(item: MenuModelItem, index: number, event: Event): void {
        runCommand(item, event);
        openIndex.value = openIndex.value === index ? null : index;
    }

    const itemClass = 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none disabled:opacity-50';
</script>

<template>
    <ul
        role="menu"
        :class="
            cn(
                'flex min-w-44 flex-col gap-0.5 rounded-lg border border-border bg-card p-1',
                props.nested ? 'absolute top-0 left-full z-20 ml-1 hidden shadow-md group-hover/tiered:flex group-focus-within/tiered:flex data-[open=true]:flex' : 'relative',
                props.class
            )
        "
        data-slot="tiered-menu"
    >
        <template v-for="(item, index) in props.model.filter(isVisible)" :key="index">
            <li v-if="item.separator" role="separator" class="my-1 border-t border-border" />
            <li v-else-if="item.items" class="group/tiered relative" :data-open="openIndex === index || undefined">
                <button
                    type="button"
                    role="menuitem"
                    aria-haspopup="menu"
                    :aria-expanded="openIndex === index"
                    :aria-disabled="item.disabled || undefined"
                    :disabled="item.disabled"
                    :class="cn(itemClass, 'justify-between')"
                    @click="toggle(item, index, $event)"
                >
                    <MenuItemContent :item="item" label-only />
                    <IconAngleRight class="size-4 shrink-0" />
                </button>
                <TieredMenu :model="item.items" nested data-slot="tiered-menu-submenu" :data-open="openIndex === index || undefined" />
            </li>
            <li v-else role="none">
                <MenuItemContent :item="item" role="menuitem" :class="itemClass" @click="runCommand(item, $event)" />
            </li>
        </template>
    </ul>
</template>
