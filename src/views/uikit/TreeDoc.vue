<script setup lang="ts">
    import { onMounted, ref } from 'vue';
    import { createColumns, DataTable } from '@/components/data-table';
    import { Tree, type TreeSelectionKeys } from '@/components/tree';
    import { NodeService } from '@/service/NodeService';
    import type { TreeNode, TreeTableNode } from '@/service/types';

    type TreeRow = { key: string; name: string; size: string; type: string; children?: TreeRow[] } & Record<string, unknown>;

    // The wrapper reads flat rows and finds children under one key; TreeTableNode hides its fields under `data`.
    function toRows(nodes: TreeTableNode[]): TreeRow[] {
        return nodes.map((node) => ({ key: node.key, ...node.data, children: node.children ? toRows(node.children) : undefined }));
    }

    const treeValue = ref<TreeNode[]>([]);
    const selectedTreeValue = ref<TreeSelectionKeys | null>(null);
    const rows = ref<TreeRow[]>([]);
    const selectedRows = ref<TreeRow[]>([]);

    const columnHelper = createColumns<TreeRow>();

    // TanStack makes every accessor column sortable unless told otherwise; the upstream TreeTable sorted nothing.
    const columns = columnHelper.columns([
        columnHelper.accessor('name', { header: 'Name', enableSorting: false }),
        columnHelper.accessor('size', { header: 'Size', enableSorting: false }),
        columnHelper.accessor('type', { header: 'Type', enableSorting: false })
    ]);

    onMounted(() => {
        NodeService.getTreeNodes().then((data: TreeNode[]) => (treeValue.value = data));
        NodeService.getTreeTableNodes().then((data: TreeTableNode[]) => (rows.value = toRows(data)));
    });
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Tree</div>
        <Tree :value="treeValue" selection-mode="checkbox" v-model:selection-keys="selectedTreeValue" />
    </div>

    <div class="card">
        <div class="font-semibold text-xl mb-4">Tree with Filter</div>
        <Tree :value="treeValue" selection-mode="single" filter filter-placeholder="Search" />
    </div>

    <div class="card">
        <div class="font-semibold text-xl mb-4">TreeTable</div>
        <DataTable :columns="columns" :data="rows" row-key="key" sub-rows-key="children" selectable v-model:selection="selectedRows" />
    </div>
</template>
