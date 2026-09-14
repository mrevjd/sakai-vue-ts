import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TreeSelect from './TreeSelect.vue';
import type { TreeNodeLike } from './model';

const options: TreeNodeLike[] = [
    { key: '0', label: 'Documents', children: [{ key: '0-0', label: 'Work' }] },
    { key: '1', label: 'Events' }
];

afterEach(() => {
    document.body.innerHTML = '';
});

describe('TreeSelect', () => {
    it('shows the placeholder, opens the tree, and reflects the picked node in the trigger', async () => {
        const wrapper = mount(TreeSelect, { props: { options, placeholder: 'Select Item' }, attachTo: document.body });
        const trigger = wrapper.get('[data-slot=tree-select-trigger]');
        expect(trigger.text()).toBe('Select Item');
        await trigger.trigger('click');
        await nextTick();
        const events = Array.from(document.body.querySelectorAll('[data-slot=tree-node]')).find((el) => el.textContent?.trim() === 'Events') as HTMLElement;
        events.click();
        await nextTick();
        const emitted = wrapper.emitted('update:modelValue')!;
        expect(emitted[emitted.length - 1]![0]).toEqual({ '1': true });
        await wrapper.setProps({ modelValue: { '1': true } });
        expect(trigger.text()).toBe('Events');
        wrapper.unmount();
    });

    it('lists every checked label in checkbox mode', () => {
        const wrapper = mount(TreeSelect, { props: { options, selectionMode: 'checkbox', modelValue: { '0-0': { checked: true, partialChecked: false }, '1': { checked: true, partialChecked: false } } } });
        expect(wrapper.get('[data-slot=tree-select-trigger]').text()).toBe('Work, Events');
    });
});
