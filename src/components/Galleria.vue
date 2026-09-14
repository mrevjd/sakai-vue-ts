<script setup lang="ts">
    import { useFullscreen, useIntervalFn, useWindowSize } from '@vueuse/core';
    import { computed, ref, watch, type CSSProperties } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
    import { IconAngleLeft, IconAngleRight, IconWindowMaximize, IconWindowMinimize } from '@/components/icons';
    import { cn } from '@/lib/utils';

    export interface GalleriaItem {
        itemImageSrc: string;
        thumbnailImageSrc: string;
        alt?: string;
        title?: string;
    }

    const props = withDefaults(
        defineProps<{
            value: GalleriaItem[];
            numVisible?: number;
            responsiveOptions?: { breakpoint: string; numVisible: number }[];
            showThumbnails?: boolean;
            showIndicators?: boolean;
            circular?: boolean;
            autoPlay?: boolean;
            transitionInterval?: number;
            fullScreen?: boolean;
            containerStyle?: string | CSSProperties;
            containerClass?: string;
        }>(),
        { numVisible: 5, responsiveOptions: () => [], showThumbnails: true, showIndicators: false, circular: false, autoPlay: false, transitionInterval: 4000, fullScreen: false, containerStyle: undefined, containerClass: undefined }
    );

    const activeIndex = defineModel<number>('activeIndex', { default: 0 });

    const root = ref<HTMLElement | null>(null);
    const strip = ref<HTMLElement | null>(null);
    // CarouselApi already includes undefined: the vendored type unwraps embla's Ref<Api | undefined>.
    let api: CarouselApi;

    function onInitApi(instance: CarouselApi): void {
        if (!instance) return;
        api = instance;
        instance.on('select', () => {
            activeIndex.value = instance.selectedScrollSnap();
        });
    }

    function goTo(index: number): void {
        // Set directly as well as through embla so the active state does not wait on a layout pass.
        activeIndex.value = index;
        api?.scrollTo(index);
    }

    watch(activeIndex, (index) => {
        if (api && api.selectedScrollSnap() !== index) api.scrollTo(index);
        strip.value?.children[index]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    });

    // PrimeVue's responsiveOptions are max-width breakpoints; the smallest one wider than the viewport wins.
    const { width } = useWindowSize();
    const visible = computed(() => {
        const match = [...props.responsiveOptions].sort((a, b) => parseInt(a.breakpoint, 10) - parseInt(b.breakpoint, 10)).find((option) => width.value <= parseInt(option.breakpoint, 10));
        return Math.max(1, match?.numVisible ?? props.numVisible);
    });

    const { pause, resume } = useIntervalFn(
        () => {
            const next = activeIndex.value + 1;
            goTo(next >= props.value.length ? 0 : next);
        },
        () => props.transitionInterval,
        { immediate: props.autoPlay }
    );
    watch(
        () => props.autoPlay,
        (on) => (on ? resume() : pause())
    );

    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(root);
</script>

<template>
    <div ref="root" :class="cn('flex flex-col gap-3 bg-card', isFullscreen && 'justify-center p-4', props.containerClass)" :style="props.containerStyle" data-slot="galleria">
        <div class="relative">
            <Carousel :opts="{ loop: props.circular }" class="w-full" @init-api="onInitApi">
                <CarouselContent>
                    <CarouselItem v-for="(item, index) in props.value" :key="index" data-slot="galleria-item">
                        <slot name="item" :item="item" :index="index"><img :src="item.itemImageSrc" :alt="item.alt ?? ''" class="w-full" /></slot>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious class="left-2" />
                <CarouselNext class="right-2" />
            </Carousel>
            <Button v-if="props.fullScreen" variant="secondary" size="icon-sm" class="absolute top-2 right-2" aria-label="Toggle fullscreen" @click="toggleFullscreen">
                <IconWindowMinimize v-if="isFullscreen" class="size-4" />
                <IconWindowMaximize v-else class="size-4" />
            </Button>
            <div v-if="$slots.caption" class="absolute inset-x-0 bottom-0 bg-black/50 p-3 text-white"><slot name="caption" :item="props.value[activeIndex]" :index="activeIndex" /></div>
        </div>
        <div v-if="props.showIndicators" class="flex justify-center gap-2" data-slot="galleria-indicators">
            <button
                v-for="(_, index) in props.value"
                :key="index"
                type="button"
                :class="cn('size-2.5 rounded-full bg-muted transition-colors', index === activeIndex && 'bg-primary')"
                :aria-label="`Go to item ${index + 1}`"
                :data-active="index === activeIndex || undefined"
                data-slot="galleria-indicator"
                @click="goTo(index)"
            />
        </div>
        <div v-if="props.showThumbnails" class="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Previous thumbnails" @click="goTo(Math.max(0, activeIndex - 1))"><IconAngleLeft class="size-4" /></Button>
            <div ref="strip" class="flex flex-1 gap-2 overflow-hidden" data-slot="galleria-thumbnails">
                <button
                    v-for="(item, index) in props.value"
                    :key="index"
                    type="button"
                    :style="{ flexBasis: `${100 / visible}%` }"
                    :class="cn('shrink-0 grow-0 overflow-hidden rounded-md border-2 border-transparent opacity-70 transition-opacity hover:opacity-100', index === activeIndex && 'border-primary opacity-100')"
                    :aria-label="`Show item ${index + 1}`"
                    :data-active="index === activeIndex || undefined"
                    data-slot="galleria-thumbnail"
                    @click="goTo(index)"
                >
                    <slot name="thumbnail" :item="item" :index="index"><img :src="item.thumbnailImageSrc" :alt="item.alt ?? ''" class="w-full" /></slot>
                </button>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Next thumbnails" @click="goTo(Math.min(props.value.length - 1, activeIndex + 1))"><IconAngleRight class="size-4" /></Button>
        </div>
    </div>
</template>
