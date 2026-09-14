import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FloatLabel from './FloatLabel.vue';

describe('FloatLabel', () => {
    it('sets a single-space placeholder on a wrapped input that has none', () => {
        const wrapper = mount(FloatLabel, { slots: { default: '<input id="a" /><label for="a">Name</label>' } });
        expect(wrapper.get('input').attributes('placeholder')).toBe(' ');
    });

    it('leaves an existing placeholder alone', () => {
        const wrapper = mount(FloatLabel, { slots: { default: '<input placeholder="Name" />' } });
        expect(wrapper.get('input').attributes('placeholder')).toBe('Name');
    });

    it('marks the root with the slot and the variant', () => {
        expect(mount(FloatLabel).get('[data-slot=float-label]').attributes('data-variant')).toBe('over');
        expect(
            mount(FloatLabel, { props: { variant: 'in' } })
                .get('[data-slot=float-label]')
                .attributes('data-variant')
        ).toBe('in');
    });
});
