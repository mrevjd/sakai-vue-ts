import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Timeline from './Timeline.vue';

const events = [
    { status: 'Ordered', date: '15/10/2020 10:30' },
    { status: 'Processing', date: '15/10/2020 14:00' },
    { status: 'Shipped', date: '15/10/2020 16:15' }
];

const slots = {
    content: `<template #content="{ item }"><span data-testid="content">{{ item.status }}</span></template>`,
    opposite: `<template #opposite="{ item }"><small data-testid="opposite">{{ item.date }}</small></template>`
};

describe('Timeline', () => {
    it('renders one event per item with opposite, marker and content, and a connector between events', () => {
        const wrapper = mount(Timeline, { props: { value: events }, slots });
        expect(wrapper.findAll('[data-slot=timeline-event]')).toHaveLength(3);
        expect(wrapper.findAll('[data-testid=content]').map((c) => c.text())).toEqual(['Ordered', 'Processing', 'Shipped']);
        expect(wrapper.findAll('[data-testid=opposite]')).toHaveLength(3);
        expect(wrapper.findAll('[data-slot=timeline-connector]')).toHaveLength(2);
        expect(wrapper.findAll('[data-slot=timeline-marker]')).toHaveLength(3);
    });

    it('records the alignment and layout on the root and alternates event direction', () => {
        const alternate = mount(Timeline, { props: { value: events, align: 'alternate' }, slots });
        expect(alternate.get('[data-slot=timeline]').attributes('data-align')).toBe('alternate');
        expect(alternate.findAll('[data-slot=timeline-event]').map((e) => e.attributes('data-side'))).toEqual(['left', 'right', 'left']);
        const horizontal = mount(Timeline, { props: { value: events, layout: 'horizontal', align: 'bottom' }, slots });
        expect(horizontal.get('[data-slot=timeline]').attributes('data-layout')).toBe('horizontal');
        expect(horizontal.findAll('[data-slot=timeline-event]').map((e) => e.attributes('data-side'))).toEqual(['right', 'right', 'right']);
    });

    it('renders a custom marker slot', () => {
        const wrapper = mount(Timeline, { props: { value: events }, slots: { ...slots, marker: `<template #marker="{ item }"><b data-testid="marker">{{ item.status[0] }}</b></template>` } });
        expect(wrapper.findAll('[data-testid=marker]').map((m) => m.text())).toEqual(['O', 'P', 'S']);
    });
});
