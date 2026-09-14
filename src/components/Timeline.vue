<script setup lang="ts" generic="T">
    import { computed } from 'vue';
    import { cn } from '@/lib/utils';

    // Each event is a three-part row: opposite, separator (marker plus connector), content.
    // "side" says which side of the separator the content sits on; alternate flips it per event.
    const props = withDefaults(defineProps<{ value: T[]; align?: 'left' | 'right' | 'alternate' | 'top' | 'bottom'; layout?: 'vertical' | 'horizontal'; class?: string }>(), { align: 'left', layout: 'vertical', class: undefined });

    const horizontal = computed(() => props.layout === 'horizontal');

    function side(index: number): 'left' | 'right' {
        if (props.align === 'alternate') return index % 2 === 0 ? 'left' : 'right';
        // right and bottom put content before the separator; left and top put it after.
        return props.align === 'right' || props.align === 'bottom' ? 'right' : 'left';
    }
</script>

<template>
    <div :class="cn('flex', horizontal ? 'flex-row' : 'flex-col', props.class)" data-slot="timeline" :data-align="props.align" :data-layout="props.layout">
        <div
            v-for="(item, index) in props.value"
            :key="index"
            :class="cn('flex min-h-16 flex-1', horizontal ? 'flex-col' : 'flex-row', side(index) === 'right' && (horizontal ? 'flex-col-reverse' : 'flex-row-reverse'))"
            data-slot="timeline-event"
            :data-side="side(index)"
        >
            <div :class="cn('flex-1', horizontal ? 'pb-2 text-center' : 'px-4 text-right', side(index) === 'right' && !horizontal && 'text-left')" data-slot="timeline-opposite"><slot name="opposite" :item="item" :index="index" /></div>
            <div :class="cn('flex items-center', horizontal ? 'w-full flex-row' : 'flex-col')" data-slot="timeline-separator">
                <slot name="marker" :item="item" :index="index"><span class="size-4 shrink-0 rounded-full border-2 border-primary bg-card" data-slot="timeline-marker" /></slot>
                <slot v-if="index < props.value.length - 1" name="connector" :item="item" :index="index"><span :class="cn('bg-border', horizontal ? 'h-0.5 w-full' : 'min-h-8 w-0.5 flex-1')" data-slot="timeline-connector" /></slot>
            </div>
            <div :class="cn('flex-1', horizontal ? 'pt-2 text-center' : 'px-4 pb-6', side(index) === 'right' && !horizontal && 'text-right')" data-slot="timeline-content"><slot name="content" :item="item" :index="index" /></div>
        </div>
    </div>
</template>
