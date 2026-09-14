import {
    columnFilteringFeature,
    columnGroupingFeature,
    columnPinningFeature,
    columnVisibilityFeature,
    createExpandedRowModel,
    createFilteredRowModel,
    createGroupedRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    filterFn_includesString,
    globalFilteringFeature,
    rowExpandingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    sortFn_basic,
    sortFn_text,
    tableFeatures
} from '@tanstack/vue-table';
import type { DataTableColumnMeta } from './filters';
import { matchModeFilter } from './filters';

// One feature set for every table in the template. TanStack v9 only ships the code for the
// features listed here, so adding a capability means adding it in this one place.
export const features = tableFeatures({
    columnFilteringFeature,
    columnGroupingFeature,
    columnPinningFeature,
    columnVisibilityFeature,
    globalFilteringFeature,
    rowExpandingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    expandedRowModel: createExpandedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    groupedRowModel: createGroupedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
    filterFns: { includesString: filterFn_includesString, matchMode: matchModeFilter },
    sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text },
    // Type-only: makes `columnDef.meta` carry DataTableColumnMeta for every consumer of createColumns().
    columnMeta: {} as DataTableColumnMeta
});

export type DataTableFeatures = typeof features;
