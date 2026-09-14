<script setup lang="ts">
    import { cn } from '@/lib/utils';

    // The wrapped input needs placeholder=" " (one space) so :placeholder-shown tracks emptiness; the
    // label sits inside the control until focus or a value lifts it, matching PrimeVue's three variants.
    const props = withDefaults(defineProps<{ variant?: 'over' | 'in' | 'on'; class?: string }>(), { variant: 'over', class: undefined });
</script>

<template>
    <div
        :class="
            cn(
                'relative [&>label]:pointer-events-none [&>label]:absolute [&>label]:left-3 [&>label]:top-1/2 [&>label]:-translate-y-1/2 [&>label]:text-muted-foreground [&>label]:transition-all [&>label]:duration-200',
                props.variant === 'over' &&
                    '[&:has(input:focus)>label]:-top-2 [&:has(input:focus)>label]:bg-background [&:has(input:focus)>label]:px-1 [&:has(input:focus)>label]:text-xs [&:has(input:not(:placeholder-shown))>label]:-top-2 [&:has(input:not(:placeholder-shown))>label]:bg-background [&:has(input:not(:placeholder-shown))>label]:px-1 [&:has(input:not(:placeholder-shown))>label]:text-xs [&:has(input:not(:placeholder-shown))>label]:translate-y-0 [&:has(input:focus)>label]:translate-y-0',
                props.variant === 'in' &&
                    '[&>input]:h-12 [&>input]:pt-5 [&:has(input:focus)>label]:top-2 [&:has(input:focus)>label]:translate-y-0 [&:has(input:focus)>label]:text-xs [&:has(input:not(:placeholder-shown))>label]:top-2 [&:has(input:not(:placeholder-shown))>label]:translate-y-0 [&:has(input:not(:placeholder-shown))>label]:text-xs',
                props.variant === 'on' &&
                    '[&:has(input:focus)>label]:-top-2 [&:has(input:focus)>label]:translate-y-0 [&:has(input:focus)>label]:bg-background [&:has(input:focus)>label]:px-1 [&:has(input:focus)>label]:text-xs [&:has(input:not(:placeholder-shown))>label]:-top-2 [&:has(input:not(:placeholder-shown))>label]:translate-y-0 [&:has(input:not(:placeholder-shown))>label]:bg-background [&:has(input:not(:placeholder-shown))>label]:px-1 [&:has(input:not(:placeholder-shown))>label]:text-xs',
                props.class
            )
        "
        data-slot="float-label"
        :data-variant="props.variant"
    >
        <slot />
    </div>
</template>
