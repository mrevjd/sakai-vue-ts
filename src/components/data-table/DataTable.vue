<script setup lang="ts" generic="TData extends Record<string, unknown>">
    import type { ColumnDef, ExpandedState, PaginationState, RowSelectionState, SortingState, Updater } from '@tanstack/vue-table';
    import { FlexRender, useTable } from '@tanstack/vue-table';
    import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/vue';
    import { computed, h, ref, watch, type HTMLAttributes } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { cn } from '@/lib/utils';
    import { features, type DataTableFeatures } from './features';

    const props = withDefaults(
        defineProps<{
            columns: ColumnDef<DataTableFeatures, TData>[];
            data: TData[];
            rowKey: keyof TData & string;
            paginator?: boolean;
            pageSize?: number;
            pageSizeOptions?: number[];
            reportTemplate?: string;
            selectable?: boolean;
            subRowsKey?: keyof TData & string;
            class?: HTMLAttributes['class'];
        }>(),
        {
            paginator: false,
            pageSize: 10,
            pageSizeOptions: () => [5, 10, 25],
            reportTemplate: 'Showing {first} to {last} of {totalRecords} entries',
            selectable: false,
            subRowsKey: undefined,
            class: undefined
        }
    );

    const selection = defineModel<TData[]>('selection', { default: () => [] });
    const globalFilter = defineModel<string>('globalFilter', { default: '' });
    const emit = defineEmits<{ 'row-click': [row: TData] }>();

    const sorting = ref<SortingState>([]);
    const rowSelection = ref<RowSelectionState>({});
    const expanded = ref<ExpandedState>({});
    const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: props.pageSize });
    const ALL_ROWS: PaginationState = { pageIndex: 0, pageSize: Number.MAX_SAFE_INTEGER };

    function apply<T>(target: { value: T }, updater: Updater<T>): void {
        target.value = typeof updater === 'function' ? (updater as (old: T) => T)(target.value) : updater;
    }

    const selectionColumn: ColumnDef<DataTableFeatures, TData> = {
        id: '__select',
        enableSorting: false,
        header: ({ table }) =>
            h(Checkbox, {
                modelValue: table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false,
                'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(value === true),
                'aria-label': 'Select all rows'
            }),
        cell: ({ row }) =>
            h(Checkbox, {
                modelValue: row.getIsSelected(),
                'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(value === true),
                'aria-label': 'Select row'
            })
    };

    const allColumns = computed(() => (props.selectable ? [selectionColumn, ...props.columns] : props.columns));

    const table = useTable({
        features,
        get data() {
            return props.data;
        },
        get columns() {
            return allColumns.value;
        },
        get enableRowSelection() {
            return props.selectable;
        },
        getRowId: (row: TData) => String(row[props.rowKey]),
        getSubRows: (row: TData) => (props.subRowsKey ? (row[props.subRowsKey] as TData[] | undefined) : undefined),
        globalFilterFn: 'includesString',
        state: {
            get sorting() {
                return sorting.value;
            },
            get globalFilter() {
                return globalFilter.value;
            },
            get rowSelection() {
                return rowSelection.value;
            },
            get expanded() {
                return expanded.value;
            },
            get pagination() {
                return props.paginator ? pagination.value : ALL_ROWS;
            }
        },
        onSortingChange: (updater) => apply(sorting, updater),
        onGlobalFilterChange: (updater) => apply(globalFilter, updater),
        onRowSelectionChange: (updater) => apply(rowSelection, updater),
        onExpandedChange: (updater) => apply(expanded, updater),
        onPaginationChange: (updater) => apply(pagination, updater)
    });

    watch(rowSelection, () => {
        selection.value = table.getSelectedRowModel().rows.map((row) => row.original);
    });
    watch(selection, (value) => {
        if ((!value || value.length === 0) && Object.keys(rowSelection.value).length > 0) rowSelection.value = {};
    });
    watch(
        () => props.pageSize,
        (size) => table.setPageSize(size)
    );

    const totalRows = computed(() => table.getPrePaginatedRowModel().rows.length);
    const report = computed(() => {
        const { pageIndex, pageSize } = pagination.value;
        const total = totalRows.value;
        const first = total === 0 ? 0 : pageIndex * pageSize + 1;
        const last = Math.min(total, (pageIndex + 1) * pageSize);
        return props.reportTemplate.replace('{first}', String(first)).replace('{last}', String(last)).replace('{totalRecords}', String(total));
    });
    const pageLinks = computed(() => {
        const count = table.getPageCount();
        const start = Math.max(0, Math.min(pagination.value.pageIndex - 2, count - 5));
        const end = Math.min(count, start + 5);
        return Array.from({ length: end - start }, (_, index) => start + index);
    });

    function onPageSize(value: unknown): void {
        const size = Number(value);
        if (Number.isFinite(size) && size > 0) table.setPageSize(size);
    }

    // Mirrors PrimeVue's isClickable guard: clicks that land on a control inside the row are the control's, not the row's.
    function onRowClick(event: MouseEvent, row: TData): void {
        const target = event.target as Element | null;
        if (target?.closest('button, a, input, textarea, [role=checkbox]')) return;
        emit('row-click', row);
    }

    defineExpose({
        table,
        visibleRows: (): TData[] => table.getPrePaginatedRowModel().rows.map((row) => row.original),
        selectedRows: (): TData[] => table.getSelectedRowModel().rows.map((row) => row.original)
    });
