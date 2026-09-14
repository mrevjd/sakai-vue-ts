import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ColorPicker from './ColorPicker.vue';

describe('ColorPicker', () => {
    it('emits the picked hex value and reflects the model', async () => {
        const wrapper = mount(ColorPicker, { props: { modelValue: '#1976d2' } });
        const input = wrapper.get('input[type=color]');
        expect((input.element as HTMLInputElement).value).toBe('#1976d2');
        await input.setValue('#ff0000');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['#ff0000']);
    });

    it('accepts a value without the hash and normalises it', () => {
        const wrapper = mount(ColorPicker, { props: { modelValue: 'FF00AA' } });
        expect((wrapper.get('input[type=color]').element as HTMLInputElement).value).toBe('#ff00aa');
    });

    it('marks the inline variant', () => {
        expect(
            mount(ColorPicker, { props: { modelValue: '#000000', inline: true } })
                .get('[data-slot=color-picker]')
                .attributes('data-inline')
        ).toBe('true');
    });
});
