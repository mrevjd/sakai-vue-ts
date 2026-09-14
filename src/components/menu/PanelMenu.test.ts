import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import PanelMenu from './PanelMenu.vue';

const model = [
    { label: 'Customers', items: [{ label: 'New', items: [{ label: 'Customer' }] }, { label: 'Edit' }] },
    { label: 'Orders', items: [{ label: 'View' }] }
];

describe('PanelMenu', () => {
    it('renders root headers collapsed and expands on click, nested levels included', async () => {
        const wrapper = mount(PanelMenu, { props: { model } });
        expect(wrapper.findAll('[data-slot=panel-menu-header]').map((h) => h.text())).toEqual(['Customers', 'Orders']);
        expect(wrapper.find('[data-slot=panel-menu-item]').exists()).toBe(false);
        await wrapper.findAll('[data-slot=panel-menu-header]')[0]!.trigger('click');
        expect(wrapper.findAll('[data-slot=panel-menu-item]').map((i) => i.text())).toEqual(['New', 'Edit']);
        await wrapper.findAll('[data-slot=panel-menu-item]')[0]!.trigger('click');
        expect(wrapper.findAll('[data-slot=panel-menu-item]').map((i) => i.text())).toEqual(['New', 'Customer', 'Edit']);
    });

    it('collapses again on a second click', async () => {
        const wrapper = mount(PanelMenu, { props: { model } });
        const header = wrapper.findAll('[data-slot=panel-menu-header]')[1]!;
        await header.trigger('click');
        expect(wrapper.findAll('[data-slot=panel-menu-item]')).toHaveLength(1);
        await header.trigger('click');
        expect(wrapper.findAll('[data-slot=panel-menu-item]')).toHaveLength(0);
    });

    it('renders a url leaf as one anchor that runs its command once', async () => {
        const command = vi.fn();
        const leaf = { label: 'Docs', url: 'https://x', command };
        const wrapper = mount(PanelMenu, { props: { model: [leaf] } });
        expect(wrapper.find('button a').exists()).toBe(false);
        await wrapper.get('a[href]').trigger('click');
        expect(command).toHaveBeenCalledTimes(1);
        expect(command).toHaveBeenCalledWith(expect.objectContaining({ item: leaf }));
    });
});
