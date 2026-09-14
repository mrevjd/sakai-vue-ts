<script setup lang="ts">
    import { computed, ref, watch } from 'vue';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
    import { IconRotate, IconSearch, IconSearchMinus, IconSearchPlus } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(
        defineProps<{
            src: string;
            alt?: string;
            width?: string | number;
            height?: string | number;
            preview?: boolean;
            imageClass?: string;
            class?: string;
        }>(),
        { alt: '', width: undefined, height: undefined, preview: true, imageClass: undefined, class: undefined }
    );

    const open = ref(false);
    // PrimeVue's zoom range and step.
    const scale = ref(1);
    const rotation = ref(0);
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 1.5;
    const STEP = 0.1;

    function zoom(delta: number): void {
        scale.value = Math.round(Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value + delta)) * 10) / 10;
    }

    function rotate(delta: number): void {
        rotation.value += delta;
    }

    watch(open, (isOpen) => {
        if (!isOpen) {
            scale.value = 1;
            rotation.value = 0;
        }
    });

    const transform = computed(() => `rotate(${rotation.value}deg) scale(${scale.value})`);
</script>

<template>
    <span :class="cn('relative inline-block', props.class)" data-slot="image-preview">
        <img :src="props.src" :alt="props.alt" :width="props.width" :height="props.height" :class="props.imageClass" />
        <button
            v-if="props.preview"
            type="button"
            class="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all hover:bg-black/40 hover:opacity-100 focus-visible:opacity-100"
            :aria-label="`Preview ${props.alt || 'image'}`"
            data-slot="image-preview-trigger"
            @click="open = true"
        >
            <IconSearch class="size-6" />
        </button>
        <Dialog v-if="props.preview" v-model:open="open">
            <DialogContent class="flex max-w-4xl flex-col items-center gap-4 border-0 bg-transparent p-0 shadow-none" data-slot="image-preview-overlay">
                <DialogTitle class="sr-only">{{ props.alt || 'Image preview' }}</DialogTitle>
                <div class="flex gap-1 rounded-full bg-black/60 p-1">
                    <Button variant="ghost" size="icon-sm" class="text-white hover:bg-white/20" aria-label="Rotate right" @click="rotate(90)"><IconRotate class="size-4" /></Button>
                    <Button variant="ghost" size="icon-sm" class="text-white hover:bg-white/20" aria-label="Rotate left" @click="rotate(-90)"><IconRotate class="size-4 -scale-x-100" /></Button>
                    <Button variant="ghost" size="icon-sm" class="text-white hover:bg-white/20" aria-label="Zoom out" :disabled="scale <= MIN_SCALE" @click="zoom(-STEP)"><IconSearchMinus class="size-4" /></Button>
                    <Button variant="ghost" size="icon-sm" class="text-white hover:bg-white/20" aria-label="Zoom in" :disabled="scale >= MAX_SCALE" @click="zoom(STEP)"><IconSearchPlus class="size-4" /></Button>
                </div>
                <img :src="props.src" :alt="props.alt" class="max-h-[80vh] max-w-full transition-transform" :style="{ transform }" data-slot="image-preview-overlay-image" />
            </DialogContent>
        </Dialog>
    </span>
</template>
