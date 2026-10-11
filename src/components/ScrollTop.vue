<script setup lang="ts">
    import { useScroll } from '@vueuse/core';
    import { computed, onMounted, ref, type Component } from 'vue';
    import { Button } from '@/components/ui/button';
    import { IconArrowUp } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(
        defineProps<{
            target?: 'window' | 'parent';
            threshold?: number;
            behavior?: ScrollBehavior;
            icon?: Component;
            // Styles the button only, not the wrapper: `target` owns positioning, and a class there would fight it.
            class?: string;
        }>(),
        {
            target: 'window',
            threshold: 400,
            behavior: 'smooth',
            icon: undefined,
            class: undefined
        }
    );

    // The anchor span is only there to find the parent.
    const anchor = ref<HTMLElement | null>(null);
    const element = ref<HTMLElement | Window | null>(null);
    onMounted(() => {
        element.value = props.target === 'parent' ? (anchor.value?.parentElement ?? null) : window;
    });

    const { y } = useScroll(element);
    const visible = computed(() => y.value > props.threshold);

    function scrollToTop(): void {
        element.value?.scrollTo({ top: 0, behavior: props.behavior });
    }
</script>

<template>
    <span ref="anchor" class="hidden" aria-hidden="true" />
    <!-- Parent mode sticks rather than absolutely positioning: an absolute child of a scroller is laid
         out against the unscrolled box and scrolls away with the content, which is exactly when the
         button is meant to appear. Window mode stays fixed to the viewport. -->
    <div v-if="visible" :class="cn('z-40', props.target === 'parent' ? 'sticky bottom-4 flex justify-end' : 'fixed right-8 bottom-8')">
        <Button size="icon-lg" :class="cn('rounded-full shadow-md', props.class)" aria-label="Scroll to top" data-slot="scroll-top" @click="scrollToTop">
            <component :is="props.icon ?? IconArrowUp" class="size-5" />
        </Button>
    </div>
</template>
