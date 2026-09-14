import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DataView from './DataView.vue';

interface Item extends Record<string, unknown> {
    id: string;
    name: string;
    price: number;
}

const items: Item[] = [
    { id: '1', name: 'Bamboo Watch', price: 65 },
    { id: '2', name: 'Black Watch', price: 72 },
    { id: '3', name: 'Blue Band', price: 79 }
];

const slots = {
    list: `<template #list="{ items }"><ul data-testid="list"><li v-for="item in items" :key="item.id">{{ item.name }}</li></ul></template>`,
    grid: `<template #grid="{ items }"><div data-testid="grid">{{ items.length }}</div></template>`,
    header: `<template #header><div data-testid="header">Products</div></template>`
};

describe('DataView', () => {
    it('renders the list slot by default and the grid slot when layout is grid', async () => {
        const wrapper = mount(DataView<Item>, { props: { value: items }, slots });
        expect(wrapper.get('[data-testid=header]').text()).toBe('Products');
        expect(wrapper.findAll('[data-testid=list] li').map((li) => li.text())).toEqual(['Bamboo Watch', 'Black Watch', 'Blue Band']);
        await wrapper.setProps({ layout: 'grid' });
        expect(wrapper.get('[data-testid=grid]').text()).toBe('3');
    });

    it('sorts by sortField and sortOrder', () => {
        const wrapper = mount(DataView<Item>, { props: { value: items, sortField: 'price', sortOrder: -1 }, slots });
        expect(wrapper.findAll('[data-testid=list] li').map((li) => li.text())).toEqual(['Blue Band', 'Black Watch', 'Bamboo Watch']);
    });

    it('paginates and moves pages through the paginator', async () => {
        const wrapper = mount(DataView<Item>, { props: { value: items, paginator: true, rows: 2 }, slots });
        expect(wrapper.findAll('[data-testid=list] li')).toHaveLength(2);
        expect(wrapper.get('[data-testid=data-table-report]').text()).toBe('Showing 1 to 2 of 3 entries');
        await wrapper.get('[aria-label="Next page"]').trigger('click');
        expect(wrapper.findAll('[data-testid=list] li').map((li) => li.text())).toEqual(['Blue Band']);
    });

    it('resets to the first page when rows changes', async () => {
        const wrapper = mount(DataView<Item>, { props: { value: items, paginator: true, rows: 2 }, slots });
        await wrapper.get('[aria-label="Next page"]').trigger('click');
        await wrapper.setProps({ rows: 10 });
        expect(wrapper.findAll('[data-testid=list] li').map((li) => li.text())).toEqual(['Bamboo Watch', 'Black Watch', 'Blue Band']);
        expect(wrapper.get('[data-testid=data-table-report]').text()).toBe('Showing 1 to 3 of 3 entries');
    });

    it('falls back to the default page size when rows is zero', () => {
        const wrapper = mount(DataView<Item>, { props: { value: items, paginator: true, rows: 0 }, slots });
        expect(wrapper.get('[data-testid=data-table-report]').text()).toBe('Showing 1 to 3 of 3 entries');
        expect(wrapper.findAll('[data-testid=list] li')).toHaveLength(3);
    });

    it('renders the empty slot with no items', () => {
        const wrapper = mount(DataView<Item>, { props: { value: [] }, slots: { ...slots, empty: 'Nothing to show' } });
        expect(wrapper.text()).toContain('Nothing to show');
    });
});
