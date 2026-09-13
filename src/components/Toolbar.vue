<script setup lang="ts">
    import type { HTMLAttributes } from 'vue';
    import { cn } from '@/lib/utils';

    const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
    <div role="toolbar" :class="cn('flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3', props.class)" data-slot="toolbar">
        <div class="flex items-center gap-2"><slot name="start" /></div>
        <div class="flex items-center gap-2"><slot name="center" /></div>
        <div class="flex items-center gap-2"><slot name="end" /></div>
    </div>
</template>
