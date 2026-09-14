<script setup lang="ts" generic="T extends Record<string, unknown>">
    import { cn } from '@/lib/utils';

    const props = defineProps<{
        items: T[];
        keyOf: (item: T) => string;
        selected: string[];
        label: string;
        class?: string;
    }>();
    const emit = defineEmits<{ itemClick: [event: MouseEvent, key: string] }>();
</script>

<template>
    <ul role="listbox" :aria-label="props.label" aria-multiselectable="true" :class="cn('flex min-h-48 flex-col gap-0.5 overflow-auto rounded-lg border border-border bg-card p-1', props.class)" data-slot="list-items">
        <li
            v-for="(item, index) in props.items"
            :key="props.keyOf(item)"
            role="option"
            :aria-selected="props.selected.includes(props.keyOf(item))"
            :class="cn('cursor-pointer rounded-md px-3 py-2 text-sm select-none hover:bg-muted', props.selected.includes(props.keyOf(item)) && 'bg-accent text-accent-foreground')"
            data-slot="list-item"
            @click="emit('itemClick', $event, props.keyOf(item))"
        >
            <slot name="option" :option="item" :index="index">{{ props.keyOf(item) }}</slot>
        </li>
        <li v-if="props.items.length === 0" class="px-3 py-2 text-sm text-muted-foreground">No items</li>
    </ul>
</template>
