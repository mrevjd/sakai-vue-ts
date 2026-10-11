<script setup lang="ts">
    import { computed, h, onBeforeMount, ref } from 'vue';
    import DatePicker from '@/components/DatePicker.vue';
    import MultiSelect from '@/components/MultiSelect.vue';
    import StarRating from '@/components/StarRating.vue';
    import ToggleButton from '@/components/ToggleButton.vue';
    import { createColumns, DataTable, type DataTableColumn } from '@/components/data-table';
    import { Badge, type BadgeVariants } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
    import { Label } from '@/components/ui/label';
    import { Progress } from '@/components/ui/progress';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Slider } from '@/components/ui/slider';
    import { IconCheckCircle, IconFilterSlash, IconLock, IconLockOpen, IconMinus, IconPlus, IconSearch, IconTimesCircle } from '@/components/icons';
    import { CustomerService } from '@/service/CustomerService';
    import { ProductService } from '@/service/ProductService';
    import type { Customer, Product, ProductOrder, Representative } from '@/service/types';
    import { formatCurrency } from '@/utils/currency';
    import { formatDate } from '@/utils/dateFormat';

    type CustomerRow = Customer & Record<string, unknown>;
    type ProductRow = Product & Record<string, unknown>;
    type OrderRow = ProductOrder & Record<string, unknown>;

    // Generic SFCs compile to a function type, so InstanceType cannot name the exposed surface; these are the parts used here.
    const table = ref<{ clearFilters: () => void } | null>(null);
    const expansionTable = ref<{ expandAll: () => void; collapseAll: () => void } | null>(null);

    const customers1 = ref<CustomerRow[]>([]);
    const customers2 = ref<CustomerRow[]>([]);
    const customers3 = ref<CustomerRow[]>([]);
    const products = ref<ProductRow[]>([]);
    const loading1 = ref<boolean>(true);
    const globalFilter = ref('');
    const balanceFrozen = ref(false);

    const statuses = ['unqualified', 'qualified', 'new', 'negotiation', 'renewal', 'proposal'];
    const representatives: Representative[] = [
        { name: 'Amy Elsner', image: 'amyelsner.png' },
        { name: 'Anna Fali', image: 'annafali.png' },
        { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
        { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
        { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
        { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
        { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
        { name: 'Onyama Limba', image: 'onyamalimba.png' },
        { name: 'Stephen Shaw', image: 'stephenshaw.png' },
        { name: 'XuXue Feng', image: 'xuxuefeng.png' }
    ];

    function getOrderSeverity(order: ProductOrder): BadgeVariants['variant'] {
        if (order.status === 'DELIVERED') return 'success';
        if (order.status === 'CANCELLED') return 'destructive';
        if (order.status === 'PENDING') return 'warning';
        if (order.status === 'RETURNED') return 'info';
        return 'default';
    }

    function statusVariant(status: string): BadgeVariants['variant'] {
        if (status === 'unqualified') return 'destructive';
        if (status === 'qualified') return 'success';
        if (status === 'new') return 'info';
        if (status === 'negotiation') return 'warning';
        return 'default';
    }

    function getStockSeverity(product: Product): BadgeVariants['variant'] {
        if (product.inventoryStatus === 'INSTOCK') return 'success';
        if (product.inventoryStatus === 'LOWSTOCK') return 'warning';
        if (product.inventoryStatus === 'OUTOFSTOCK') return 'destructive';
        return 'default';
    }

    onBeforeMount(() => {
        ProductService.getProductsWithOrdersSmall().then((data) => (products.value = data as ProductRow[]));
        CustomerService.getCustomersLarge().then((data) => {
            customers1.value = data;
            loading1.value = false;
        });
        CustomerService.getCustomersLarge().then((data) => (customers2.value = data));
        CustomerService.getCustomersMedium().then((data) => (customers3.value = data));
    });

    function clearFilters(): void {
        table.value?.clearFilters();
    }

    function expandAll(): void {
        expansionTable.value?.expandAll();
    }

    function collapseAll(): void {
        expansionTable.value?.collapseAll();
    }

    // The filter menu keeps its draft as `unknown`; these narrow it for each control rather than casting.
    function asArray(value: unknown): unknown[] {
        return Array.isArray(value) ? value : [];
    }

    function asString(value: unknown): string {
        return typeof value === 'string' ? value : '';
    }

    function asRange(value: unknown): number[] {
        return Array.isArray(value) && value.length === 2 && value.every((n): n is number => typeof n === 'number') ? value : [0, 100];
    }

    function asDate(value: unknown): Date | null {
        return value instanceof Date ? value : null;
    }

    // No value yet means no filter, which PrimeVue showed as the indeterminate state.
    function asCheckState(value: unknown): boolean | 'indeterminate' {
        return typeof value === 'boolean' ? value : 'indeterminate';
    }

    function isRepresentative(option: unknown): option is Representative {
        return typeof option === 'object' && option !== null && 'name' in option && 'image' in option;
    }

    // TanStack makes every accessor column sortable unless told otherwise; upstream only sorted the nested orders table.
    function unsortable<TData extends Record<string, unknown>>(columns: DataTableColumn<TData>[]): DataTableColumn<TData>[] {
        return columns.map((column) => ({ ...column, enableSorting: false }));
    }

    function flagCell(country: Customer['country']) {
        return h('div', { class: 'flex items-center gap-2' }, [
            h('img', { alt: 'flag', src: 'https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png', class: `flag flag-${country.code}`, style: 'width: 24px' }),
            h('span', country.name)
        ]);
    }

    const customerHelper = createColumns<CustomerRow>();

    const filterColumns = unsortable(
        customerHelper.columns([
            customerHelper.accessor('name', { header: 'Name', meta: { filter: { type: 'text', placeholder: 'Search by name' }, class: 'min-w-48' } }),
            customerHelper.accessor((row) => row.country.name, {
                id: 'country',
                header: 'Country',
                cell: ({ row }) => flagCell(row.original.country),
                meta: { filter: { type: 'text', placeholder: 'Search by country' }, class: 'min-w-48' }
            }),
            customerHelper.accessor((row) => row.representative.name, {
                id: 'representative',
                header: 'Agent',
                cell: ({ row }) =>
                    h('div', { class: 'flex items-center gap-2' }, [
                        h('img', { alt: row.original.representative.name, src: `https://primefaces.org/cdn/primevue/images/avatar/${row.original.representative.image}`, style: 'width: 32px' }),
                        h('span', row.original.representative.name)
                    ]),
                meta: { filter: { type: 'custom', matchModes: ['in'], showMatchModes: false }, class: 'min-w-56' }
            }),
            customerHelper.accessor('date', { header: 'Date', cell: (ctx) => formatDate(new Date(ctx.getValue()), 'mm/dd/yy'), meta: { filter: { type: 'date' }, class: 'min-w-40' } }),
            customerHelper.accessor('balance', { header: 'Balance', cell: (ctx) => formatCurrency(ctx.getValue()), meta: { filter: { type: 'numeric' }, class: 'min-w-40' } }),
            customerHelper.accessor('status', {
                header: 'Status',
                cell: (ctx) => h(Badge, { variant: statusVariant(ctx.getValue()) }, () => ctx.getValue()),
                meta: { filter: { type: 'custom', matchModes: ['equals'], showMatchModes: false }, class: 'min-w-48' }
            }),
            customerHelper.accessor('activity', {
                header: 'Activity',
                cell: (ctx) => h(Progress, { modelValue: ctx.getValue(), class: 'h-1.5' }),
                meta: { filter: { type: 'custom', matchModes: ['between'], showMatchModes: false }, class: 'min-w-48' }
            }),
            customerHelper.accessor('verified', {
                header: 'Verified',
                // Preflight makes svg a block, so it needs inline-block for the cell's text-center to reach it.
                cell: (ctx) => (ctx.getValue() ? h(IconCheckCircle, { class: 'inline-block size-4 text-green-500' }) : h(IconTimesCircle, { class: 'inline-block size-4 text-red-500' })),
                meta: { filter: { type: 'custom', matchModes: ['equals'], showMatchModes: false }, class: 'min-w-32 text-center' }
            })
        ])
    );

    // A computed, not a constant: the wrapper derives pinning from column meta on each read, and Balance follows the toggle.
    const frozenColumns = computed(() =>
        unsortable(
            customerHelper.columns([
                customerHelper.accessor('name', { id: 'frozenName', header: 'Name', size: 200, meta: { frozen: 'left', class: 'font-bold', headerClass: 'font-bold' } }),
                customerHelper.accessor('id', { header: 'Id', size: 100 }),
                customerHelper.accessor('name', { header: 'Name', size: 200 }),
                customerHelper.accessor((row) => row.country.name, { id: 'country', header: 'Country', size: 200 }),
                customerHelper.accessor('date', { header: 'Date', size: 200 }),
                customerHelper.accessor('company', { header: 'Company', size: 200 }),
                customerHelper.accessor('status', { header: 'Status', size: 200 }),
                customerHelper.accessor('activity', { header: 'Activity', size: 200 }),
                customerHelper.accessor((row) => row.representative.name, { id: 'representative', header: 'Representative', size: 200 }),
                customerHelper.accessor('balance', {
                    header: 'Balance',
                    size: 200,
                    cell: (ctx) => formatCurrency(ctx.getValue()),
                    meta: balanceFrozen.value ? { frozen: 'right', class: 'font-bold', headerClass: 'font-bold' } : { class: 'font-bold' }
                })
            ])
        )
    );

    const productHelper = createColumns<ProductRow>();

    const productColumns = unsortable(
        productHelper.columns([
            productHelper.accessor('name', { header: 'Name' }),
            productHelper.display({
                id: 'image',
                header: 'Image',
                cell: ({ row }) => h('img', { src: `https://primefaces.org/cdn/primevue/images/product/${row.original.image}`, alt: row.original.image, class: 'shadow-lg', width: 64 })
            }),
            productHelper.accessor('price', { header: 'Price', cell: (ctx) => formatCurrency(ctx.getValue()) }),
            productHelper.accessor('category', { header: 'Category' }),
            productHelper.accessor('rating', { header: 'Reviews', cell: (ctx) => h(StarRating, { modelValue: ctx.getValue(), readonly: true }) }),
            productHelper.accessor('inventoryStatus', { header: 'Status', cell: ({ row }) => h(Badge, { variant: getStockSeverity(row.original) }, () => row.original.inventoryStatus) })
        ])
    );

    const orderHelper = createColumns<OrderRow>();

    // Left sortable: upstream marked every orders column sortable, and no other column on the page.
    const orderColumns = orderHelper.columns([
        orderHelper.accessor('id', { header: 'Id' }),
        orderHelper.accessor('customer', { header: 'Customer' }),
        orderHelper.accessor('date', { header: 'Date' }),
        orderHelper.accessor('amount', { header: 'Amount', cell: (ctx) => formatCurrency(ctx.getValue()) }),
        orderHelper.accessor('status', { header: 'Status', cell: ({ row }) => h(Badge, { variant: getOrderSeverity(row.original) }, () => row.original.status.toLowerCase()) }),
        orderHelper.display({
            id: 'actions',
            header: '',
            cell: () => h(Button, { size: 'icon', 'aria-label': 'View order' }, () => h(IconSearch)),
            meta: { headerClass: 'w-16' }
        })
    ]);

    const groupColumns = customerHelper.columns([
        // Left sortable: TanStack drops initialSorting entries for columns that cannot sort, and the groups are ordered by this one.
        customerHelper.accessor((row) => row.representative.name, { id: 'representative', header: 'Representative' }),
        ...unsortable(
            customerHelper.columns([
                customerHelper.accessor('name', { header: 'Name', meta: { class: 'min-w-50' } }),
                customerHelper.accessor((row) => row.country.name, { id: 'country', header: 'Country', cell: ({ row }) => flagCell(row.original.country), meta: { class: 'min-w-50' } }),
                customerHelper.accessor('company', { header: 'Company', meta: { class: 'min-w-50' } }),
                customerHelper.accessor('status', { header: 'Status', cell: (ctx) => h(Badge, { variant: statusVariant(ctx.getValue()) }, () => ctx.getValue()), meta: { class: 'min-w-50' } }),
                customerHelper.accessor('date', { header: 'Date', meta: { class: 'min-w-50' } })
            ])
        )
    ]);
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Filtering</div>
        <DataTable
            ref="table"
            v-model:global-filter="globalFilter"
            :columns="filterColumns"
            :data="customers1"
            row-key="id"
            paginator
            :page-size="10"
            row-hover
            show-gridlines
            :loading="loading1"
            :global-filter-fields="['name', 'country', 'representative', 'balance', 'status']"
        >
            <template #header>
                <div class="flex justify-between">
                    <Button variant="outline" @click="clearFilters"><IconFilterSlash />Clear</Button>
                    <InputGroup class="w-56">
                        <InputGroupAddon><IconSearch /></InputGroupAddon>
                        <InputGroupInput v-model="globalFilter" placeholder="Keyword Search" />
                    </InputGroup>
                </div>
            </template>
            <template #empty>No customers found.</template>
            <template #loading>Loading customers data. Please wait.</template>
            <template #filter-representative="{ value, setValue }">
                <MultiSelect :model-value="asArray(value)" :options="representatives" option-label="name" option-value="name" placeholder="Any" @update:model-value="setValue">
                    <template #option="{ option }">
                        <div v-if="isRepresentative(option)" class="flex items-center gap-2">
                            <img :alt="option.name" :src="`https://primefaces.org/cdn/primevue/images/avatar/${option.image}`" style="width: 32px" />
                            <span>{{ option.name }}</span>
                        </div>
                    </template>
                </MultiSelect>
            </template>
            <template #filter-date="{ value, setValue }">
                <DatePicker :model-value="asDate(value)" placeholder="mm/dd/yyyy" @update:model-value="setValue" />
            </template>
            <template #filter-status="{ value, setValue }">
                <Select :model-value="asString(value)" @update:model-value="setValue">
                    <SelectTrigger class="w-full"><SelectValue placeholder="Select One" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="status in statuses" :key="status" :value="status">
                            <Badge :variant="statusVariant(status)">{{ status }}</Badge>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </template>
            <template #filter-activity="{ value, setValue }">
                <div class="flex flex-col gap-2">
                    <Slider :model-value="asRange(value)" :min="0" :max="100" @update:model-value="setValue" />
                    <div class="flex justify-between text-sm text-muted-foreground">
                        <span>{{ asRange(value)[0] }}</span>
                        <span>{{ asRange(value)[1] }}</span>
                    </div>
                </div>
            </template>
            <template #filter-verified="{ value, setValue }">
                <div class="flex items-center gap-2">
                    <Label for="verified-filter" class="font-bold">Verified</Label>
                    <Checkbox id="verified-filter" :model-value="asCheckState(value)" @update:model-value="setValue" />
                </div>
            </template>
        </DataTable>
    </div>

    <div class="card">
        <div class="font-semibold text-xl mb-4">Frozen Columns</div>
        <ToggleButton v-model="balanceFrozen" on-label="Balance" off-label="Balance" :on-icon="IconLock" :off-icon="IconLockOpen" />

        <DataTable :columns="frozenColumns" :data="customers2" row-key="id" scroll-height="400px" class="mt-6" />
    </div>

    <div class="card">
        <div class="font-semibold text-xl mb-4">Row Expansion</div>
        <DataTable ref="expansionTable" :columns="productColumns" :data="products" row-key="id" expandable class="[&>[data-slot=data-table-scroller]>div>table]:min-w-240">
            <template #header>
                <div class="flex flex-wrap justify-end gap-2">
                    <Button variant="ghost" @click="expandAll"><IconPlus />Expand All</Button>
                    <Button variant="ghost" @click="collapseAll"><IconMinus />Collapse All</Button>
                </div>
            </template>
            <template #expansion="{ row }">
                <div class="p-4">
                    <div class="mb-2 font-semibold">Orders for {{ row.name }}</div>
                    <DataTable :columns="orderColumns" :data="(row.orders ?? []) as OrderRow[]" row-key="id" />
                </div>
            </template>
        </DataTable>
    </div>

    <div class="card">
        <div class="font-semibold text-xl mb-4">Grouping</div>
        <DataTable :columns="groupColumns" :data="customers3" row-key="id" group-by="representative" :initial-sorting="[{ id: 'representative', desc: false }]" scroll-height="400px" class="[&_table]:min-w-200">
            <template #groupHeader="{ row, value }">
                <div class="flex items-center gap-2">
                    <img :alt="row.representative.name" :src="`https://primefaces.org/cdn/primevue/images/avatar/${row.representative.image}`" width="32" />
                    <span>{{ value }}</span>
                </div>
            </template>
            <template #groupFooter="{ count }">
                <div class="flex w-full justify-end font-bold">Total Customers: {{ count }}</div>
            </template>
        </DataTable>
    </div>
</template>
