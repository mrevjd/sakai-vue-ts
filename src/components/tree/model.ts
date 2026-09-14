import type { Component } from 'vue';

export interface TreeNodeLike {
    key: string;
    label: string;
    /** A PrimeIcons class string from the demo data or a component; both render through resolveIcon. */
    icon?: string | Component;
    data?: unknown;
    children?: TreeNodeLike[];
    leaf?: boolean;
    selectable?: boolean;
}

export type TreeSelectionMode = 'single' | 'multiple' | 'checkbox';

export interface CheckboxSelection {
    checked: boolean;
    partialChecked: boolean;
}

// PrimeVue's selectionKeys shape: `true` per key in single and multiple modes, the object in checkbox mode.
export type TreeSelectionKeys = Record<string, boolean | CheckboxSelection>;

export function findNode(nodes: TreeNodeLike[], key: string): TreeNodeLike | undefined {
    for (const node of nodes) {
        if (node.key === key) return node;
        const child = node.children ? findNode(node.children, key) : undefined;
        if (child) return child;
    }
    return undefined;
}

// Integer-like keys ('1') enumerate before every other key whatever the insertion order, so the
// record cannot carry tree order; comparing path segments restores it for PrimeVue's `a-b-c` keys.
function compareKeys(a: string, b: string): number {
    const left = a.split('-');
    const right = b.split('-');
    const shared = Math.min(left.length, right.length);
    for (let i = 0; i < shared; i++) {
        const x = left[i]!;
        const y = right[i]!;
        if (x === y) continue;
        return /^\d+$/.test(x) && /^\d+$/.test(y) ? Number(x) - Number(y) : x.localeCompare(y);
    }
    return left.length - right.length;
}

export function selectedKeys(selection: TreeSelectionKeys | null | undefined): string[] {
    if (!selection) return [];
    return Object.entries(selection)
        .filter(([, value]) => value === true || (typeof value === 'object' && value.checked))
        .map(([key]) => key)
        .sort(compareKeys);
}

function leafKeys(node: TreeNodeLike): string[] {
    return node.children && node.children.length > 0 ? node.children.flatMap(leafKeys) : [node.key];
}

// Parent state follows its leaves: checked when all are, partial when some are, absent when none are.
export function checkboxSelection(nodes: TreeNodeLike[], checkedLeaves: ReadonlySet<string>): TreeSelectionKeys {
    const result: TreeSelectionKeys = {};
    const visit = (node: TreeNodeLike): void => {
        const leaves = leafKeys(node);
        const count = leaves.filter((key) => checkedLeaves.has(key)).length;
        if (count === leaves.length) result[node.key] = { checked: true, partialChecked: false };
        else if (count > 0) result[node.key] = { checked: false, partialChecked: true };
        node.children?.forEach(visit);
    };
    nodes.forEach(visit);
    return result;
}

export function filterTree(nodes: TreeNodeLike[], query: string): { nodes: TreeNodeLike[]; expanded: string[] } {
    const needle = query.trim().toLowerCase();
    if (!needle) return { nodes, expanded: [] };
    const expanded: string[] = [];
    const prune = (list: TreeNodeLike[]): TreeNodeLike[] =>
        list.flatMap((node): TreeNodeLike[] => {
            const children = node.children ? prune(node.children) : [];
            const matches = node.label.toLowerCase().includes(needle);
            if (children.length > 0) {
                expanded.push(node.key);
                return [{ ...node, children }];
            }
            return matches ? [{ ...node, children: node.children ? [] : undefined }] : [];
        });
    const result = prune(nodes);
    // prune pushes deepest-first; the tree wants ancestors first so expansion reads top down.
    return { nodes: result, expanded: expanded.reverse() };
}
