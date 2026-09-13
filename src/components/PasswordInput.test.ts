import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PasswordInput from './PasswordInput.vue';

describe('PasswordInput', () => {
    it('masks by default and toggles to text from the eye button', async () => {
        const wrapper = mount(PasswordInput, { props: { modelValue: 'secret', id: 'pw' } });
        const input = wrapper.get('input');
        expect(input.attributes('type')).toBe('password');
        expect(input.attributes('id')).toBe('pw');
        await wrapper.get('[data-testid=password-toggle]').trigger('click');
        expect(input.attributes('type')).toBe('text');
        await wrapper.get('[data-testid=password-toggle]').trigger('click');
        expect(input.attributes('type')).toBe('password');
    });

    it('emits the typed value', async () => {
        const wrapper = mount(PasswordInput, { props: { modelValue: '' } });
        await wrapper.get('input').setValue('Abcdefg1');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['Abcdefg1']);
    });

    it('shows the strength label that matches the value when feedback is on', async () => {
        const wrapper = mount(PasswordInput, { props: { modelValue: 'abc' } });
        expect(wrapper.get('[data-testid=password-strength]').text()).toBe('Weak');
        await wrapper.setProps({ modelValue: 'Abcdefg1' });
        expect(wrapper.get('[data-testid=password-strength]').text()).toBe('Strong');
        await wrapper.setProps({ modelValue: '' });
        expect(wrapper.find('[data-testid=password-strength]').exists()).toBe(false);
    });

    it('renders neither the meter nor the toggle when they are switched off', () => {
        const wrapper = mount(PasswordInput, { props: { modelValue: 'abc', feedback: false, toggleMask: false } });
        expect(wrapper.find('[data-testid=password-strength]').exists()).toBe(false);
        expect(wrapper.find('[data-testid=password-toggle]').exists()).toBe(false);
    });
});
