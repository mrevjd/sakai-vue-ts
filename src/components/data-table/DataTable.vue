<script setup lang="ts" generic="TData extends Record<string, unknown>">
    import type { Column, ColumnDef, ColumnFiltersState, ColumnPinningState, ExpandedState, GroupingState, Header, PaginationState, Row, RowSelectionState, SortingState, Updater } from '@tanstack/vue-table';
    import { FlexRender, useTable } from '@tanstack/vue-table';
    import { computed, h, ref, useSlots, watch, type HTMLAttributes } from 'vue';
    import { IconAngleRight, IconArrowDown, IconArrowUp, IconSort } from '@/components/icons';
    import Paginator from '@/components/Paginator.vue';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
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
            scrollHeight?: string;
            expandable?: boolean;
            groupBy?: string;
            initialSorting?: SortingState;
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
            scrollHeight: undefined,
            expandable: false,
            groupBy: undefined,
            initialSorting: () => [],
            class: undefined
        }
    );

    const selection = defineModel<TData[]>('selection', { default: () => [] });
    const globalFilter = defineModel<string>('globalFilter', { default: '' });
    const emit = defineEmits<{ 'row-click': [row: TData] }>();
    const slots = useSlots();

    const sorting = ref<SortingState>(props.initialSorting);
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
        // Sticky offsets are summed from column sizes, so the checkbox column declares its real width
        // rather than inheriting TanStack's 150px default.
        size: 48,
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

    // Pinning state is derived from column meta, not user-driven, so it is a computed rather than a ref.
    // The public meta says left/right (PrimeVue's alignFrozen); TanStack v9 names the regions start/end.
    const columnPinning = computed<ColumnPinningState>(() => {
        const start: string[] = [];
        const end: string[] = [];
        for (const column of allColumns.value) {
            const frozen = (column.meta as DataTableColumnMeta | undefined)?.frozen;
            const id = column.id ?? ('accessorKey' in column && typeof column.accessorKey === 'string' ? column.accessorKey : undefined);
            if (frozen === 'left' && id) start.push(id);
            if (frozen === 'right' && id) end.push(id);
        }
        if (props.selectable) start.unshift('__select');
        return { start, end };
    });
    const hasFrozen = computed(() => columnPinning.value.start.length + columnPinning.value.end.length > (props.selectable ? 1 : 0));
    // A new array per read would defeat TanStack's reference-compared memos, so the state is held in a computed.
    const grouping = computed<GroupingState>(() => (props.groupBy ? [props.groupBy] : []));

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
        getRowCanExpand: (row) => props.expandable || (props.subRowsKey ? (row.subRows?.length ?? 0) > 0 : false),
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
            // Grouped leaves only render when their group is open, so grouping forces every row expanded.
            get expanded() {
                return props.groupBy ? true : expanded.value;
            },
            get pagination() {
                return props.paginator ? pagination.value : ALL_ROWS;
            },
            get columnPinning() {
                return columnPinning.value;
            },
            get grouping() {
                return grouping.value;
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

    interface Section {
        header?: { row: TData; value: unknown; count: number };
        rows: Row<DataTableFeatures, TData>[];
    }
    // With groupBy set, the row model is [group, leaf, leaf, group, leaf, ...]; without it, one section of plain rows.
    // Grouping ignores pagination: the sections come from the whole model, as PrimeVue's grouping demo has no paginator.
    const sections = computed<Section[]>(() => {
        const rows = table.getRowModel().rows;
        if (!props.groupBy) return [{ rows }];
        return rows.filter((row) => row.getIsGrouped()).map((group) => ({ header: { row: group.subRows[0]!.original, value: group.getValue(props.groupBy!), count: group.subRows.length }, rows: group.subRows }));
    });

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

    // The checkbox column is always pinned first so it stays visible beside left-frozen columns, but on its
    // own it must not turn sticky: that would paint bg-card over the row's hover and selected backgrounds.
    function pinnedSide(column: Column<DataTableFeatures, TData>): 'left' | 'right' | undefined {
        if (!hasFrozen.value) return undefined;
        const pinned = column.getIsPinned();
        return pinned === 'start' ? 'left' : pinned === 'end' ? 'right' : undefined;
    }

    function pinStyle(column: Column<DataTableFeatures, TData>): Record<string, string> | undefined {
        if (!hasFrozen.value) return undefined;
        const side = pinnedSide(column);
        if (side === 'left') return { left: `${column.getStart('start')}px`, minWidth: `${column.getSize()}px` };
        if (side === 'right') return { right: `${column.getAfter('end')}px`, minWidth: `${column.getSize()}px` };
        return { minWidth: `${column.getSize()}px` };
    }

    function clearFilters(): void {
        table.resetColumnFilters();
        globalFilter.value = '';
    }

    function expandAll(): void {
        table.toggleAllRowsExpanded(true);
    }

    function collapseAll(): void {
        table.toggleAllRowsExpanded(false);
    }

    defineExpose({
        table,
        // Group rows borrow their first leaf's original, so they are dropped to keep an export free of duplicates.
        visibleRows: (): TData[] =>
            table
                .getPrePaginatedRowModel()
                .rows.filter((row) => !row.getIsGrouped())
                .map((row) => row.original),
        selectedRows: (): TData[] => table.getSelectedRowModel().rows.map((row) => row.original),
        clearFilters,
        expandAll,
        collapseAll
    });
</script>

<template>
    <div :class="cn('flex flex-col', props.class)" data-slot="data-table" :data-gridlines="props.showGridlines || undefined" :data-row-hover="props.rowHover || undefined">
        <div v-if="$slots.header" class="mb-4"><slot name="header" /></div>
        <!-- The vendored Table wraps its <table> in an overflow-x-auto container; that overflow is reset here so
             this div is the one scroll container both the sticky header and the frozen cells stick to. -->
        <div
            data-slot="data-table-scroller"
            :class="
                cn('overflow-auto rounded-lg border [&_[data-slot=table-container]]:overflow-visible', props.showGridlines && '[&_td]:border [&_th]:border', props.scrollHeight && '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-20 [&_thead]:bg-card')
            "
            :style="props.scrollHeight ? { maxHeight: props.scrollHeight } : undefined"
        >
            <Table>
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <TableHead
                            v-for="header in headerGroup.headers"
                            :key="header.id"
                            :class="cn(pinnedSide(header.column) && 'sticky z-10 bg-card', (header.column.columnDef.meta as DataTableColumnMeta | undefined)?.headerClass)"
                            :data-pinned="pinnedSide(header.column)"
                            :style="pinStyle(header.column)"
                        >
                            <div v-if="!header.isPlaceholder" class="flex items-center gap-1">
                                <Button v-if="header.column.getCanSort()" variant="ghost" size="sm" class="-ml-2" data-slot="data-table-sort" @click="header.column.toggleSorting(header.column.getIsSorted() === 'asc')">
                                    <FlexRender :header="header" />
                                    <IconArrowUp v-if="header.column.getIsSorted() === 'asc'" />
                                    <IconArrowDown v-else-if="header.column.getIsSorted() === 'desc'" />
                                    <IconSort v-else class="opacity-50" />
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
                    <template v-else>
                        <template v-for="(section, index) in sections" :key="index">
                            <TableRow v-if="section.header" class="bg-muted/50 font-semibold" data-slot="data-table-group-header">
                                <TableCell :colspan="allColumns.length">
                                    <slot name="groupHeader" v-bind="section.header">{{ section.header.value }}</slot>
                                </TableCell>
                            </TableRow>
                            <template v-for="row in section.rows" :key="row.id">
                                <!-- The vendored TableRow already hovers subtly (bg-muted/50); rowHover opts into the strong accent highlight. -->
                                <TableRow :class="cn(props.rowHover && 'hover:bg-accent')" :data-state="row.getIsSelected() ? 'selected' : undefined" :data-depth="row.depth" @click="onRowClick($event, row.original)">
                                    <TableCell
                                        v-for="(cell, cellIndex) in row.getVisibleCells()"
                                        :key="cell.id"
                                        :class="cn(pinnedSide(cell.column) && 'sticky z-10 bg-card', (cell.column.columnDef.meta as DataTableColumnMeta | undefined)?.class)"
                                        :data-pinned="pinnedSide(cell.column)"
                                        :style="{ ...pinStyle(cell.column), ...(cellIndex === 0 && props.subRowsKey && row.depth > 0 ? { paddingLeft: `${row.depth * 1.5 + 0.5}rem` } : undefined) }"
                                    >
                                        <span v-if="cellIndex === 0 && row.getCanExpand()" class="inline-flex items-center gap-1">
                                            <Button variant="ghost" size="icon-xs" :aria-label="row.getIsExpanded() ? 'Collapse row' : 'Expand row'" @click="row.toggleExpanded()">
                                                <IconAngleRight :class="cn('transition-transform', row.getIsExpanded() && 'rotate-90')" />
                                            </Button>
                                            <FlexRender :cell="cell" />
                                        </span>
                                        <FlexRender v-else :cell="cell" />
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="props.expandable && row.getIsExpanded()" :key="`${row.id}-expansion`" data-slot="data-table-expansion">
                                    <TableCell :colspan="allColumns.length" class="bg-muted/30 p-0"><slot name="expansion" :row="row.original" /></TableCell>
                                </TableRow>
                            </template>
                            <TableRow v-if="section.header && slots.groupFooter" class="bg-muted/30 font-semibold" data-slot="data-table-group-footer">
                                <TableCell :colspan="allColumns.length"><slot name="groupFooter" v-bind="section.header" /></TableCell>
                            </TableRow>
                        </template>
                    </template>
                </TableBody>
            </Table>
        </div>
        <Paginator
            v-if="props.paginator"
            :page="pagination.pageIndex"
            :page-size="pagination.pageSize"
            :page-count="table.getPageCount()"
            :total="totalRows"
            :page-size-options="props.pageSizeOptions"
            :report-template="props.reportTemplate"
            @update:page="table.setPageIndex($event)"
            @update:page-size="table.setPageSize($event)"
        />
    </div>
</template>
