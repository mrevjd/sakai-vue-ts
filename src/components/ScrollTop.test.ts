import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import ScrollTop from './ScrollTop.vue';

const Host = defineComponent({
    setup: () => () => h('div', { style: 'height: 200px; overflow: auto', 'data-testid': 'scroller' }, [h('div', { style: 'height: 2000px' }), h(ScrollTop, { target: 'parent', threshold: 100 })])
});

describe('ScrollTop', () => {
    it('appears past the threshold and scrolls its parent to the top', async () => {
        const wrapper = mount(Host, { attachTo: document.body });
        const scroller = wrapper.get('[data-testid=scroller]').element as HTMLElement;
        scroller.scrollTo = vi.fn();
        // useScroll attaches its listener from a post-flush watcher, one microtask after mount.
        await nextTick();
        expect(wrapper.find('[data-slot=scroll-top]').exists()).toBe(false);
        scroller.scrollTop = 500;
        scroller.dispatchEvent(new Event('scroll'));
        await nextTick();
        expect(wrapper.find('[data-slot=scroll-top]').exists()).toBe(true);
        await wrapper.get('[data-slot=scroll-top]').trigger('click');
        expect(scroller.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        wrapper.unmount();
    });

    it('watches the window and scrolls it in the default target mode', async () => {
        // The two modes position differently and only one of them had a test, so this pins the other.
        const scrollTo = vi.fn();
        Object.defineProperty(window, 'scrollTo', { value: scrollTo, writable: true });
        const wrapper = mount(ScrollTop, { props: { threshold: 100, behavior: 'auto' }, attachTo: document.body });
        await nextTick();
        expect(wrapper.find('[data-slot=scroll-top]').exists()).toBe(false);
        // A browser targets a window scroll at the document and useScroll reads the offset off
        // documentElement, so the event is dispatched there and bubbled up to the window listener.
        Object.defineProperty(document.documentElement, 'scrollTop', { value: 500, writable: true, configurable: true });
        document.dispatchEvent(new Event('scroll', { bubbles: true }));
        await nextTick();
        expect(wrapper.find('[data-slot=scroll-top]').exists()).toBe(true);
        await wrapper.get('[data-slot=scroll-top]').trigger('click');
        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
        wrapper.unmount();
    });
});
