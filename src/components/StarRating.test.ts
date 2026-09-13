import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StarRating from './StarRating.vue';

describe('StarRating', () => {
    it('renders one radio per star and marks the filled ones', () => {
        const wrapper = mount(StarRating, { props: { modelValue: 3 } });
        const stars = wrapper.findAll('[role=radio]');
        expect(stars).toHaveLength(5);
        expect(stars.map((star) => star.attributes('aria-checked'))).toEqual(['false', 'false', 'true', 'false', 'false']);
        expect(wrapper.findAll('[data-filled=true]')).toHaveLength(3);
    });

    it('emits the clicked value and clears when the current value is clicked again', async () => {
        const wrapper = mount(StarRating, { props: { modelValue: 3 } });
        await wrapper.findAll('[role=radio]')[4]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([5]);
        await wrapper.setProps({ modelValue: 5 });
        await wrapper.findAll('[role=radio]')[4]!.trigger('click');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([null]);
    });

    it('moves with the arrow keys inside the range', async () => {
        const wrapper = mount(StarRating, { props: { modelValue: 5 } });
        const group = wrapper.get('[role=radiogroup]');
        await group.trigger('keydown', { key: 'ArrowRight' });
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        await group.trigger('keydown', { key: 'ArrowLeft' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([4]);
        await wrapper.setProps({ modelValue: null });
        await group.trigger('keydown', { key: 'ArrowUp' });
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([1]);
    });

    it('moves focus to the newly checked star on arrow keys', async () => {
        const wrapper = mount(StarRating, { props: { modelValue: 3 }, attachTo: document.body });
        const buttons = wrapper.findAll('button');
        buttons[2]!.element.focus();
        expect(document.activeElement).toBe(buttons[2]!.element);
        await wrapper.get('[role=radiogroup]').trigger('keydown', { key: 'ArrowRight' });
        expect(document.activeElement).toBe(buttons[3]!.element);
        wrapper.unmount();
    });

    it('ignores clicks and keys when readonly or disabled', async () => {
        const wrapper = mount(StarRating, { props: { modelValue: 2, readonly: true } });
        await wrapper.findAll('[role=radio]')[0]!.trigger('click');
        await wrapper.get('[role=radiogroup]').trigger('keydown', { key: 'ArrowRight' });
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        expect(wrapper.findAll('[role=radio]')[0]!.attributes('tabindex')).toBe('-1');
    });
});
