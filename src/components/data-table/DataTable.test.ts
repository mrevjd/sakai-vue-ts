import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { createColumns, DataTable } from './index';

interface Product extends Record<string, unknown> {
    id: string;
    name: string;
    price: number;
    children?: Product[];
}

const helper = createColumns<Product>();
const columns = helper.columns([helper.accessor('name', { header: 'Name' }), helper.accessor('price', { header: 'Price', cell: (ctx) => `$${ctx.getValue()}` })]);

const products: Product[] = [
    { id: '1', name: 'banana', price: 3, children: [{ id: '1a', name: 'banana child', price: 1 }] },
    { id: '2', name: 'apple', price: 5 },
    { id: '3', name: 'cherry', price: 2 },
    { id: '4', name: 'date', price: 9 },
    { id: '5', name: 'elder', price: 4 }
];

type Exposed = { visibleRows: () => Product[]; selectedRows: () => Product[] };

function make(extra: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
    return mount(DataTable<Product>, { props: { columns, data: products, rowKey: 'id', paginator: true, pageSize: 2, ...extra }, slots });
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
        const nameHeader = wrapper.findAll('thead th button')[0]!;
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
});
