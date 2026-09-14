import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PickList from './PickList.vue';

interface Item extends Record<string, unknown> {
    id: string;
    name: string;
}

const source: Item[] = [
    { id: '1', name: 'Bamboo Watch' },
    { id: '2', name: 'Black Watch' }
];

function make(modelValue: [Item[], Item[]] = [source, []]) {
    return mount(PickList<Item>, { props: { modelValue, dataKey: 'id' }, slots: { option: `<template #option="{ option }">{{ option.name }}</template>` } });
}

function lastModel(wrapper: ReturnType<typeof make>): [Item[], Item[]] {
    const emitted = wrapper.emitted('update:modelValue')!;
    return emitted[emitted.length - 1]![0] as [Item[], Item[]];
}

describe('PickList', () => {
    it('moves the source selection to the target and back', async () => {
        const wrapper = make();
        const sourceList = wrapper.findAll('[data-slot=list-items]')[0]!;
        await sourceList.findAll('[role=option]')[1]!.trigger('click');
        await wrapper.get('[aria-label="Move to target"]').trigger('click');
        expect(lastModel(wrapper).map((list) => list.map((i) => i.id))).toEqual([['1'], ['2']]);
        await wrapper.setProps({ modelValue: lastModel(wrapper) });
        const targetList = wrapper.findAll('[data-slot=list-items]')[1]!;
        await targetList.findAll('[role=option]')[0]!.trigger('click');
        await wrapper.get('[aria-label="Move to source"]').trigger('click');
        expect(lastModel(wrapper).map((list) => list.map((i) => i.id))).toEqual([['1', '2'], []]);
    });

    it('moves everything with the double arrows', async () => {
        const wrapper = make();
        await wrapper.get('[aria-label="Move all to target"]').trigger('click');
        expect(lastModel(wrapper).map((list) => list.length)).toEqual([0, 2]);
        await wrapper.setProps({ modelValue: lastModel(wrapper) });
        await wrapper.get('[aria-label="Move all to source"]').trigger('click');
        expect(lastModel(wrapper).map((list) => list.length)).toEqual([2, 0]);
    });

    it('reorders inside the target list', async () => {
        const wrapper = make([[], source]);
        const targetList = wrapper.findAll('[data-slot=list-items]')[1]!;
        await targetList.findAll('[role=option]')[1]!.trigger('click');
        await wrapper.findAll('[aria-label="Move up"]')[1]!.trigger('click');
        expect(lastModel(wrapper)[1].map((i) => i.id)).toEqual(['2', '1']);
    });
});
