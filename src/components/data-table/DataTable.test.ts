import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { createColumns, DataTable } from './index';

interface Product extends Record<string, unknown> {
    id: string;
    name: string;
    price: number;
    added: Date;
    children?: Product[];
}

const helper = createColumns<Product>();
const columns = helper.columns([
    helper.accessor('name', { header: 'Name', meta: { filter: { type: 'text' } } }),
    helper.accessor('price', { header: 'Price', cell: (ctx) => `$${ctx.getValue()}`, meta: { filter: { type: 'numeric', matchModes: ['gt', 'lt'] } } }),
    helper.accessor('added', { header: 'Added', cell: (ctx) => ctx.getValue().toDateString(), enableGlobalFilter: false, meta: { filter: { type: 'custom' } } })
]);

const products: Product[] = [
    { id: '1', name: 'banana', price: 3, added: new Date(2024, 0, 1), children: [{ id: '1a', name: 'banana child', price: 1, added: new Date(2024, 0, 2) }] },
    { id: '2', name: 'apple', price: 5, added: new Date(2024, 1, 1) },
    { id: '3', name: 'cherry', price: 2, added: new Date(2024, 2, 1) },
    { id: '4', name: 'date', price: 9, added: new Date(2024, 3, 1) },
    { id: '5', name: 'elder', price: 4, added: new Date(2024, 4, 1) }
];

type Exposed = { visibleRows: () => Product[]; selectedRows: () => Product[]; clearFilters: () => void };

function make(extra: Record<string, unknown> = {}, slots: Record<string, string> = {}, options: { attachTo?: Element } = {}) {
    return mount(DataTable<Product>, { props: { columns, data: products, rowKey: 'id', paginator: true, pageSize: 2, ...extra }, slots, ...options });
}

function report(wrapper: ReturnType<typeof make>): string {
    return wrapper.get('[data-testid=data-table-report]').text();
}

