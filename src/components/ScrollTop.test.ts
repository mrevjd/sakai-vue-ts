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
});
