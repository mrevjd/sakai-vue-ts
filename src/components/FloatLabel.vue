<script setup lang="ts">
    import { onMounted, onUpdated, ref } from 'vue';
    import { cn } from '@/lib/utils';

    // :placeholder-shown only matches an input that has a non-empty placeholder, so the component
    // sets placeholder=" " (one space) on any wrapped control that lacks one; the label then sits
    // inside the control until focus or a value lifts it, matching PrimeVue's three variants.
    const props = withDefaults(defineProps<{ variant?: 'over' | 'in' | 'on'; class?: string }>(), { variant: 'over', class: undefined });

    const root = ref<HTMLDivElement | null>(null);

    function ensurePlaceholders(): void {
        root.value?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach((control) => {
            if (!control.getAttribute('placeholder')) control.setAttribute('placeholder', ' ');
        });
    }

    // onUpdated as well because the slot can re-render and hand back a fresh input without the attribute.
    onMounted(ensurePlaceholders);
    onUpdated(ensurePlaceholders);
</script>

<template>
    <div
        ref="root"
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
