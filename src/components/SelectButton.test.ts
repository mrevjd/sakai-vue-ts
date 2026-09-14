import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import SelectButton from './SelectButton.vue';

const options = [{ name: 'Option 1' }, { name: 'Option 2' }];

describe('SelectButton', () => {
    it('emits the clicked option and renders the option slot', async () => {
        const wrapper = mount(SelectButton, { props: { modelValue: null, options, optionLabel: 'name' }, slots: { option: `<template #option="{ option }"><i data-testid="opt">{{ option.name }}</i></template>` } });
        expect(wrapper.findAll('[data-testid=opt]')).toHaveLength(2);
        await wrapper.findAll('button')[1]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([options[1]]);
    });

    it('keeps the value when allowEmpty is false and the active option is clicked again', async () => {
        const wrapper = mount(SelectButton, { props: { modelValue: 'list', options: ['list', 'grid'], allowEmpty: false } });
        await wrapper.findAll('button')[0]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
});
