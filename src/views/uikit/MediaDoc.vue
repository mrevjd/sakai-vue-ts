<script setup lang="ts">
    import { onMounted, ref } from 'vue';
    import Galleria, { type GalleriaItem } from '@/components/Galleria.vue';
    import ImagePreview from '@/components/ImagePreview.vue';
    import { Badge, type BadgeVariants } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
    import { IconHeart, IconShoppingCart } from '@/components/icons';
    import { PhotoService } from '@/service/PhotoService';
    import { ProductService } from '@/service/ProductService';
    import type { Photo, Product } from '@/service/types';

    const products = ref<Product[]>([]);
    const images = ref<GalleriaItem[]>([]);
    const galleriaResponsiveOptions = ref<{ breakpoint: string; numVisible: number }[]>([
        {
            breakpoint: '1024px',
            numVisible: 5
        },
        {
            breakpoint: '960px',
            numVisible: 4
        },
        {
            breakpoint: '768px',
            numVisible: 3
        },
        {
            breakpoint: '560px',
            numVisible: 1
        }
    ]);

    onMounted(() => {
        ProductService.getProductsSmall().then((data: Product[]) => (products.value = data));
        PhotoService.getImages().then((data: Photo[]) => (images.value = data));
    });

    function getSeverity(status: string): BadgeVariants['variant'] {
        switch (status) {
            case 'INSTOCK':
                return 'success';

            case 'LOWSTOCK':
                return 'warning';

            case 'OUTOFSTOCK':
                return 'destructive';

            default:
                return 'default';
        }
    }
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Carousel</div>
        <Carousel :opts="{ align: 'start' }" class="w-full">
            <CarouselContent>
                <CarouselItem v-for="product in products" :key="product.id" class="basis-full sm:basis-1/2 lg:basis-1/3">
                    <div class="border border-border rounded-lg p-4">
                        <div class="mb-4">
                            <div class="relative mx-auto">
                                <img :src="'https://primefaces.org/cdn/primevue/images/product/' + product.image" :alt="product.name" class="w-full rounded" />
                                <div class="absolute left-1 top-1">
                                    <Badge :variant="getSeverity(product.inventoryStatus)">{{ product.inventoryStatus }}</Badge>
                                </div>
                            </div>
                        </div>
                        <div class="mb-4 font-medium">{{ product.name }}</div>
                        <div class="flex justify-between items-center">
                            <div class="mt-0 font-semibold text-xl">${{ product.price }}</div>
                            <span class="flex gap-2">
                                <Button variant="outline" size="icon" aria-label="Add to favourites"><IconHeart /></Button>
                                <Button size="icon" aria-label="Add to cart"><IconShoppingCart /></Button>
                            </span>
                        </div>
                    </div>
                </CarouselItem>
            </CarouselContent>
            <!-- Pulled inside the carousel box, as Galleria does: the default -left-12 hangs past the card padding and scrolls a phone sideways. -->
            <CarouselPrevious class="left-2" />
            <CarouselNext class="right-2" />
        </Carousel>
    </div>

    <div class="card">
        <div class="font-semibold text-xl mb-4">Image</div>
        <ImagePreview src="https://primefaces.org/cdn/primevue/images/galleria/galleria10.jpg" alt="Image" width="250" />
    </div>

    <div class="card">
        <div class="font-semibold text-xl mb-4">Galleria</div>
        <Galleria :value="images" :responsive-options="galleriaResponsiveOptions" :num-visible="5" container-style="max-width: 640px">
            <template #item="slotProps">
                <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" style="width: 100%" />
            </template>
            <template #thumbnail="slotProps">
                <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" />
            </template>
        </Galleria>
    </div>
</template>
