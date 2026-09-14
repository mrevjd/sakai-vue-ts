<script setup lang="ts">
    import { useScroll } from '@vueuse/core';
    import { computed, onMounted, ref, type Component } from 'vue';
    import { Button } from '@/components/ui/button';
    import { IconArrowUp } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(defineProps<{ target?: 'window' | 'parent'; threshold?: number; behavior?: ScrollBehavior; icon?: Component; class?: string }>(), {
        target: 'window',
        threshold: 400,
        behavior: 'smooth',
        icon: undefined,
        class: undefined
    });

    // The anchor span is only there to find the parent; the button itself is fixed or absolute and outside flow.
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
    <Button
        v-if="visible"
        size="icon-lg"
        :class="cn('z-40 rounded-full shadow-md', props.target === 'parent' ? 'absolute right-4 bottom-4' : 'fixed right-8 bottom-8', props.class)"
        aria-label="Scroll to top"
        data-slot="scroll-top"
        @click="scrollToTop"
    >
        <component :is="props.icon ?? IconArrowUp" class="size-5" />
    </Button>
</template>
