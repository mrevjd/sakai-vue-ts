<script setup lang="ts">
    import { TreeItem, TreeRoot } from 'reka-ui';
    import { computed, ref, watch, type Component } from 'vue';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Input } from '@/components/ui/input';
    import { IconAngleDown, IconAngleRight, IconSearch } from '@/components/icons';
    import { resolveIcon } from '@/components/resolveIcon';
    import { cn } from '@/lib/utils';
    import { checkboxSelection, filterTree, findNode, selectedKeys, type TreeNodeLike, type TreeSelectionKeys, type TreeSelectionMode } from './model';

    // Reka's TreeRoot owns keyboard navigation and selection; this file converts between its
    // node-array model and PrimeVue's selectionKeys and expandedKeys records so ported pages keep their shapes.
    const props = withDefaults(
        defineProps<{
            value: TreeNodeLike[];
            selectionMode?: TreeSelectionMode;
            filter?: boolean;
            filterPlaceholder?: string;
            class?: string;
        }>(),
        { selectionMode: undefined, filter: false, filterPlaceholder: 'Search', class: undefined }
    );

    const selectionKeysModel = defineModel<TreeSelectionKeys | null>('selectionKeys', { default: null });
    const expandedKeysModel = defineModel<Record<string, boolean> | null>('expandedKeys', { default: null });
    const emit = defineEmits<{ 'node-select': [payload: { node: TreeNodeLike }]; 'node-unselect': [payload: { node: TreeNodeLike }] }>();

    const query = ref('');
    const filtered = computed(() => filterTree(props.value, query.value));
    const multiple = computed(() => props.selectionMode === 'multiple' || props.selectionMode === 'checkbox');
    const checkbox = computed(() => props.selectionMode === 'checkbox');

    // Filtering opens the matched path on top of whatever the user expanded.
    const expanded = computed<string[]>(() => {
        const own = Object.entries(expandedKeysModel.value ?? {})
            .filter(([, open]) => open)
            .map(([key]) => key);
        return [...new Set([...own, ...filtered.value.expanded])];
    });

    function onExpanded(keys: string[]): void {
        const next: Record<string, boolean> = {};
        for (const key of keys) next[key] = true;
        expandedKeysModel.value = next;
    }

    const selectedNodes = computed<TreeNodeLike[]>(() =>
        selectedKeys(selectionKeysModel.value)
            .map((key) => findNode(props.value, key))
            .filter((node): node is TreeNodeLike => node !== undefined)
    );

    function onSelect(nodes: TreeNodeLike | TreeNodeLike[] | undefined): void {
        if (!props.selectionMode) return;
        const list = nodes === undefined ? [] : Array.isArray(nodes) ? nodes : [nodes];
        const before = new Set(selectedKeys(selectionKeysModel.value));
        const after = new Set(list.map((node) => node.key));
        const next: TreeSelectionKeys = checkbox.value ? checkboxSelection(props.value, leafSet(list)) : Object.fromEntries(list.map((node) => [node.key, true]));
        selectionKeysModel.value = Object.keys(next).length > 0 ? next : null;
        for (const node of list) if (!before.has(node.key)) emit('node-select', { node });
        for (const key of before)
            if (!after.has(key)) {
                const node = findNode(props.value, key);
                if (node) emit('node-unselect', { node });
            }
    }

    // Reka reports every selected node including parents; the record derives parents from leaves, so only leaves feed it.
    function leafSet(nodes: TreeNodeLike[]): Set<string> {
        const leaves = new Set<string>();
        const collect = (node: TreeNodeLike): void => {
            if (node.children && node.children.length > 0) node.children.forEach(collect);
            else leaves.add(node.key);
        };
        nodes.forEach(collect);
        return leaves;
    }

    // Without a selection mode the model never changes, but Reka would still highlight the clicked
    // row; cancelling its select event keeps the row inert while leaving expansion alone.
    function onItemSelect(event: Event): void {
        if (!props.selectionMode) event.preventDefault();
    }

    function iconOf(node: TreeNodeLike): Component | undefined {
        return typeof node.icon === 'string' ? resolveIcon(node.icon) : node.icon;
    }

    watch(
        () => props.selectionMode,
        () => {
            selectionKeysModel.value = null;
        }
    );
</script>

<template>
    <div :class="cn('flex flex-col gap-2', props.class)" data-slot="tree">
        <div v-if="props.filter" class="relative">
            <IconSearch class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="query" :placeholder="props.filterPlaceholder" class="pl-8" data-slot="tree-filter" />
        </div>
        <TreeRoot
            v-slot="{ flattenItems }"
            :items="filtered.nodes"
            :get-key="(node: TreeNodeLike) => node.key"
            :get-children="(node: TreeNodeLike) => node.children"
            :multiple="multiple"
            :propagate-select="checkbox"
            :bubble-select="checkbox"
            :model-value="multiple ? selectedNodes : selectedNodes[0]"
            :expanded="expanded"
            class="flex flex-col gap-0.5 outline-none"
            @update:model-value="onSelect"
            @update:expanded="onExpanded"
        >
            <TreeItem
                v-for="item in flattenItems"
                :key="item._id"
                v-slot="{ isExpanded, isSelected, isIndeterminate, handleToggle, handleSelect }"
                v-bind="item.bind"
                :style="{ paddingLeft: `${(item.level - 1) * 1.25}rem` }"
                :class="cn('flex items-center gap-1 rounded-md px-1 py-1 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[selected]:bg-accent', !props.selectionMode && 'cursor-default')"
                data-slot="tree-node"
                @select="onItemSelect"
            >
                <button v-if="item.hasChildren" type="button" class="flex size-6 items-center justify-center rounded-sm hover:bg-muted" :aria-label="`Toggle ${item.value.label}`" @click.stop="handleToggle()">
                    <IconAngleDown v-if="isExpanded" class="size-4" />
                    <IconAngleRight v-else class="size-4" />
                </button>
                <span v-else class="size-6 shrink-0" />
                <Checkbox v-if="checkbox" :model-value="isIndeterminate ? 'indeterminate' : isSelected" data-slot="tree-checkbox" @click.stop="handleSelect()" />
                <component :is="iconOf(item.value)" v-if="iconOf(item.value)" class="size-4 shrink-0 text-muted-foreground" />
                <span>{{ item.value.label }}</span>
            </TreeItem>
        </TreeRoot>
    </div>
</template>
