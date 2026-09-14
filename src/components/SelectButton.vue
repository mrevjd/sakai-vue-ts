<script setup lang="ts">
    import type { AcceptableValue } from 'reka-ui';
    import { computed } from 'vue';
    import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
    import { cn } from '@/lib/utils';
    import { optionLabel as labelOf, optionValue as valueOf, sameOption } from '@/utils/optionAccess';

    const props = withDefaults(
        defineProps<{
            options: unknown[];
            optionLabel?: string;
            optionValue?: string;
            multiple?: boolean;
            allowEmpty?: boolean;
            disabled?: boolean;
            class?: string;
        }>(),
        { optionLabel: undefined, optionValue: undefined, multiple: false, allowEmpty: true, disabled: false, class: undefined }
    );

    // No `default: null`: Vue only accepts a factory default for an `unknown` model, and unknown already covers undefined.
    const model = defineModel<unknown>();

    // ToggleGroup speaks strings; option index is the string, so any option shape works.
    const selected = computed<string | string[] | undefined>(() => {
        const index = (value: unknown): string | undefined => {
            const position = props.options.findIndex((option) => sameOption(valueOf(option, props.optionValue), value, props.optionValue ? undefined : props.optionLabel));
            return position >= 0 ? String(position) : undefined;
        };
        if (props.multiple) return (Array.isArray(model.value) ? model.value : []).map(index).filter((i): i is string => i !== undefined);
        return model.value === null || model.value === undefined ? undefined : index(model.value);
    });

    // Reka types the payload as its AcceptableValue; only the index strings this component hands it ever come back.
    function onUpdate(value: AcceptableValue | AcceptableValue[] | undefined): void {
        if (props.multiple) {
            model.value = (Array.isArray(value) ? value : []).map((i) => valueOf(props.options[Number(i)], props.optionValue));
            return;
        }
        if (value === undefined || value === null || value === '') {
            if (props.allowEmpty) model.value = null;
            return;
        }
        model.value = valueOf(props.options[Number(value)], props.optionValue);
    }
</script>

<template>
    <ToggleGroup :type="props.multiple ? 'multiple' : 'single'" variant="outline" :model-value="selected" :disabled="props.disabled" :class="cn(props.class)" data-slot="select-button" @update:model-value="onUpdate">
        <ToggleGroupItem v-for="(option, index) in props.options" :key="index" :value="String(index)" :aria-label="labelOf(option, props.optionLabel)">
            <slot name="option" :option="option" :index="index">{{ labelOf(option, props.optionLabel) }}</slot>
        </ToggleGroupItem>
    </ToggleGroup>
</template>
