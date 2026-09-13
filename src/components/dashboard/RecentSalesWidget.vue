<script setup lang="ts">
    import { h, onMounted, ref } from 'vue';
    import { createColumns, DataTable } from '@/components/data-table';
    import { Button } from '@/components/ui/button';
    import { IconSearch } from '@/components/icons';
    import { ProductService } from '@/service/ProductService';
    import type { Product } from '@/service/types';

    type Row = Product & Record<string, unknown>;

    const products = ref<Row[]>([]);

    function formatCurrency(value: number): string {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    const helper = createColumns<Row>();
    const columns = helper.columns([
        helper.display({
            id: 'image',
            header: 'Image',
            cell: ({ row }) => h('img', { src: `https://primefaces.org/cdn/primevue/images/product/${row.original.image}`, alt: row.original.image, width: 50, class: 'shadow' })
        }),
        helper.accessor('name', { header: 'Name' }),
        helper.accessor('price', { header: 'Price', cell: (ctx) => formatCurrency(ctx.getValue()) }),
        helper.display({
            id: 'view',
            header: 'View',
            cell: () => h(Button, { variant: 'ghost', size: 'icon-sm', 'aria-label': 'View' }, () => h(IconSearch, { class: 'size-4' }))
        })
    ]);

    onMounted(() => {
        ProductService.getProductsSmall().then((data) => (products.value = data as Row[]));
    });
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Recent Sales</div>
        <DataTable :columns="columns" :data="products" row-key="id" paginator :page-size="5" />
    </div>
</template>
