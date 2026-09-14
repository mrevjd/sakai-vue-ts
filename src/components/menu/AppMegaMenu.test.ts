import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import AppMegaMenu from './AppMegaMenu.vue';
import type { MegaMenuItem } from './model';

afterEach(() => {
    document.body.innerHTML = '';
});

// Vertical orientation keeps the content inline (no viewport teleport), so the leaves are queryable through the wrapper.
async function mountOpen(model: MegaMenuItem[]) {
    const wrapper = mount(AppMegaMenu, { props: { model, orientation: 'vertical' }, attachTo: document.body });
    await wrapper.get('[data-slot=navigation-menu-trigger]').trigger('click');
    await nextTick();
    return wrapper;
}

describe('AppMegaMenu', () => {
    it('renders a url leaf as an anchor with no button ancestor', async () => {
        const wrapper = await mountOpen([{ label: 'Videos', items: [[{ label: 'Video 1', items: [{ label: 'Docs', url: 'https://x' }] }]] }]);
        expect(wrapper.get('a[href="https://x"]').text()).toBe('Docs');
        expect(wrapper.find('button a').exists()).toBe(false);
        wrapper.unmount();
    });

    it('runs a leaf command once on click', async () => {
        const command = vi.fn();
        const leaf = { label: 'Docs', url: 'https://x', command };
        const wrapper = await mountOpen([{ label: 'Videos', items: [[{ label: 'Video 1', items: [leaf] }]] }]);
        await wrapper.get('a[href="https://x"]').trigger('click');
        expect(command).toHaveBeenCalledTimes(1);
        expect(command).toHaveBeenCalledWith(expect.objectContaining({ item: leaf }));
        wrapper.unmount();
    });
});
