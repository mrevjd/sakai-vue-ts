<script setup lang="ts">
    import { computed, type ComponentPublicInstance, type HTMLAttributes } from 'vue';
    import { IconStar } from '@/components/icons';
    import { cn } from '@/lib/utils';

    const props = withDefaults(
        defineProps<{
            stars?: number;
            readonly?: boolean;
            disabled?: boolean;
            class?: HTMLAttributes['class'];
        }>(),
        { stars: 5, readonly: false, disabled: false, class: undefined }
    );

    const model = defineModel<number | null>({ default: null });

    const inert = computed(() => props.readonly || props.disabled);
    // A non-finite stars count (NaN from a bad template expression, say) would otherwise render an empty group; fall back to the default.
    const values = computed(() => Array.from({ length: Number.isFinite(props.stars) ? Math.max(1, Math.floor(props.stars)) : 5 }, (_, index) => index + 1));

    // Keyed by star value rather than an array ref because Vue does not guarantee array-ref order.
    const buttons = new Map<number, HTMLButtonElement>();

    function setButton(value: number, el: Element | ComponentPublicInstance | null): void {
        if (el instanceof HTMLButtonElement) buttons.set(value, el);
        else buttons.delete(value);
    }

    function select(value: number): void {
        if (inert.value) return;
        // Clicking the current value again clears the rating; PrimeVue keeps it, so this is the one documented difference.
        model.value = model.value === value ? null : value;
    }

    function onKeydown(event: KeyboardEvent): void {
        if (inert.value) return;
        const current = model.value ?? 0;
        let next: number | null = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(values.value.length, current + 1);
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(1, current - 1);
        if (next === null) return;
        // Cancel the arrow key even at the ends of the range so the page does not scroll under a focused group.
        event.preventDefault();
        if (next === current) return;
        model.value = next;
        // The ARIA radiogroup pattern moves focus with the checked radio, and the map avoids waiting on a parent to echo the v-model before the tabindex updates.
        buttons.get(next)?.focus();
    }
</script>

<template>
    <div role="radiogroup" :aria-disabled="props.disabled || undefined" :aria-readonly="props.readonly || undefined" :class="cn('inline-flex items-center gap-1', inert && 'cursor-default', props.class)" data-slot="star-rating" @keydown="onKeydown">
        <button
            v-for="value in values"
            :key="value"
            :ref="(el) => setButton(value, el)"
            type="button"
            role="radio"
            :aria-checked="model === value"
            :aria-label="`${value} of ${values.length}`"
            :data-filled="model !== null && value <= model"
            :tabindex="inert ? -1 : model === value || (model === null && value === 1) ? 0 : -1"
            :disabled="props.disabled"
            :class="cn('rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring', inert ? 'cursor-default' : 'cursor-pointer')"
            @click="select(value)"
        >
            <IconStar :class="cn('size-5 transition-colors', model !== null && value <= model ? 'fill-primary text-primary' : 'text-muted-foreground')" />
        </button>
    </div>
</template>
