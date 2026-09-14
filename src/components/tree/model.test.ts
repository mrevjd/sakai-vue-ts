import { describe, expect, it } from 'vitest';
import { checkboxSelection, filterTree, findNode, selectedKeys, type TreeNodeLike } from './model';

const nodes: TreeNodeLike[] = [
    {
        key: '0',
        label: 'Documents',
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

describe('tree model helpers', () => {
    it('finds a node by key at any depth', () => {
        expect(findNode(nodes, '0-1-0')?.label).toBe('Invoices.txt');
        expect(findNode(nodes, 'missing')).toBeUndefined();
    });

    it('marks a parent checked when every leaf below it is checked and partial when some are', () => {
        const all = checkboxSelection(nodes, new Set(['0-0-0', '0-0-1', '0-1-0']));
        expect(all['0']).toEqual({ checked: true, partialChecked: false });
        expect(all['0-0']).toEqual({ checked: true, partialChecked: false });
        const some = checkboxSelection(nodes, new Set(['0-0-0']));
        expect(some['0-0']).toEqual({ checked: false, partialChecked: true });
        expect(some['0']).toEqual({ checked: false, partialChecked: true });
        expect(some['0-0-0']).toEqual({ checked: true, partialChecked: false });
        expect(some['1']).toBeUndefined();
    });

    it('reads the checked keys back out of a selection record in either shape', () => {
        expect(selectedKeys({ '0-0-0': { checked: true, partialChecked: false }, '0-0': { checked: false, partialChecked: true }, '1': true })).toEqual(['0-0-0', '1']);
        expect(selectedKeys(null)).toEqual([]);
    });

    it('filters to nodes whose label matches or that contain a match, and reports the ancestors to expand', () => {
        const result = filterTree(nodes, 'expenses');
        expect(result.nodes.map((n) => n.key)).toEqual(['0']);
        expect(result.nodes[0]!.children!.map((n) => n.key)).toEqual(['0-0']);
        expect(result.nodes[0]!.children![0]!.children!.map((n) => n.key)).toEqual(['0-0-0']);
        expect(result.expanded).toEqual(['0', '0-0']);
        expect(filterTree(nodes, '').nodes).toBe(nodes);
    });
});
