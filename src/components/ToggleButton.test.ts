import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ToggleButton from './ToggleButton.vue';

describe('ToggleButton', () => {
    it('shows the off label, toggles on click and shows the on label', async () => {
        const wrapper = mount(ToggleButton, { props: { modelValue: false, onLabel: 'Yes', offLabel: 'No' } });
        expect(wrapper.text()).toBe('No');
        expect(wrapper.get('button').attributes('aria-pressed')).toBe('false');
        await wrapper.get('button').trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([true]);
        await wrapper.setProps({ modelValue: true });
        expect(wrapper.text()).toBe('Yes');
    });
});
