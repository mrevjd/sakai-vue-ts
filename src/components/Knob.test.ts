import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Knob from './Knob.vue';

describe('Knob', () => {
    it('renders the value through valueTemplate and exposes slider semantics', () => {
        const wrapper = mount(Knob, { props: { modelValue: 20, min: -50, max: 50, step: 10, valueTemplate: '{value}%' } });
        expect(wrapper.get('[data-slot=knob-value]').text()).toBe('20%');
        const dial = wrapper.get('[role=slider]');
        expect(dial.attributes('aria-valuemin')).toBe('-50');
        expect(dial.attributes('aria-valuemax')).toBe('50');
        expect(dial.attributes('aria-valuenow')).toBe('20');
    });

    it('clamps an out-of-range bound value for display and ARIA without emitting', () => {
        const wrapper = mount(Knob, { props: { modelValue: 150, max: 100 } });
        expect(wrapper.get('[role=slider]').attributes('aria-valuenow')).toBe('100');
        expect(wrapper.get('[data-slot=knob-value]').text()).toBe('100');
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('steps with the keyboard and clamps at the ends', async () => {
        const wrapper = mount(Knob, { props: { modelValue: 45, min: 0, max: 50, step: 10 } });
        const dial = wrapper.get('[role=slider]');
        await dial.trigger('keydown', { key: 'ArrowUp' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([50]);
        await wrapper.setProps({ modelValue: 50 });
        await dial.trigger('keydown', { key: 'ArrowRight' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([50]);
        await dial.trigger('keydown', { key: 'Home' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([0]);
        await dial.trigger('keydown', { key: 'End' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([50]);
    });

    it('ignores input when readonly or disabled', async () => {
        const readonly = mount(Knob, { props: { modelValue: 10, readonly: true } });
        await readonly.get('[role=slider]').trigger('keydown', { key: 'ArrowUp' });
        expect(readonly.emitted('update:modelValue')).toBeUndefined();
        const disabled = mount(Knob, { props: { modelValue: 10, disabled: true } });
        await disabled.get('[role=slider]').trigger('keydown', { key: 'ArrowUp' });
        expect(disabled.emitted('update:modelValue')).toBeUndefined();
        expect(disabled.get('[role=slider]').attributes('aria-disabled')).toBe('true');
    });
});
