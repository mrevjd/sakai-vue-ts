import { mount, RouterLinkStub } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import MenuList from './MenuList.vue';
import type { MenuModelItem } from './model';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('MenuList', () => {
    it('renders groups, items and separators inline and runs commands', async () => {
        const command = vi.fn();
        const model: MenuModelItem[] = [{ label: 'Customers', items: [{ label: 'New', command }, { label: 'Edit' }] }, { separator: true }, { label: 'Quit' }];
        const wrapper = mount(MenuList, { props: { model } });
        expect(wrapper.findAll('[data-slot=menu-group-label]').map((g) => g.text())).toEqual(['Customers']);
        expect(wrapper.findAll('[role=menuitem]').map((i) => i.text())).toEqual(['New', 'Edit', 'Quit']);
        expect(wrapper.findAll('[role=separator]')).toHaveLength(1);
        await wrapper.findAll('[role=menuitem]')[0]!.trigger('click');
        expect(command).toHaveBeenCalledWith(expect.objectContaining({ item: model[0]!.items![0] }));
    });

    it('in popup mode renders the trigger slot and opens the items in a dropdown', async () => {
        const wrapper = mount(MenuList, { props: { model: [{ label: 'Save' }, { label: 'Update' }], popup: true }, slots: { trigger: '<button data-testid="open">Options</button>' }, attachTo: document.body });
        expect(document.body.querySelector('[role=menuitem]')).toBeNull();
        await wrapper.get('[data-testid=open]').trigger('click');
        await nextTick();
        expect(Array.from(document.body.querySelectorAll('[role=menuitem]')).map((i) => i.textContent?.trim())).toEqual(['Save', 'Update']);
        wrapper.unmount();
    });

    it('skips items with visible false and disables disabled ones', () => {
        const wrapper = mount(MenuList, { props: { model: [{ label: 'Shown' }, { label: 'Hidden', visible: false }, { label: 'Off', disabled: true }] } });
        expect(wrapper.findAll('[role=menuitem]').map((i) => i.text())).toEqual(['Shown', 'Off']);
        expect(wrapper.findAll('[role=menuitem]')[1]!.attributes('aria-disabled')).toBe('true');
    });

    it('renders an inline routed item as the single menuitem element and runs its command once', async () => {
        const command = vi.fn();
        const item: MenuModelItem = { label: 'Router', to: '/x', command };
        const wrapper = mount(MenuList, { props: { model: [item] }, global: { stubs: { RouterLink: RouterLinkStub } } });
        const menuitem = wrapper.get('[role=menuitem]');
        expect(menuitem.element.tagName).toBe('A');
        expect(wrapper.find('[role=menuitem] a, [role=menuitem] button, button a, a button').exists()).toBe(false);
        await menuitem.trigger('click');
        expect(command).toHaveBeenCalledTimes(1);
        expect(command).toHaveBeenCalledWith(expect.objectContaining({ item }));
    });

    it('in popup mode a routed item is the menuitem itself and a click runs its command once', async () => {
        const command = vi.fn();
        const item: MenuModelItem = { label: 'Router', to: '/x', command };
        const wrapper = mount(MenuList, { props: { model: [item], popup: true }, slots: { trigger: '<button data-testid="open">Options</button>' }, global: { stubs: { RouterLink: RouterLinkStub } }, attachTo: document.body });
        await wrapper.get('[data-testid=open]').trigger('click');
        await nextTick();
        const menuitem = document.body.querySelector<HTMLElement>('[role=menuitem]');
        expect(menuitem?.tagName).toBe('A');
        expect(document.body.querySelector('[role=menuitem] a, [role=menuitem] button')).toBeNull();
        menuitem!.click();
        await nextTick();
        expect(command).toHaveBeenCalledTimes(1);
        wrapper.unmount();
    });
});
