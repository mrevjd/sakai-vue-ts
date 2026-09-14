<script setup lang="ts" generic="TData extends Record<string, unknown>">
    import type { Column, ColumnDef, ColumnFiltersState, ExpandedState, Header, PaginationState, RowSelectionState, SortingState, Updater } from '@tanstack/vue-table';
    import { FlexRender, useTable } from '@tanstack/vue-table';
    import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/vue';
    import { computed, h, ref, useSlots, watch, type HTMLAttributes } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { cn } from '@/lib/utils';
    import DataTableFilterMenu from './DataTableFilterMenu.vue';
    import { features, type DataTableFeatures } from './features';
    import type { DataTableColumnMeta } from './filters';

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
            loading?: boolean;
            showGridlines?: boolean;
            rowHover?: boolean;
            globalFilterFields?: string[];
            class?: HTMLAttributes['class'];
        }>(),
        {
            paginator: false,
            pageSize: 10,
            pageSizeOptions: () => [5, 10, 25],
            reportTemplate: 'Showing {first} to {last} of {totalRecords} entries',
            selectable: false,
            subRowsKey: undefined,
            loading: false,
            showGridlines: false,
            rowHover: false,
            globalFilterFields: undefined,
            class: undefined
        }
    );

    const selection = defineModel<TData[]>('selection', { default: () => [] });
    const globalFilter = defineModel<string>('globalFilter', { default: '' });
    const emit = defineEmits<{ 'row-click': [row: TData] }>();
    const slots = useSlots();

    const sorting = ref<SortingState>([]);
    const columnFilters = ref<ColumnFiltersState>([]);
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

    const allColumns = computed(() => {
        const withFilters = props.columns.map((column) => {
            const meta = column.meta as DataTableColumnMeta | undefined;
            return meta?.filter && !column.filterFn ? { ...column, filterFn: 'matchMode' as const } : column;
        });
        return props.selectable ? [selectionColumn, ...withFilters] : withFilters;
    });

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
        // TanStack ANDs this with the column's own enableGlobalFilter, so only the allow-list is decided here.
        getColumnCanGlobalFilter: (column) => (props.globalFilterFields ? props.globalFilterFields.includes(column.id) : true),
        state: {
            get sorting() {
                return sorting.value;
            },
            get columnFilters() {
                return columnFilters.value;
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
        onColumnFiltersChange: (updater) => apply(columnFilters, updater),
        onGlobalFilterChange: (updater) => apply(globalFilter, updater),
        onRowSelectionChange: (updater) => apply(rowSelection, updater),
        onExpandedChange: (updater) => apply(expanded, updater),
        onPaginationChange: (updater) => apply(pagination, updater)
    });

    watch(rowSelection, () => {
        selection.value = table.getSelectedRowModel().rows.map((row) => row.original);
    });
    // Rows are keyed by rowKey on both sides, so a parent can pre-select or extend the model and see the checkboxes follow.
    watch(
        selection,
        (value) => {
            const next: RowSelectionState = {};
            for (const row of value ?? []) next[String(row[props.rowKey])] = true;
            const same = Object.keys(next).length === Object.keys(rowSelection.value).length && Object.keys(next).every((key) => rowSelection.value[key]);
            if (!same) rowSelection.value = next;
        },
        { immediate: true, deep: true }
    );
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

    function filterOf(column: Column<DataTableFeatures, TData>): DataTableColumnMeta['filter'] | undefined {
        return (column.columnDef.meta as DataTableColumnMeta | undefined)?.filter;
    }

    function headerLabel(header: Header<DataTableFeatures, TData, unknown>): string {
        return typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id;
    }

    function clearFilters(): void {
        table.resetColumnFilters();
        globalFilter.value = '';
    }

    defineExpose({
        table,
        visibleRows: (): TData[] => table.getPrePaginatedRowModel().rows.map((row) => row.original),
        selectedRows: (): TData[] => table.getSelectedRowModel().rows.map((row) => row.original),
        clearFilters
    });
</script>

<template>
    <div :class="cn('flex flex-col', props.class)" data-slot="data-table" :data-gridlines="props.showGridlines || undefined" :data-row-hover="props.rowHover || undefined">
        <div v-if="$slots.header" class="mb-4"><slot name="header" /></div>
        <div :class="cn('overflow-x-auto rounded-lg border', props.showGridlines && '[&_td]:border [&_th]:border')">
            <Table>
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <TableHead v-for="header in headerGroup.headers" :key="header.id" :class="(header.column.columnDef.meta as DataTableColumnMeta | undefined)?.headerClass">
                            <div v-if="!header.isPlaceholder" class="flex items-center gap-1">
                                <Button v-if="header.column.getCanSort()" variant="ghost" size="sm" class="-ml-2" data-slot="data-table-sort" @click="header.column.toggleSorting(header.column.getIsSorted() === 'asc')">
                                    <FlexRender :header="header" />
                                    <ArrowUp v-if="header.column.getIsSorted() === 'asc'" />
                                    <ArrowDown v-else-if="header.column.getIsSorted() === 'desc'" />
                                    <ArrowUpDown v-else class="opacity-50" />
                                </Button>
                                <FlexRender v-else :header="header" />
                                <DataTableFilterMenu v-if="filterOf(header.column)" :column="header.column" :filter="filterOf(header.column)!" :label="headerLabel(header)">
                                    <template v-if="slots[`filter-${header.column.id}`]" #default="scope">
                                        <slot :name="`filter-${header.column.id}`" v-bind="scope" />
                                    </template>
                                </DataTableFilterMenu>
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-if="props.loading">
                        <TableCell :colspan="allColumns.length" class="py-8 text-center text-muted-foreground" data-slot="data-table-loading"><slot name="loading">Loading.</slot></TableCell>
                    </TableRow>
                    <TableEmpty v-else-if="table.getRowModel().rows.length === 0" :colspan="allColumns.length">
                        <slot name="empty">No records found.</slot>
                    </TableEmpty>
                    <!-- The vendored TableRow already hovers subtly (bg-muted/50); rowHover opts into the strong accent highlight. -->
                    <TableRow
                        v-for="row in table.getRowModel().rows"
                        v-else
                        :key="row.id"
                        :class="cn(props.rowHover && 'hover:bg-accent')"
                        :data-state="row.getIsSelected() ? 'selected' : undefined"
                        :data-depth="row.depth"
                        @click="onRowClick($event, row.original)"
                    >
                        <TableCell
                            v-for="(cell, index) in row.getVisibleCells()"
                            :key="cell.id"
                            :class="(cell.column.columnDef.meta as DataTableColumnMeta | undefined)?.class"
                            :style="index === 0 && row.depth > 0 ? { paddingLeft: `${row.depth * 1.5 + 0.5}rem` } : undefined"
                        >
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