</script>

<template>
    <div :class="cn('flex flex-col', props.class)" data-slot="data-table">
        <div v-if="$slots.header" class="mb-4"><slot name="header" /></div>
        <div class="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <TableHead v-for="header in headerGroup.headers" :key="header.id">
                            <template v-if="!header.isPlaceholder">
                                <Button v-if="header.column.getCanSort()" variant="ghost" size="sm" class="-ml-2" @click="header.column.toggleSorting(header.column.getIsSorted() === 'asc')">
                                    <FlexRender :header="header" />
                                    <ArrowUp v-if="header.column.getIsSorted() === 'asc'" />
                                    <ArrowDown v-else-if="header.column.getIsSorted() === 'desc'" />
                                    <ArrowUpDown v-else class="opacity-50" />
                                </Button>
                                <FlexRender v-else :header="header" />
                            </template>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableEmpty v-if="table.getRowModel().rows.length === 0" :colspan="allColumns.length">
                        <slot name="empty">No records found.</slot>
                    </TableEmpty>
                    <TableRow v-for="row in table.getRowModel().rows" :key="row.id" :data-state="row.getIsSelected() ? 'selected' : undefined" :data-depth="row.depth" @click="onRowClick($event, row.original)">
                        <TableCell v-for="(cell, index) in row.getVisibleCells()" :key="cell.id" :style="index === 0 && row.depth > 0 ? { paddingLeft: `${row.depth * 1.5 + 0.5}rem` } : undefined">
                            <span v-if="index === 0 && row.getCanExpand()" class="inline-flex items-center gap-1">
                                <Button variant="ghost" size="icon-xs" :aria-label="row.getIsExpanded() ? 'Collapse row' : 'Expand row'" @click="row.toggleExpanded()">
                                    <ChevronRight :class="cn('transition-transform', row.getIsExpanded() && 'rotate-90')" />
                                </Button>
                                <FlexRender :cell="cell" />
                            </span>
                            <FlexRender v-else :cell="cell" />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
        <div v-if="props.paginator" class="flex flex-wrap items-center justify-between gap-2 pt-4" data-slot="data-table-paginator">
            <span class="text-sm text-muted-foreground" data-testid="data-table-report">{{ report }}</span>
            <div class="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="First page" :disabled="!table.getCanPreviousPage()" @click="table.firstPage()"><ChevronsLeft /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Previous page" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()"><ChevronLeft /></Button>
                <Button v-for="page in pageLinks" :key="page" :variant="page === pagination.pageIndex ? 'default' : 'ghost'" size="icon-sm" :aria-label="`Page ${page + 1}`" @click="table.setPageIndex(page)">{{ page + 1 }}</Button>
                <Button variant="ghost" size="icon-sm" aria-label="Next page" :disabled="!table.getCanNextPage()" @click="table.nextPage()"><ChevronRight /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Last page" :disabled="!table.getCanNextPage()" @click="table.lastPage()"><ChevronsRight /></Button>
                <Select :model-value="String(pagination.pageSize)" @update:model-value="onPageSize">
                    <SelectTrigger class="w-20" aria-label="Rows per page"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="size in props.pageSizeOptions" :key="size" :value="String(size)">{{ size }}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    </div>
</template>
