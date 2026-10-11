<script setup lang="ts">
    import { Badge, type BadgeVariants } from '@/components/ui/badge';
    import { cn } from '@/lib/utils';

    // PrimeVue severities map onto the Badge variants Plan 2 added.
    // Record<Severity, ...> forces the map and the union to list the same keys, so a misspelt severity fails type-check.
    type Severity = 'secondary' | 'success' | 'info' | 'warn' | 'warning' | 'danger' | 'contrast';
    const variants: Record<Severity, BadgeVariants['variant']> = { secondary: 'secondary', success: 'success', info: 'info', warn: 'warning', warning: 'warning', danger: 'destructive', contrast: 'contrast' };

    const props = withDefaults(defineProps<{ value?: string | number; severity?: Severity; class?: string }>(), { value: undefined, severity: undefined, class: undefined });
</script>

<template>
    <span :class="cn('relative inline-flex', props.class)" data-slot="overlay-badge">
        <slot />
        <Badge :variant="props.severity ? variants[props.severity] : 'default'" :class="cn('absolute -top-1 -right-1 min-w-5 justify-center px-1', props.value === undefined && 'size-2.5 min-w-0 p-0')" data-slot="overlay-badge-badge">{{
            props.value ?? ''
        }}</Badge>
    </span>
</template>
