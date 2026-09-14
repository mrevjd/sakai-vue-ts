import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import SplitButton from './SplitButton.vue';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('SplitButton', () => {
    it('emits click from the main button and runs a model command from the dropdown', async () => {
        const command = vi.fn();
        const wrapper = mount(SplitButton, { props: { label: 'Save', model: [{ label: 'Update', command }, { separator: true }, { label: 'Home' }] }, attachTo: document.body });
        await wrapper.get('[data-slot=split-button-main]').trigger('click');
        expect(wrapper.emitted('click')).toHaveLength(1);
        await wrapper.get('[aria-label="More options"]').trigger('click');
        await nextTick();
        const items = Array.from(document.body.querySelectorAll<HTMLElement>('[role=menuitem]'));
        expect(items.map((i) => i.textContent?.trim())).toEqual(['Update', 'Home']);
        items[0]!.click();
        await nextTick();
        expect(command).toHaveBeenCalledTimes(1);
        wrapper.unmount();
    });

    it('maps severity to the button variant', () => {
        const wrapper = mount(SplitButton, { props: { label: 'Save', model: [], severity: 'danger' } });
        expect(wrapper.get('[data-slot=split-button]').attributes('data-variant')).toBe('destructive');
    });
});
