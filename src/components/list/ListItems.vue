<script setup lang="ts" generic="T extends Record<string, unknown>">
    import { computed, ref } from 'vue';
    import { cn } from '@/lib/utils';

    const props = defineProps<{
        items: T[];
        keyOf: (item: T) => string;
        selected: string[];
        label: string;
        class?: string;
    }>();
    // The keyboard path sends the KeyboardEvent so its shift and ctrl modifiers reach the same selection rules a click uses.
    const emit = defineEmits<{ itemClick: [event: MouseEvent | KeyboardEvent, key: string] }>();

    const list = ref<HTMLUListElement | null>(null);
    const keys = computed(() => props.items.map(props.keyOf));

    // Roving tabindex: one option is in the tab order at a time. It falls back to the first option
    // until something is focused, and again when the focused item is moved out of this list.
    const focusedKey = ref<string | null>(null);
    const activeKey = computed(() => (focusedKey.value !== null && keys.value.includes(focusedKey.value) ? focusedKey.value : (keys.value[0] ?? null)));

    function focusOption(index: number): void {
        const option = list.value?.querySelectorAll<HTMLElement>(':scope > [role=option]')[index];
        if (!option) return;
        focusedKey.value = keys.value[index] ?? null;
        option.focus();
    }

    function onKeydown(event: KeyboardEvent): void {
        if (keys.value.length === 0 || activeKey.value === null) return;
        const current = keys.value.indexOf(activeKey.value);
        let next: number;
        switch (event.key) {
            case 'ArrowDown':
                next = Math.min(current + 1, keys.value.length - 1);
                break;
            case 'ArrowUp':
                next = Math.max(current - 1, 0);
                break;
            case 'Home':
                next = 0;
                break;
            case 'End':
                next = keys.value.length - 1;
                break;
            case ' ':
            case 'Enter':
                event.preventDefault();
                emit('itemClick', event, activeKey.value);
                return;
            default:
                return;
        }
        event.preventDefault();
        focusOption(next);
        // Shift with an arrow extends the selection through the range rule; Home and End only move focus.
        if (event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) emit('itemClick', event, keys.value[next]!);
    }
</script>

<template>
    <ul ref="list" role="listbox" :aria-label="props.label" aria-multiselectable="true" :class="cn('flex min-h-48 flex-col gap-0.5 overflow-auto rounded-lg border border-border bg-card p-1', props.class)" data-slot="list-items" @keydown="onKeydown">
        <li
            v-for="(item, index) in props.items"
            :key="props.keyOf(item)"
            role="option"
            :tabindex="props.keyOf(item) === activeKey ? 0 : -1"
            :aria-selected="props.selected.includes(props.keyOf(item))"
            :class="cn('cursor-pointer rounded-md px-3 py-2 text-sm select-none hover:bg-muted', props.selected.includes(props.keyOf(item)) && 'bg-accent text-accent-foreground')"
            data-slot="list-item"
            @focus="focusedKey = props.keyOf(item)"
            @click="emit('itemClick', $event, props.keyOf(item))"
        >
            <slot name="option" :option="item" :index="index">{{ props.keyOf(item) }}</slot>
        </li>
        <li v-if="props.items.length === 0" class="px-3 py-2 text-sm text-muted-foreground">No items</li>
    </ul>
</template>
