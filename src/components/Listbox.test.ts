import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Listbox from './Listbox.vue';

const options = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' }
];

describe('Listbox', () => {
    it('renders labels from optionLabel and emits the option on click', async () => {
        const wrapper = mount(Listbox, { props: { modelValue: null, options, optionLabel: 'name' } });
        expect(wrapper.findAll('[role=option]').map((o) => o.text())).toEqual(['New York', 'Rome', 'London']);
        await wrapper.findAll('[role=option]')[1]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([options[1]]);
    });

    it('emits optionValue when set and toggles in multiple mode', async () => {
        const wrapper = mount(Listbox, { props: { modelValue: [], options, optionLabel: 'name', optionValue: 'code', multiple: true } });
        await wrapper.findAll('[role=option]')[0]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([['NY']]);
    });

    it('filters options from the filter input', async () => {
        const wrapper = mount(Listbox, { props: { modelValue: null, options, optionLabel: 'name', filter: true } });
        await wrapper.get('[data-slot=listbox-filter]').setValue('lon');
        expect(wrapper.findAll('[role=option]').map((o) => o.text())).toEqual(['London']);
    });
});
