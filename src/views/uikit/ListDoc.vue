<script setup lang="ts">
    import { onMounted, ref } from 'vue';
    import DataView from '@/components/DataView.vue';
    import { OrderList, PickList } from '@/components/list';
    import SelectButton from '@/components/SelectButton.vue';
    import { Badge, type BadgeVariants } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { IconBars, IconHeart, IconShoppingCart, IconStar, IconTable } from '@/components/icons';
    import { ProductService } from '@/service/ProductService';
    import type { Product } from '@/service/types';

    const products = ref<Product[]>([]);
    const picklistProducts = ref<[Product[], Product[]]>([[], []]);
    const orderlistProducts = ref<Product[]>([]);
    const options = ref<('list' | 'grid')[]>(['list', 'grid']);
    const layout = ref<'list' | 'grid'>('list');

    onMounted(() => {
        ProductService.getProductsSmall().then((data: Product[]) => {
            products.value = data.slice(0, 6);
            picklistProducts.value = [data, []];
            orderlistProducts.value = data;
        });
    });

    function statusVariant(status: string): BadgeVariants['variant'] {
        if (status === 'INSTOCK') return 'success';
        if (status === 'LOWSTOCK') return 'warning';
        if (status === 'OUTOFSTOCK') return 'destructive';
        return 'default';
    }
</script>

<template>
    <div class="flex flex-col">
        <div class="card">
            <div class="font-semibold text-xl">DataView</div>
            <DataView :value="products" :layout="layout">
                <template #header>
                    <div class="flex justify-end">
                        <SelectButton v-model="layout" :options="options" :allow-empty="false">
                            <template #option="{ option }">
                                <IconBars v-if="option === 'list'" />
                                <IconTable v-else />
                            </template>
                        </SelectButton>
                    </div>
                </template>

                <template #list="slotProps">
                    <div class="flex flex-col">
                        <div v-for="(item, index) in slotProps.items" :key="index">
                            <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4" :class="{ 'border-t border-border': index !== 0 }">
                                <div class="md:w-40 relative">
                                    <img class="block xl:block mx-auto rounded w-full" :src="`https://primefaces.org/cdn/primevue/images/product/${item.image}`" :alt="item.name" />
                                    <Badge :variant="statusVariant(item.inventoryStatus)" class="absolute left-1 top-1">{{ item.inventoryStatus }}</Badge>
                                </div>
                                <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                    <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                        <div>
                                            <span class="font-medium text-muted-foreground text-sm">{{ item.category }}</span>
                                            <div class="text-lg font-medium mt-2">{{ item.name }}</div>
                                        </div>
                                        <div class="bg-muted p-1 rounded-full">
                                            <div class="bg-card flex items-center gap-2 justify-center py-1 px-2 rounded-full shadow-sm">
                                                <span class="text-foreground font-medium text-sm">{{ item.rating }}</span>
                                                <IconStar class="size-4 fill-current text-yellow-500" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:items-end gap-8">
                                        <span class="text-xl font-semibold">${{ item.price }}</span>
                                        <div class="flex flex-row-reverse md:flex-row gap-2">
                                            <Button variant="outline" size="icon" aria-label="Add to favourites"><IconHeart /></Button>
                                            <Button class="flex-auto whitespace-nowrap md:flex-initial" :disabled="item.inventoryStatus === 'OUTOFSTOCK'"><IconShoppingCart />Buy Now</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <template #grid="slotProps">
                    <div class="grid grid-cols-12 gap-4">
                        <div v-for="(item, index) in slotProps.items" :key="index" class="col-span-12 sm:col-span-6 lg:col-span-4 p-2">
                            <div class="p-6 border border-border bg-card rounded flex flex-col">
                                <div class="bg-muted flex justify-center rounded p-4">
                                    <div class="relative mx-auto">
                                        <img class="rounded w-full" :src="`https://primefaces.org/cdn/primevue/images/product/${item.image}`" :alt="item.name" style="max-width: 300px" />
                                        <Badge :variant="statusVariant(item.inventoryStatus)" class="absolute left-1 top-1">{{ item.inventoryStatus }}</Badge>
                                    </div>
                                </div>
                                <div class="pt-6">
                                    <div class="flex flex-row justify-between items-start gap-2">
                                        <div>
                                            <span class="font-medium text-muted-foreground text-sm">{{ item.category }}</span>
                                            <div class="text-lg font-medium mt-1">{{ item.name }}</div>
                                        </div>
                                        <div class="bg-muted p-1 rounded-full">
                                            <div class="bg-card flex items-center gap-2 justify-center py-1 px-2 rounded-full shadow-sm">
                                                <span class="text-foreground font-medium text-sm">{{ item.rating }}</span>
                                                <IconStar class="size-4 fill-current text-yellow-500" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-6 mt-6">
                                        <span class="text-xxl font-semibold">${{ item.price }}</span>
                                        <div class="flex gap-2">
                                            <Button class="flex-auto whitespace-nowrap" :disabled="item.inventoryStatus === 'OUTOFSTOCK'"><IconShoppingCart />Buy Now</Button>
                                            <Button variant="outline" size="icon" aria-label="Add to favourites"><IconHeart /></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </DataView>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
            <div class="lg:w-2/3">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">PickList</div>
                    <PickList v-model="picklistProducts" data-key="id">
                        <template #option="{ option }">
                            {{ option.name }}
                        </template>
                    </PickList>
                </div>
            </div>

            <div class="lg:w-1/3">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">OrderList</div>
                    <OrderList v-model="orderlistProducts" data-key="id">
                        <template #option="{ option }">
                            {{ option.name }}
                        </template>
                    </OrderList>
                </div>
            </div>
        </div>
    </div>
</template>
