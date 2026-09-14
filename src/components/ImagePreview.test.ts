import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import ImagePreview from './ImagePreview.vue';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('ImagePreview', () => {
    it('renders the image with its size and opens a zoomable overlay on click', async () => {
        const wrapper = mount(ImagePreview, { props: { src: '/x.jpg', alt: 'X', width: '250' }, attachTo: document.body });
        const image = wrapper.get('img');
        expect(image.attributes('width')).toBe('250');
        expect(document.body.querySelector('[role=dialog]')).toBeNull();
        await wrapper.get('[data-slot=image-preview-trigger]').trigger('click');
        await nextTick();
        const overlay = document.body.querySelector<HTMLImageElement>('[data-slot=image-preview-overlay-image]')!;
        expect(overlay.getAttribute('src')).toBe('/x.jpg');
        expect(overlay.style.transform).toBe('rotate(0deg) scale(1)');
        document.body.querySelector<HTMLButtonElement>('[aria-label="Zoom in"]')!.click();
        await nextTick();
        expect(overlay.style.transform).toBe('rotate(0deg) scale(1.1)');
        document.body.querySelector<HTMLButtonElement>('[aria-label="Rotate right"]')!.click();
        await nextTick();
        expect(overlay.style.transform).toBe('rotate(90deg) scale(1.1)');
        wrapper.unmount();
    });

    it('renders a plain image when preview is off', () => {
        const wrapper = mount(ImagePreview, { props: { src: '/x.jpg', preview: false } });
        expect(wrapper.find('[data-slot=image-preview-trigger]').exists()).toBe(false);
    });
});