describe('DataTable', () => {
    it('paginates and reports the visible range', async () => {
        const wrapper = make();
        expect(wrapper.findAll('tbody tr')).toHaveLength(2);
        expect(report(wrapper)).toBe('Showing 1 to 2 of 5 entries');
        await wrapper.get('[aria-label="Next page"]').trigger('click');
        expect(report(wrapper)).toBe('Showing 3 to 4 of 5 entries');
        await wrapper.get('[aria-label="Last page"]').trigger('click');
        expect(report(wrapper)).toBe('Showing 5 to 5 of 5 entries');
        expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    });

    it('sorts when a sortable header is clicked', async () => {
        const wrapper = make();
        const nameHeader = wrapper.findAll('[data-slot=data-table-sort]')[0]!;
        await nameHeader.trigger('click');
        expect(wrapper.findAll('tbody tr')[0]!.text()).toContain('apple');
        await nameHeader.trigger('click');
        expect(wrapper.findAll('tbody tr')[0]!.text()).toContain('elder');
    });

    it('applies the global filter model', async () => {
        const wrapper = make({ globalFilter: 'an' });
        await nextTick();
        expect(wrapper.findAll('tbody tr')).toHaveLength(1);
        expect(wrapper.findAll('tbody tr')[0]!.text()).toContain('banana');
        expect(report(wrapper)).toBe('Showing 1 to 1 of 1 entries');
        expect((wrapper.vm as unknown as Exposed).visibleRows()).toHaveLength(1);
    });

    it('selects rows through the checkbox column and clears from the model', async () => {
        const wrapper = make({ selectable: true });
        const boxes = wrapper.findAll('[data-slot=checkbox]');
        expect(boxes).toHaveLength(3);
        await boxes[1]!.trigger('click');
        const emitted = wrapper.emitted('update:selection');
        expect(emitted).toBeTruthy();
        const last = emitted![emitted!.length - 1]![0] as Product[];
        expect(last.map((p) => p.name)).toEqual(['banana']);
        expect(wrapper.findAll('tbody tr[data-state=selected]')).toHaveLength(1);
        await wrapper.setProps({ selection: [] });
        await nextTick();
        expect(wrapper.findAll('tbody tr[data-state=selected]')).toHaveLength(0);
        expect((wrapper.vm as unknown as Exposed).selectedRows()).toHaveLength(0);
    });

    it('selects every row on the page from the header checkbox', async () => {
        const wrapper = make({ selectable: true });
        await wrapper.findAll('[data-slot=checkbox]')[0]!.trigger('click');
        expect((wrapper.vm as unknown as Exposed).selectedRows().map((p) => p.name)).toEqual(['banana', 'apple']);
    });

    it('expands sub rows from the row toggle', async () => {
        const wrapper = make({ subRowsKey: 'children' });
        await wrapper.get('[aria-label="Expand row"]').trigger('click');
        const rows = wrapper.findAll('tbody tr');
        expect(rows[1]!.attributes('data-depth')).toBe('1');
        expect(rows[1]!.text()).toContain('banana child');
    });

    it('renders custom cells and the empty slot', () => {
        expect(make().findAll('tbody tr')[0]!.text()).toContain('$3');
        const empty = make({ data: [] }, { empty: 'Nothing here' });
        expect(empty.text()).toContain('Nothing here');
        expect(report(empty)).toBe('Showing 0 to 0 of 0 entries');
    });

    it('emits row-click with the original record', async () => {
        const wrapper = make();
        await wrapper.findAll('tbody tr')[0]!.trigger('click');
        expect((wrapper.emitted('row-click')![0]![0] as Product).name).toBe('banana');
    });

    it('does not emit row-click when a control inside the row is clicked', async () => {
        const wrapper = make({ selectable: true, subRowsKey: 'children' });
        await wrapper.findAll('tbody [data-slot=checkbox]')[0]!.trigger('click');
        await wrapper.get('[aria-label="Expand row"]').trigger('click');
        expect(wrapper.emitted('row-click')).toBeUndefined();
        expect(wrapper.emitted('update:selection')).toBeTruthy();
        expect(wrapper.findAll('tbody tr')[1]!.text()).toContain('banana child');
    });

    it('filters a text column from the header menu and clears it', async () => {
        const wrapper = make({ paginator: false }, {}, { attachTo: document.body });
        await wrapper.get('[aria-label="Filter Name"]').trigger('click');
        const input = document.body.querySelector<HTMLInputElement>('[data-slot=data-table-filter-value]')!;
        input.value = 'ba';
        input.dispatchEvent(new Event('input'));
        await nextTick();
        document.body.querySelector<HTMLButtonElement>('[data-slot=data-table-filter-apply]')!.click();
        await nextTick();
        expect(wrapper.findAll('tbody tr').map((r) => r.text())).toEqual([expect.stringContaining('banana')]);
        expect(wrapper.get('[aria-label="Filter Name"]').attributes('data-active')).toBe('true');
        (wrapper.vm as unknown as Exposed).clearFilters();
        await nextTick();
        expect(wrapper.findAll('tbody tr')).toHaveLength(5);
        wrapper.unmount();
    });

    it('changes the match mode from the menu select', async () => {
        const wrapper = make({ paginator: false }, {}, { attachTo: document.body });
        await wrapper.get('[aria-label="Filter Price"]').trigger('click');
        const select = document.body.querySelector<HTMLSelectElement>('[data-slot=data-table-filter-mode]')!;
        expect(Array.from(select.options).map((o) => o.value)).toEqual(['gt', 'lt']);
        select.value = 'lt';
        select.dispatchEvent(new Event('change'));
        const input = document.body.querySelector<HTMLInputElement>('[data-slot=data-table-filter-value]')!;
        input.value = '4';
        input.dispatchEvent(new Event('input'));
        await nextTick();
        document.body.querySelector<HTMLButtonElement>('[data-slot=data-table-filter-apply]')!.click();
        await nextTick();
        expect(wrapper.findAll('tbody tr').map((r) => r.text().includes('$'))).toHaveLength(2);
        wrapper.unmount();
    });

    it('renders a custom filter slot with the apply and clear callbacks', async () => {
        const wrapper = mount(DataTable<Product>, {
            props: { columns, data: products, rowKey: 'id' },
            slots: {
                'filter-added': `<template #filter-added="{ value, setValue, apply }"><button data-testid="pick" @click="setValue(new Date(2024, 3, 1)); apply()">pick</button></template>`
            },
            attachTo: document.body
        });
        await wrapper.get('[aria-label="Filter Added"]').trigger('click');
        document.body.querySelector<HTMLButtonElement>('[data-testid=pick]')!.click();
        await nextTick();
        expect(wrapper.findAll('tbody tr')).toHaveLength(1);
        expect(wrapper.findAll('tbody tr')[0]!.text()).toContain('date');
        wrapper.unmount();
    });

    it('limits the global filter to globalFilterFields', async () => {
        const wrapper = make({ paginator: false, globalFilter: '3', globalFilterFields: ['name'] });
        await nextTick();
        expect((wrapper.vm as unknown as Exposed).visibleRows()).toHaveLength(0);
        await wrapper.setProps({ globalFilterFields: ['name', 'price'] });
        await nextTick();
        expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    });

    it('shows the loading slot over the body and gridline and hover classes on request', () => {
        const loading = make({ loading: true }, { loading: 'Loading customers.' });
        expect(loading.get('[data-slot=data-table-loading]').text()).toBe('Loading customers.');
        const styled = make({ showGridlines: true, rowHover: true });
        expect(styled.get('[data-slot=data-table]').attributes('data-gridlines')).toBe('true');
        expect(styled.get('[data-slot=data-table]').attributes('data-row-hover')).toBe('true');
    });

    it('checks rows that the parent puts in the selection model', async () => {
        const wrapper = make({ selectable: true, selection: [products[1]] });
        await nextTick();
        expect(wrapper.findAll('tbody tr[data-state=selected]')).toHaveLength(1);
        expect(wrapper.findAll('tbody tr[data-state=selected]')[0]!.text()).toContain('apple');
        expect((wrapper.vm as unknown as Exposed).selectedRows().map((p) => p.name)).toEqual(['apple']);
    });
});
