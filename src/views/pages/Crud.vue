<script setup lang="ts">
    import { computed, h, onMounted, ref } from 'vue';
    import AppToolbar from '@/components/Toolbar.vue';
    import StarRating from '@/components/StarRating.vue';
    import { createColumns, DataTable } from '@/components/data-table';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field';
    import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Textarea } from '@/components/ui/textarea';
    import { IconExclamationTriangle, IconPencil, IconPlus, IconSearch, IconTrash, IconUpload } from '@/components/icons';
    import { useConfirm } from '@/composables/useConfirm';
    import { useToast } from '@/composables/useToast';
    import { ProductService } from '@/service/ProductService';
    import type { Product } from '@/service/types';
    import { downloadCsv, toCsv } from '@/utils/csv';

    type Row = Product & Record<string, unknown>;
    type Draft = Partial<Product>;

    const toast = useToast();
    const confirm = useConfirm();
    // Generic SFCs compile to a function type, so InstanceType cannot name the exposed surface; this is the part of it used here.
    const table = ref<{ visibleRows: () => Row[] } | null>(null);

    const products = ref<Row[]>([]);
    const selectedProducts = ref<Row[]>([]);
    const globalFilter = ref('');
    const productDialog = ref(false);
    const product = ref<Draft>({});
    const submitted = ref(false);

    const statuses = [
        { label: 'INSTOCK', value: 'INSTOCK' },
        { label: 'LOWSTOCK', value: 'LOWSTOCK' },
        { label: 'OUTOFSTOCK', value: 'OUTOFSTOCK' }
    ] as const;
    const categories = ['Accessories', 'Clothing', 'Electronics', 'Fitness'];

    onMounted(() => {
        ProductService.getProducts().then((data) => (products.value = data as Row[]));
    });

    function formatCurrency(value: number | undefined): string {
        return value === undefined ? '' : value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    function statusVariant(status: Product['inventoryStatus']): 'success' | 'warning' | 'destructive' {
        if (status === 'INSTOCK') return 'success';
        if (status === 'LOWSTOCK') return 'warning';
        return 'destructive';
    }

    const helper = createColumns<Row>();
    const columns = helper.columns([
        helper.accessor('code', { header: 'Code' }),
        helper.accessor('name', { header: 'Name' }),
        helper.display({
            id: 'image',
            header: 'Image',
            cell: ({ row }) => h('img', { src: `https://primefaces.org/cdn/primevue/images/product/${row.original.image}`, alt: row.original.image, class: 'rounded', style: 'width: 64px' })
        }),
        helper.accessor('price', { header: 'Price', cell: (ctx) => formatCurrency(ctx.getValue()) }),
        helper.accessor('category', { header: 'Category' }),
        helper.accessor('rating', { header: 'Reviews', cell: (ctx) => h(StarRating, { modelValue: ctx.getValue(), readonly: true }) }),
        helper.accessor('inventoryStatus', { header: 'Status', cell: (ctx) => h(Badge, { variant: statusVariant(ctx.getValue()) }, () => ctx.getValue()) }),
        helper.display({
            id: 'actions',
            header: '',
            cell: ({ row }) =>
                h('div', { class: 'flex gap-2' }, [
                    h(Button, { variant: 'outline', size: 'icon', class: 'rounded-full', 'aria-label': 'Edit', onClick: () => editProduct(row.original) }, () => h(IconPencil, { class: 'size-4' })),
                    h(Button, { variant: 'outline', size: 'icon', class: 'rounded-full text-destructive', 'aria-label': 'Delete', onClick: () => confirmDeleteProduct(row.original) }, () => h(IconTrash, { class: 'size-4' }))
                ])
        })
    ]);

    const hasSelection = computed(() => selectedProducts.value.length > 0);

    function openNew(): void {
        product.value = {};
        submitted.value = false;
        productDialog.value = true;
    }

    function hideDialog(): void {
        productDialog.value = false;
        submitted.value = false;
    }

    function createId(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: 5 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    function saveProduct(): void {
        submitted.value = true;
        if (!product.value.name?.trim()) return;

        if (product.value.id) {
            products.value = products.value.map((item) => (item.id === product.value.id ? ({ ...item, ...product.value } as Row) : item));
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        } else {
            const created: Row = {
                id: createId(),
                code: createId(),
                name: product.value.name,
                description: product.value.description ?? '',
                image: 'product-placeholder.svg',
                price: product.value.price ?? 0,
                category: product.value.category ?? categories[0]!,
                quantity: product.value.quantity ?? 0,
                inventoryStatus: product.value.inventoryStatus ?? 'INSTOCK',
                rating: product.value.rating ?? 0
            };
            products.value = [...products.value, created];
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        }
        productDialog.value = false;
        product.value = {};
    }

    function editProduct(item: Product): void {
        product.value = { ...item };
        productDialog.value = true;
    }

    function confirmDeleteProduct(item: Product): void {
        confirm.require({
            header: 'Confirm',
            message: `Are you sure you want to delete ${item.name}?`,
            icon: IconExclamationTriangle,
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptVariant: 'destructive',
            accept: () => {
                products.value = products.value.filter((row) => row.id !== item.id);
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
            }
        });
    }

    function confirmDeleteSelected(): void {
        confirm.require({
            header: 'Confirm',
            message: 'Are you sure you want to delete the selected products?',
            icon: IconExclamationTriangle,
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptVariant: 'destructive',
            accept: () => {
                const ids = new Set(selectedProducts.value.map((row) => row.id));
                products.value = products.value.filter((row) => !ids.has(row.id));
                selectedProducts.value = [];
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
            }
        });
    }

    function exportCSV(): void {
        const rows = table.value?.visibleRows() ?? products.value;
        const csv = toCsv(rows, [
            { key: 'code', header: 'Code' },
            { key: 'name', header: 'Name' },
            { key: 'price', header: 'Price' },
            { key: 'category', header: 'Category' },
            { key: 'rating', header: 'Reviews' },
            { key: 'inventoryStatus', header: 'Status' }
        ]);
        downloadCsv('products.csv', csv);
    }
</script>

<template>
    <div>
        <div class="card">
            <AppToolbar class="mb-6">
                <template #start>
                    <Button variant="secondary" @click="openNew"><IconPlus class="size-4" />New</Button>
                    <Button variant="secondary" :disabled="!hasSelection" @click="confirmDeleteSelected"><IconTrash class="size-4" />Delete</Button>
                </template>
                <template #end>
                    <Button variant="secondary" @click="exportCSV"><IconUpload class="size-4" />Export</Button>
                </template>
            </AppToolbar>

            <DataTable
                ref="table"
                v-model:selection="selectedProducts"
                v-model:global-filter="globalFilter"
                :columns="columns"
                :data="products"
                row-key="id"
                selectable
                paginator
                :page-size="10"
                :page-size-options="[5, 10, 25]"
                report-template="Showing {first} to {last} of {totalRecords} products"
            >
                <template #header>
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h4 class="m-0">Manage Products</h4>
                        <div class="relative">
                            <IconSearch class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input v-model="globalFilter" placeholder="Search..." class="pl-8" />
                        </div>
                    </div>
                </template>
            </DataTable>
        </div>

        <Dialog v-model:open="productDialog">
            <DialogContent class="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Product Details</DialogTitle>
                </DialogHeader>
                <div class="flex flex-col gap-6">
                    <img v-if="product.image" :src="`https://primefaces.org/cdn/primevue/images/product/${product.image}`" :alt="product.image" class="m-auto block pb-4" />
                    <div>
                        <Label for="name" class="mb-3 block font-bold">Name</Label>
                        <Input id="name" v-model.trim="product.name" required autofocus :aria-invalid="submitted && !product.name" />
                        <small v-if="submitted && !product.name" class="text-destructive">Name is required.</small>
                    </div>
                    <div>
                        <Label for="description" class="mb-3 block font-bold">Description</Label>
                        <Textarea id="description" v-model="product.description" rows="3" />
                    </div>
                    <div>
                        <Label for="inventoryStatus" class="mb-3 block font-bold">Inventory Status</Label>
                        <Select v-model="product.inventoryStatus">
                            <SelectTrigger id="inventoryStatus" class="w-full"><SelectValue placeholder="Select a Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="status in statuses" :key="status.value" :value="status.value">{{ status.label }}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <span class="mb-4 block font-bold">Category</span>
                        <RadioGroup v-model="product.category" class="grid grid-cols-2 gap-4">
                            <div v-for="category in categories" :key="category" class="flex items-center gap-2">
                                <RadioGroupItem :id="`category-${category}`" :value="category" />
                                <Label :for="`category-${category}`">{{ category }}</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <Label for="price" class="mb-3 block font-bold">Price</Label>
                            <NumberField id="price" v-model="product.price" :min="0" :format-options="{ style: 'currency', currency: 'USD', currencyDisplay: 'symbol' }">
                                <NumberFieldContent>
                                    <NumberFieldDecrement />
                                    <NumberFieldInput />
                                    <NumberFieldIncrement />
                                </NumberFieldContent>
                            </NumberField>
                        </div>
                        <div>
                            <Label for="quantity" class="mb-3 block font-bold">Quantity</Label>
                            <NumberField id="quantity" v-model="product.quantity" :min="0" :step="1" :format-options="{ maximumFractionDigits: 0 }">
                                <NumberFieldContent>
                                    <NumberFieldDecrement />
                                    <NumberFieldInput />
                                    <NumberFieldIncrement />
                                </NumberFieldContent>
                            </NumberField>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" @click="hideDialog">Cancel</Button>
                    <Button @click="saveProduct">Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>
