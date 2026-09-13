import { createColumnHelper, type ColumnDef, type RowData } from '@tanstack/vue-table';
import type { DataTableFeatures } from './features';

export { default as DataTable } from './DataTable.vue';
export { features, type DataTableFeatures } from './features';

export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;

// Consumers build columns with this helper so they never import the feature set themselves.
export function createColumns<TData extends RowData>() {
    return createColumnHelper<DataTableFeatures, TData>();
}
