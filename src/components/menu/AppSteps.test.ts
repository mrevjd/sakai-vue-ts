import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppSteps from './AppSteps.vue';

const model = [{ label: 'Header I' }, { label: 'Header II' }, { label: 'Header III' }];

describe('AppSteps', () => {
    it('renders each step with its number, marks the active one and moves on click when not readonly', async () => {
        const wrapper = mount(AppSteps, { props: { model, activeStep: 0, readonly: false } });
        expect(wrapper.findAll('[data-slot=stepper-title]').map((t) => t.text())).toEqual(['Header I', 'Header II', 'Header III']);
        expect(wrapper.findAll('[data-slot=stepper-item]')[0]!.attributes('data-state')).toBe('active');
        await wrapper.findAll('[data-slot=stepper-trigger]')[1]!.trigger('mousedown', { button: 0 });
        expect(wrapper.emitted('update:activeStep')!.at(-1)).toEqual([1]);
    });

    it('ignores clicks when readonly', async () => {
        const wrapper = mount(AppSteps, { props: { model, activeStep: 0 } });
        await wrapper.findAll('[data-slot=stepper-trigger]')[2]!.trigger('mousedown', { button: 0 });
        expect(wrapper.emitted('update:activeStep')).toBeUndefined();
    });
});
