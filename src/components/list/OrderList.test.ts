import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import OrderList from './OrderList.vue';

interface Item extends Record<string, unknown> {
    id: string;
    name: string;
}

const items: Item[] = [
    { id: '1', name: 'Bamboo Watch' },
    { id: '2', name: 'Black Watch' },
    { id: '3', name: 'Blue Band' }
];

function make(modelValue = items, options: { attachTo?: Element } = {}) {
    return mount(OrderList<Item>, { props: { modelValue, dataKey: 'id' }, slots: { option: `<template #option="{ option }">{{ option.name }}</template>` }, ...options });
}

function lastModel(wrapper: ReturnType<typeof make>): Item[] {
    const emitted = wrapper.emitted('update:modelValue')!;
    return emitted[emitted.length - 1]![0] as Item[];
}

describe('OrderList', () => {
    it('renders the option slot per item and selects on click, with shift and ctrl modifiers', async () => {
        const wrapper = make();
        const options = wrapper.findAll('[role=option]');
        expect(options.map((o) => o.text())).toEqual(['Bamboo Watch', 'Black Watch', 'Blue Band']);
        await options[0]!.trigger('click');
        await options[2]!.trigger('click', { shiftKey: true });
        expect(wrapper.findAll('[role=option][aria-selected=true]')).toHaveLength(3);
        await options[0]!.trigger('click', { ctrlKey: true });
        expect(wrapper.findAll('[role=option][aria-selected=true]')).toHaveLength(2);
    });

    it('moves the selection with the four buttons and emits the new order', async () => {
        const wrapper = make();
        await wrapper.findAll('[role=option]')[1]!.trigger('click');
        await wrapper.get('[aria-label="Move up"]').trigger('click');
        expect(lastModel(wrapper).map((i) => i.id)).toEqual(['2', '1', '3']);
        await wrapper.setProps({ modelValue: lastModel(wrapper) });
        await wrapper.get('[aria-label="Move bottom"]').trigger('click');
        expect(lastModel(wrapper).map((i) => i.id)).toEqual(['1', '3', '2']);
        await wrapper.setProps({ modelValue: lastModel(wrapper) });
        await wrapper.get('[aria-label="Move top"]').trigger('click');
        expect(lastModel(wrapper).map((i) => i.id)).toEqual(['2', '1', '3']);
        await wrapper.setProps({ modelValue: lastModel(wrapper) });
        await wrapper.get('[aria-label="Move down"]').trigger('click');
        expect(lastModel(wrapper).map((i) => i.id)).toEqual(['1', '2', '3']);
    });

    it('does nothing with no selection', async () => {
        const wrapper = make();
        await wrapper.get('[aria-label="Move up"]').trigger('click');
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('moves focus with ArrowDown and selects the focused option with Space', async () => {
        const wrapper = make(items, { attachTo: document.body });
        const options = wrapper.findAll('[data-slot=list-item]');
        expect(options.map((o) => o.attributes('tabindex'))).toEqual(['0', '-1', '-1']);
        (options[0]!.element as HTMLElement).focus();
        await options[0]!.trigger('keydown', { key: 'ArrowDown' });
        expect(document.activeElement).toBe(options[1]!.element);
        expect(options.map((o) => o.attributes('tabindex'))).toEqual(['-1', '0', '-1']);
        await options[1]!.trigger('keydown', { key: ' ' });
        expect(options[1]!.attributes('aria-selected')).toBe('true');
        expect(wrapper.findAll('[role=option][aria-selected=true]')).toHaveLength(1);
        wrapper.unmount();
    });

    it('extends the selection with Shift+ArrowDown from a selected option', async () => {
        const wrapper = make(items, { attachTo: document.body });
        const options = wrapper.findAll('[data-slot=list-item]');
        await options[0]!.trigger('click');
        (options[0]!.element as HTMLElement).focus();
        await options[0]!.trigger('keydown', { key: 'ArrowDown', shiftKey: true });
        expect(document.activeElement).toBe(options[1]!.element);
        expect(options.map((o) => o.attributes('aria-selected'))).toEqual(['true', 'true', 'false']);
        wrapper.unmount();
    });
});
