import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TieredMenu from './TieredMenu.vue';

describe('TieredMenu', () => {
    it('renders every level with submenu markers and separators', () => {
        const wrapper = mount(TieredMenu, {
            props: { model: [{ label: 'Customers', items: [{ label: 'New', items: [{ label: 'Customer' }] }, { label: 'Edit' }] }, { separator: true }, { label: 'Quit' }] }
        });
        expect(wrapper.findAll('[role=menuitem]').map((i) => i.text())).toEqual(['Customers', 'New', 'Customer', 'Edit', 'Quit']);
        expect(wrapper.findAll('[data-slot=tiered-menu-submenu]')).toHaveLength(2);
        expect(wrapper.findAll('[aria-haspopup=menu]')).toHaveLength(2);
        expect(wrapper.findAll('[role=separator]')).toHaveLength(1);
    });
});
