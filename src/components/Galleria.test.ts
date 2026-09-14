import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Galleria from './Galleria.vue';

const value = [
    { itemImageSrc: '/a.jpg', thumbnailImageSrc: '/a-s.jpg', alt: 'A' },
    { itemImageSrc: '/b.jpg', thumbnailImageSrc: '/b-s.jpg', alt: 'B' },
    { itemImageSrc: '/c.jpg', thumbnailImageSrc: '/c-s.jpg', alt: 'C' }
];

describe('Galleria', () => {
    it('renders every item through the item slot, thumbnails and indicators', () => {
        const wrapper = mount(Galleria, {
            props: { value, showIndicators: true, numVisible: 2 },
            slots: {
                item: `<template #item="{ item }"><img :src="item.itemImageSrc" :alt="item.alt" data-testid="item" /></template>`,
                thumbnail: `<template #thumbnail="{ item }"><img :src="item.thumbnailImageSrc" :alt="item.alt" data-testid="thumb" /></template>`
            }
        });
        expect(wrapper.findAll('[data-testid=item]')).toHaveLength(3);
        expect(wrapper.findAll('[data-testid=thumb]')).toHaveLength(3);
        expect(wrapper.findAll('[data-slot=galleria-indicator]')).toHaveLength(3);
        expect(wrapper.get('[data-slot=galleria-thumbnail]').attributes('style')).toContain('flex-basis: 50%');
    });

    it('activates the clicked thumbnail and indicator and emits the index', async () => {
        const wrapper = mount(Galleria, { props: { value, showIndicators: true } });
        await wrapper.findAll('[data-slot=galleria-thumbnail]')[2]!.trigger('click');
        expect(wrapper.emitted('update:activeIndex')!.at(-1)).toEqual([2]);
        expect(wrapper.findAll('[data-slot=galleria-thumbnail]')[2]!.attributes('data-active')).toBe('true');
        await wrapper.findAll('[data-slot=galleria-indicator]')[0]!.trigger('click');
        expect(wrapper.emitted('update:activeIndex')!.at(-1)).toEqual([0]);
    });

    it('shows the fullscreen toggle only when asked and renders no thumbnails when hidden', () => {
        const plain = mount(Galleria, { props: { value, showThumbnails: false } });
        expect(plain.find('[data-slot=galleria-thumbnail]').exists()).toBe(false);
        expect(plain.find('[aria-label="Toggle fullscreen"]').exists()).toBe(false);
        const full = mount(Galleria, { props: { value, fullScreen: true } });
        expect(full.find('[aria-label="Toggle fullscreen"]').exists()).toBe(true);
    });
});
