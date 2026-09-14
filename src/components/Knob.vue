<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { cn } from '@/lib/utils';
    import { angleToValue, clampStep, knobArc } from './knob-math';

    const props = withDefaults(
        defineProps<{
            min?: number;
            max?: number;
            step?: number;
            size?: number;
            strokeWidth?: number;
            valueColor?: string;
            rangeColor?: string;
            textColor?: string;
            valueTemplate?: string;
            readonly?: boolean;
            disabled?: boolean;
            showValue?: boolean;
            class?: string;
        }>(),
        { min: 0, max: 100, step: 1, size: 100, strokeWidth: 14, valueColor: 'var(--primary)', rangeColor: 'var(--muted)', textColor: 'var(--foreground)', valueTemplate: '{value}', readonly: false, disabled: false, showValue: true, class: undefined }
    );

    const model = defineModel<number>({ default: 0 });
    const inert = computed(() => props.readonly || props.disabled);
    const radius = 40;
    const arc = computed(() => knobArc({ value: clampStep(model.value, props.min, props.max, props.step), min: props.min, max: props.max, radius }));
    const label = computed(() => props.valueTemplate.replace('{value}', String(model.value)));

    function set(value: number): void {
        const next = clampStep(value, props.min, props.max, props.step);
        if (next !== model.value) model.value = next;
    }

    const svg = ref<SVGSVGElement | null>(null);
    let dragging = false;

    function fromPointer(event: PointerEvent): void {
        const rect = svg.value?.getBoundingClientRect();
        if (!rect) return;
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = rect.height / 2 - (event.clientY - rect.top);
        const value = angleToValue(Math.atan2(dy, dx), props.min, props.max, props.step);
        if (value !== undefined) set(value);
    }

    function onPointerDown(event: PointerEvent): void {
        if (inert.value) return;
        dragging = true;
        svg.value?.setPointerCapture?.(event.pointerId);
        fromPointer(event);
    }

    function onPointerMove(event: PointerEvent): void {
        if (dragging) fromPointer(event);
    }

    function onPointerUp(): void {
        dragging = false;
    }

    function onKeydown(event: KeyboardEvent): void {
        if (inert.value) return;
        const steps: Record<string, number> = { ArrowUp: props.step, ArrowRight: props.step, ArrowDown: -props.step, ArrowLeft: -props.step, PageUp: props.step * 10, PageDown: -props.step * 10 };
        if (event.key === 'Home') set(props.min);
        else if (event.key === 'End') set(props.max);
        else if (event.key in steps) set(model.value + steps[event.key]!);
        else return;
        event.preventDefault();
    }
</script>

<template>
    <div :class="cn('inline-flex', props.class)" data-slot="knob">
        <svg
            ref="svg"
            viewBox="0 0 100 100"
            :width="props.size"
            :height="props.size"
            role="slider"
            :tabindex="inert ? -1 : 0"
            :aria-valuemin="props.min"
            :aria-valuemax="props.max"
            :aria-valuenow="model"
            :aria-valuetext="label"
            :aria-disabled="props.disabled || undefined"
            :aria-readonly="props.readonly || undefined"
            :class="cn('rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring', inert ? 'cursor-default' : 'cursor-pointer')"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @keydown="onKeydown"
        >
            <path :d="arc.rangePath" :stroke-width="props.strokeWidth" :stroke="props.rangeColor" fill="none" stroke-linecap="round" />
            <path :d="arc.valuePath" :stroke-width="props.strokeWidth" :stroke="props.valueColor" fill="none" stroke-linecap="round" />
            <text v-if="props.showValue" x="50" y="57" text-anchor="middle" :fill="props.textColor" class="text-[1.1rem] font-medium" data-slot="knob-value">{{ label }}</text>
        </svg>
    </div>
</template>
