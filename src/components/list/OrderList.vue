<script setup lang="ts" generic="T extends Record<string, unknown>">
    import { computed } from 'vue';
    import { Button } from '@/components/ui/button';
    import { IconAngleDoubleDown, IconAngleDoubleUp, IconAngleDown, IconAngleUp } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import ListItems from './ListItems.vue';
    import { moveBottom, moveDown, moveTop, moveUp } from './moves';
    import { useListSelection } from './useListSelection';

    const props = defineProps<{
        dataKey: keyof T & string;
        class?: string;
    }>();
    const model = defineModel<T[]>({ default: () => [] });

    const keyOf = (item: T): string => String(item[props.dataKey]);
    const { selected, onItemClick } = useListSelection();
    const orderedKeys = computed(() => model.value.map(keyOf));

    function apply(mover: (items: T[], selectedKeys: string[], key: (item: T) => string) => T[]): void {
        const next = mover(model.value, selected.value, keyOf);
        if (next !== model.value) model.value = next;
    }
</script>

<template>
    <div :class="cn('flex flex-col gap-4 sm:flex-row', props.class)" data-slot="order-list">
        <div class="flex flex-row gap-2 sm:flex-col">
            <Button variant="secondary" size="icon" aria-label="Move up" @click="apply(moveUp)"><IconAngleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move top" @click="apply(moveTop)"><IconAngleDoubleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move down" @click="apply(moveDown)"><IconAngleDown /></Button>
            <Button variant="secondary" size="icon" aria-label="Move bottom" @click="apply(moveBottom)"><IconAngleDoubleDown /></Button>
        </div>
        <div class="flex flex-1 flex-col gap-2">
            <div v-if="$slots.header" class="font-medium"><slot name="header" /></div>
            <ListItems :items="model" :key-of="keyOf" :selected="selected" label="Order list" @item-click="(event, key) => onItemClick(event, key, orderedKeys)">
                <template #option="scope"><slot name="option" v-bind="scope" /></template>
            </ListItems>
        </div>
    </div>
</template>
