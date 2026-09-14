<script setup lang="ts" generic="T extends Record<string, unknown>">
    import { computed } from 'vue';
    import { Button } from '@/components/ui/button';
    import { IconAngleDoubleDown, IconAngleDoubleLeft, IconAngleDoubleRight, IconAngleDoubleUp, IconAngleDown, IconAngleLeft, IconAngleRight, IconAngleUp } from '@/components/icons';
    import { cn } from '@/lib/utils';
    import ListItems from './ListItems.vue';
    import { moveBottom, moveDown, moveTop, moveUp, transfer, transferAll } from './moves';
    import { useListSelection } from './useListSelection';

    const props = defineProps<{
        dataKey: keyof T & string;
        class?: string;
    }>();
    const model = defineModel<[T[], T[]]>({ default: () => [[], []] });

    const keyOf = (item: T): string => String(item[props.dataKey]);
    const sourceSelection = useListSelection();
    const targetSelection = useListSelection();
    const sourceKeys = computed(() => model.value[0].map(keyOf));
    const targetKeys = computed(() => model.value[1].map(keyOf));

    type Mover = (items: T[], selectedKeys: string[], key: (item: T) => string) => T[];

    function reorder(side: 0 | 1, mover: Mover): void {
        const selection = side === 0 ? sourceSelection : targetSelection;
        const next = mover(model.value[side], selection.selected.value, keyOf);
        if (next === model.value[side]) return;
        model.value = side === 0 ? [next, model.value[1]] : [model.value[0], next];
    }

    function toTarget(all = false): void {
        const result = all ? transferAll(model.value[0], model.value[1]) : transfer(model.value[0], model.value[1], sourceSelection.selected.value, keyOf);
        if (result.from === model.value[0]) return;
        model.value = [result.from, result.to];
        sourceSelection.clear();
    }

    function toSource(all = false): void {
        const result = all ? transferAll(model.value[1], model.value[0]) : transfer(model.value[1], model.value[0], targetSelection.selected.value, keyOf);
        if (result.from === model.value[1]) return;
        model.value = [result.to, result.from];
        targetSelection.clear();
    }
</script>

<template>
    <div :class="cn('flex flex-col gap-4 lg:flex-row', props.class)" data-slot="pick-list">
        <div class="flex flex-row gap-2 lg:flex-col">
            <Button variant="secondary" size="icon" aria-label="Move up" @click="reorder(0, moveUp)"><IconAngleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move top" @click="reorder(0, moveTop)"><IconAngleDoubleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move down" @click="reorder(0, moveDown)"><IconAngleDown /></Button>
            <Button variant="secondary" size="icon" aria-label="Move bottom" @click="reorder(0, moveBottom)"><IconAngleDoubleDown /></Button>
        </div>
        <div class="flex flex-1 flex-col gap-2">
            <div class="font-medium"><slot name="sourceheader">Available</slot></div>
            <ListItems :items="model[0]" :key-of="keyOf" :selected="sourceSelection.selected.value" label="Source" @item-click="(event, key) => sourceSelection.onItemClick(event, key, sourceKeys)">
                <template #option="scope"><slot name="option" v-bind="scope" /></template>
            </ListItems>
        </div>
        <div class="flex flex-row gap-2 lg:flex-col">
            <Button variant="secondary" size="icon" aria-label="Move to target" @click="toTarget()"><IconAngleRight /></Button>
            <Button variant="secondary" size="icon" aria-label="Move all to target" @click="toTarget(true)"><IconAngleDoubleRight /></Button>
            <Button variant="secondary" size="icon" aria-label="Move to source" @click="toSource()"><IconAngleLeft /></Button>
            <Button variant="secondary" size="icon" aria-label="Move all to source" @click="toSource(true)"><IconAngleDoubleLeft /></Button>
        </div>
        <div class="flex flex-1 flex-col gap-2">
            <div class="font-medium"><slot name="targetheader">Selected</slot></div>
            <ListItems :items="model[1]" :key-of="keyOf" :selected="targetSelection.selected.value" label="Target" @item-click="(event, key) => targetSelection.onItemClick(event, key, targetKeys)">
                <template #option="scope"><slot name="option" v-bind="scope" /></template>
            </ListItems>
        </div>
        <div class="flex flex-row gap-2 lg:flex-col">
            <Button variant="secondary" size="icon" aria-label="Move up" @click="reorder(1, moveUp)"><IconAngleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move top" @click="reorder(1, moveTop)"><IconAngleDoubleUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Move down" @click="reorder(1, moveDown)"><IconAngleDown /></Button>
            <Button variant="secondary" size="icon" aria-label="Move bottom" @click="reorder(1, moveBottom)"><IconAngleDoubleDown /></Button>
        </div>
    </div>
</template>
