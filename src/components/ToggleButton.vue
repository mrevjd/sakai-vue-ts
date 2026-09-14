<script setup lang="ts">
    import type { Component } from 'vue';
    import { Toggle } from '@/components/ui/toggle';
    import { cn } from '@/lib/utils';

    const props = withDefaults(
        defineProps<{
            onLabel?: string;
            offLabel?: string;
            onIcon?: Component;
            offIcon?: Component;
            disabled?: boolean;
            class?: string;
        }>(),
        { onLabel: 'Yes', offLabel: 'No', onIcon: undefined, offIcon: undefined, disabled: false, class: undefined }
    );
    const model = defineModel<boolean>({ default: false });
</script>

<template>
    <Toggle v-model="model" variant="outline" :disabled="props.disabled" :class="cn('gap-2', props.class)" data-slot="toggle-button">
        <component :is="model ? props.onIcon : props.offIcon" v-if="model ? props.onIcon : props.offIcon" class="size-4" />
        {{ model ? props.onLabel : props.offLabel }}
    </Toggle>
</template>
