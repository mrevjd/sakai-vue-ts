<script setup lang="ts">
    import { computed } from 'vue';
    import { cn } from '@/lib/utils';

    // The native colour input replaces PrimeVue's canvas picker: the OS dialog is the overlay, and
    // inline renders the same control as a large swatch. Values are hex with a leading hash.
    const props = withDefaults(defineProps<{ inline?: boolean; disabled?: boolean; class?: string }>(), { inline: false, disabled: false, class: undefined });
    const model = defineModel<string>({ default: '#000000' });

    const normalised = computed(() => {
        const raw = model.value.trim().replace(/^#/, '').toLowerCase();
        return /^[0-9a-f]{6}$/.test(raw) ? `#${raw}` : '#000000';
    });

    function onInput(event: Event): void {
        model.value = (event.target as HTMLInputElement).value;
    }
</script>

<template>
    <span :class="cn('inline-flex', props.class)" data-slot="color-picker" :data-inline="props.inline || undefined">
        <input
            type="color"
            :value="normalised"
            :disabled="props.disabled"
            :class="cn('cursor-pointer rounded-md border border-input bg-transparent p-0.5', props.inline ? 'size-24' : 'size-8', props.disabled && 'cursor-not-allowed opacity-50')"
            @input="onInput"
        />
    </span>
</template>
