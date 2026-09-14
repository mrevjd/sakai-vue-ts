<script setup lang="ts">
    import { computed } from 'vue';
    import { cn } from '@/lib/utils';

    const props = withDefaults(defineProps<{ layout?: 'horizontal' | 'vertical'; align?: 'left' | 'center' | 'right' | 'top' | 'bottom'; type?: 'solid' | 'dashed' | 'dotted'; class?: string }>(), {
        layout: 'horizontal',
        align: 'center',
        type: 'solid',
        class: undefined
    });

    const vertical = computed(() => props.layout === 'vertical');
    const lineClass = computed(() => cn('border-border', props.type === 'dashed' && 'border-dashed', props.type === 'dotted' && 'border-dotted', vertical.value ? 'w-px border-l' : 'h-px flex-1 border-t'));
    // The two line segments share the free space unless the content is pushed to one end.
    const before = computed(() => (props.align === 'left' || props.align === 'top' ? 'flex-none basis-4' : 'flex-1'));
    const after = computed(() => (props.align === 'right' || props.align === 'bottom' ? 'flex-none basis-4' : 'flex-1'));
</script>

<template>
    <div
        role="separator"
        :aria-orientation="props.layout"
        :class="cn('flex items-center', vertical ? 'mx-4 h-full min-h-full flex-col self-stretch' : 'my-4 w-full', props.class)"
        data-slot="divider"
        :data-layout="props.layout"
        :data-align="props.align"
    >
        <span :class="cn(lineClass, before)" />
        <span v-if="$slots.default" class="px-2 text-sm text-muted-foreground"><slot /></span>
        <span :class="cn(lineClass, after)" />
    </div>
</template>
