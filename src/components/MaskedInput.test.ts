import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MaskedInput from './MaskedInput.vue';

// Two drains, not one: the keystroke renders first, then the component waits a tick for the vendored
// input's own model guard to clear before writing the masked value, which renders on the drain after.
async function type(wrapper: ReturnType<typeof mount>, value: string): Promise<HTMLInputElement> {
    const input = wrapper.get('[data-slot=masked-input]');
    (input.element as HTMLInputElement).value = value;
    await input.trigger('input');
    await flushPromises();
    await flushPromises();
    return input.element as HTMLInputElement;
}

describe('MaskedInput', () => {
    it('rejects a character the placeholder does not accept and does not leave it in the field', async () => {
        // The model does not change here, so only the write-back can clear the stray character.
        const wrapper = mount(MaskedInput, { props: { mask: '9999', modelValue: '12__' } });
        const element = await type(wrapper, '12a');
        expect(element.value).toBe('12__');
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('accepts a valid character and emits the masked value', async () => {
        const wrapper = mount(MaskedInput, { props: { mask: '9999', modelValue: '12__' } });
        const element = await type(wrapper, '123');
        expect(element.value).toBe('123_');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['123_']);
    });

    it('emits only the typed characters when unmask is set', async () => {
        const wrapper = mount(MaskedInput, { props: { mask: '(999) 999-9999', modelValue: '', unmask: true } });
        await type(wrapper, '912');
        expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['912']);
    });

    it('keeps the later of two keystrokes that arrive inside the correction window', async () => {
        // The correction is deferred by a tick, so a second keystroke lands while the first is still
        // pending. The last one typed has to win; a stale correction overwriting it would be the bug.
        const wrapper = mount(MaskedInput, { props: { mask: '9999', modelValue: '1___' } });
        const input = wrapper.get('[data-slot=masked-input]');
        (input.element as HTMLInputElement).value = '1a';
        await input.trigger('input');
        (input.element as HTMLInputElement).value = '12';
        await input.trigger('input');
        await flushPromises();
        await flushPromises();
        expect((input.element as HTMLInputElement).value).toBe('12__');
    });

    it('falls back to the mask as the placeholder and marks an incomplete value invalid', () => {
        const wrapper = mount(MaskedInput, { props: { mask: '99/99', modelValue: '12' } });
        const element = wrapper.get('[data-slot=masked-input]').element as HTMLInputElement;
        expect(element.getAttribute('placeholder')).toBe('99/99');
        expect(element.getAttribute('aria-invalid')).toBe('true');
    });
});
