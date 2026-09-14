import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import MultiSelect from './MultiSelect.vue';

const options = [
    { name: 'Australia', code: 'AU' },
    { name: 'Brazil', code: 'BR' },
    { name: 'China', code: 'CN' }
];

afterEach(() => {
    document.body.innerHTML = '';
});

async function open(wrapper: ReturnType<typeof mount>): Promise<void> {
    await wrapper.get('[data-slot=multi-select-trigger]').trigger('click');
    await nextTick();
}

function items(): HTMLElement[] {
    return Array.from(document.body.querySelectorAll<HTMLElement>('[role=option]'));
}

describe('MultiSelect', () => {
    it('shows the placeholder, then chips for each picked option', async () => {
        const wrapper = mount(MultiSelect, { props: { modelValue: [], options, optionLabel: 'name', placeholder: 'Select Countries' }, attachTo: document.body });
        expect(wrapper.get('[data-slot=multi-select-trigger]').text()).toBe('Select Countries');
        await open(wrapper);
        items()[0]!.click();
        await nextTick();
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([[options[0]]]);
        await wrapper.setProps({ modelValue: [options[0], options[2]] });
        expect(wrapper.findAll('[data-slot=multi-select-chip]').map((c) => c.text())).toEqual(['Australia', 'China']);
        wrapper.unmount();
    });

    it('collapses to a count past maxSelectedLabels and offers select all', async () => {
        const wrapper = mount(MultiSelect, { props: { modelValue: [options[0], options[1], options[2]], options, optionLabel: 'name', maxSelectedLabels: 2, selectAll: true }, attachTo: document.body });
        expect(wrapper.get('[data-slot=multi-select-trigger]').text()).toBe('3 items selected');
        await open(wrapper);
        document.body.querySelector<HTMLElement>('[data-slot=multi-select-select-all]')!.click();
        await nextTick();
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([[]]);
        wrapper.unmount();
    });

    it('renders the option slot', async () => {
        const wrapper = mount(MultiSelect, {
            props: { modelValue: [], options, optionLabel: 'name' },
            slots: { option: `<template #option="{ option }"><span data-testid="opt">{{ option.code }}</span></template>` },
            attachTo: document.body
        });
        await open(wrapper);
        expect(Array.from(document.body.querySelectorAll('[data-testid=opt]')).map((el) => el.textContent)).toEqual(['AU', 'BR', 'CN']);
        wrapper.unmount();
    });
});
