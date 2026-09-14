import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import Tree from './Tree.vue';
import type { TreeNodeLike, TreeSelectionKeys } from './model';

const value: TreeNodeLike[] = [
    {
        key: '0',
        label: 'Documents',
        icon: 'pi pi-fw pi-inbox',
        children: [
            {
                key: '0-0',
                label: 'Work',
                children: [
                    { key: '0-0-0', label: 'Expenses.doc' },
                    { key: '0-0-1', label: 'Resume.doc' }
                ]
            },
            { key: '0-1', label: 'Home', children: [{ key: '0-1-0', label: 'Invoices.txt' }] }
        ]
    },
    { key: '1', label: 'Events', children: [{ key: '1-0', label: 'Meeting' }] }
];

function rows(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('[data-slot=tree-node]');
}

function lastSelection(wrapper: ReturnType<typeof mount>): TreeSelectionKeys {
    const emitted = wrapper.emitted('update:selectionKeys')!;
    return emitted[emitted.length - 1]![0] as TreeSelectionKeys;
}

describe('Tree', () => {
    it('renders only root nodes until a toggle is clicked', async () => {
        const wrapper = mount(Tree, { props: { value } });
        expect(rows(wrapper).map((r) => r.text())).toEqual(['Documents', 'Events']);
        expect(wrapper.find('[data-slot=tree-node] svg').exists()).toBe(true);
        await wrapper.findAll('[aria-label="Toggle Documents"]')[0]!.trigger('click');
        expect(rows(wrapper).map((r) => r.text())).toEqual(['Documents', 'Work', 'Home', 'Events']);
        const emitted = wrapper.emitted('update:expandedKeys')!;
        expect(emitted[emitted.length - 1]![0]).toEqual({ '0': true });
    });

    it('expands from the expandedKeys model', () => {
        const wrapper = mount(Tree, { props: { value, expandedKeys: { '0': true, '0-0': true } } });
        expect(rows(wrapper).map((r) => r.text())).toEqual(['Documents', 'Work', 'Expenses.doc', 'Resume.doc', 'Home', 'Events']);
    });

    it('selects a single node on click and reports it as selectionKeys', async () => {
        const wrapper = mount(Tree, { props: { value, selectionMode: 'single' } });
        await rows(wrapper)[1]!.trigger('click');
        expect(lastSelection(wrapper)).toEqual({ '1': true });
        expect(wrapper.emitted('node-select')![0]![0]).toEqual({ node: value[1] });
    });

    it('clicking a parent row body selects it without toggling expansion', async () => {
        const wrapper = mount(Tree, { props: { value, selectionMode: 'single' } });
        await rows(wrapper)[0]!.trigger('click');
        expect(lastSelection(wrapper)).toEqual({ '0': true });
        expect(wrapper.emitted('update:expandedKeys')).toBeUndefined();
        expect(rows(wrapper).map((r) => r.text())).toEqual(['Documents', 'Events']);
    });

    it('checkbox mode propagates to descendants and reports partial parents', async () => {
        const wrapper = mount(Tree, { props: { value, selectionMode: 'checkbox', expandedKeys: { '0': true, '0-0': true } } });
        await wrapper.findAll('[data-slot=tree-checkbox]')[2]!.trigger('click');
        expect(lastSelection(wrapper)).toEqual({
            '0': { checked: false, partialChecked: true },
            '0-0': { checked: false, partialChecked: true },
            '0-0-0': { checked: true, partialChecked: false }
        });
        await wrapper.setProps({ selectionKeys: lastSelection(wrapper) });
        await wrapper.findAll('[data-slot=tree-checkbox]')[0]!.trigger('click');
        await nextTick();
        const all = lastSelection(wrapper);
        expect(all['0']).toEqual({ checked: true, partialChecked: false });
        expect(all['0-1-0']).toEqual({ checked: true, partialChecked: false });
        expect(all['1']).toBeUndefined();
    });

    it('filters nodes from the filter box and expands the matching path', async () => {
        const wrapper = mount(Tree, { props: { value, filter: true } });
        await wrapper.get('[data-slot=tree-filter]').setValue('invoices');
        expect(rows(wrapper).map((r) => r.text())).toEqual(['Documents', 'Home', 'Invoices.txt']);
        await wrapper.get('[data-slot=tree-filter]').setValue('');
        expect(rows(wrapper).map((r) => r.text())).toEqual(['Documents', 'Events']);
    });
});
